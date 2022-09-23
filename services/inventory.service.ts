import httpStatusCodes from 'http-status-codes';
import inventoryRepo from '../repos/inventory.repo';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import Logger from '../config/logger';
import helperFunctions from '../utils/helper';
import contractRepo from '../repos/contract.repo';
import httpClient from '../utils/httpclient';
import { redisClient } from '../app';
import {
  PLAYER_CACHE_PREFIX,
  CONTRACT_PRIVATE_KEY,
  INVENTORY_MIN_ID,
  INVENTORY_MAX_ID,
  PLAYER_SMART_CONTRACT_ID,
  REWARD_SMART_CONTRACT_ID,
} from '../utils/constants';

const ethers = require('ethers');

const getAllInventory = async () => {
  Logger.info('InventoryService:getAllInventory(): - start');

  const result = await inventoryRepo.getAllInventory();

  Logger.info('InventoryService:getAllInventory(): - end');

  return result;
};

const getActiveInventory = async () => {
  Logger.info('InventoryService:getActiveInventory(): - start');

  const result = await inventoryRepo.getActiveInventory();

  Logger.info('InventoryService:getActiveInventory(): - end');

  return result;
};

const getInventoryById = async (id: number) => {
  Logger.info('InventoryService:getInventoryById(): - start');

  const result = await inventoryRepo.getInventoryById(id);

  Logger.info('InventoryService:getInventoryById(): - end');

  return result;
};

const getInventoryByType = async (type: string) => {
  Logger.info('InventoryService:getInventoryByType(): - start');

  const result = await inventoryRepo.getInventoryByType(type);

  Logger.info('InventoryService:getInventoryByType(): - end');

  return result;
};

const getMetaDataByIdAndType = async (id: number, type: string) => {
  Logger.info('InventoryService:getMetaDataByIdAndType(): - start');

  const result = await inventoryRepo.getInventoryByIdAndType(id, type);

  Logger.info('InventoryService:getMetaDataByIdAndType(): - end');

  return result ? result.dataValues.metaData : {};
};
/**
 * getRandomReward is a function which will return a random reward which then be assigned to the player.
 * @param  none
 * @returns the metaData of the reward
 */
const getRandomReward = async () => {
  Logger.info('InventoryService:getRandomReward(): - start');

  const id = helperFunctions.getRandomNumber(INVENTORY_MIN_ID, INVENTORY_MAX_ID);
  const result = await inventoryRepo.getInventoryById(id);

  Logger.info('InventoryService:getRandomReward(): - end');

  if (result) {
    return result.dataValues.metaData;
  } else {
    Logger.error(`InventoryService:getRandomReward(): ${locale.INVENTORY_NOT_FOUND_AGAINST_ID({ id })}`);
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.INVENTORY_NOT_FOUND_AGAINST_ID({ id }),
      httpStatusCodes.BAD_REQUEST,
    );
  }
};

/**
 * getRewardsByPlayerAddress is a function which will return player unclaimed rewards from player state and claimed rewards from block chain.
 * @param  playerAddress
 * @returns player unclaimed and claimed rewards
 */
const getRewardsByPlayerAddress = async (playerAddress: string) => {
  Logger.info('InventoryService:getRewardsByPlayer(): - start');

  const customHttpProvider = new ethers.providers.JsonRpcProvider(process.env.BLOCK_CHAIN_API_URL);

  let unclaimedRewardJson = [];
  let claimedRewardJson = [];

  try {
    //First check if the player state exists in cache
    //get player state from redis cache
    let data = await redisClient.get(PLAYER_CACHE_PREFIX.concat(playerAddress));

    if (!data) {
      // if no data exists in cache then call the contract method to get the latest player state
      const contractDetails = await contractRepo.getContractById(PLAYER_SMART_CONTRACT_ID);

      const contract = new ethers.Contract(
        contractDetails.contractAddress,
        contractDetails.contractAbi,
        customHttpProvider,
      );
      // call the getPlayerInfo method to get the latest player state hash
      const getPlayerInfo = await contract.getPlayerInfo(playerAddress);

      if (getPlayerInfo.ipfsHash) {
        // connect to ipfs server to get the state data against the hash
        data = await httpClient.get(process.env.PINATA_GET_URL.concat(getPlayerInfo.ipfsHash));

        // data found
        if (data) {
          try {
            //set the state data in cache
            await redisClient.set(PLAYER_CACHE_PREFIX.concat(playerAddress), JSON.stringify(data));
          } catch (e) {
            data = null;
            Logger.error(`InventoryService:getRewardsByPlayer(): ${e.message}`);
          }
        }
      }
    }

    // if no data found in cache or smart contract then it means the player state does not exists
    if (data) {
      //stupid thing to do but doing it anyways
      const playerState = JSON.parse(JSON.stringify(data));
      //Set the unclaimedRewardJson from PlayerState
      if (playerState.player_inventory?.length > 0) {
        //means player state and inventory exists
        unclaimedRewardJson = playerState.player_inventory;
        // count the unique rewards
        unclaimedRewardJson = [
          ...unclaimedRewardJson
            .reduce((r, e) => {
              let k = `${e.id}`;
              if (!r.has(k)) r.set(k, { ...e, count: 1 });
              else r.get(k).count++;
              return r;
            }, new Map())
            .values(),
        ];
      }
    }

    // Now get the claimed rewards by the player from smart contract
    const contractDetail = await contractRepo.getContractById(REWARD_SMART_CONTRACT_ID);

    const rewardContract = new ethers.Contract(
      contractDetail.contractAddress,
      contractDetail.contractAbi,
      customHttpProvider,
    );
    // call the getRewardsByAddress method to get the latest player state hash
    const claimedRewards = await rewardContract.getRewardsByAddress(playerAddress);

    if (claimedRewards.length > 0) {
      for (let counter in claimedRewards) {
        const rewardCopy = Number(claimedRewards[counter].rewardCopies.toString());
        const rewardId = Number(claimedRewards[counter].rewardId.toString());
        //Call the method to get the reward metaData against the reward id
        const rewardResult = await inventoryRepo.getInventoryById(rewardId);
        if (rewardResult) {
          const rewardMetaData = rewardResult.dataValues.metaData;
          rewardMetaData.count = rewardCopy;
          claimedRewardJson.push(rewardMetaData);
        }
      }
    }
  } catch (e) {
    Logger.error(`InventoryService:getRewardsByPlayer(): ${e.message}`);
  }

  Logger.info('InventoryService:getRewardsByPlayer(): - end');
  // return the player unclaimed and claimed rewards
  return { unclaimed: unclaimedRewardJson, claimed: claimedRewardJson };
};

/**
 * MintReward is a function which will mint the rewards to the player address marking them as clained.
 * @param  address
 * @param rewardIds
 * @returns minted hash
 */
const mintRewards = async (address: string, rewardIds: number[]) => {
  Logger.info('InventoryService:mintRewards(): - start');

  const customHttpProvider = new ethers.providers.JsonRpcProvider(process.env.BLOCK_CHAIN_API_URL);
  let txnHash = null;
  //check if rewardIds array is present
  if (rewardIds && rewardIds.length > 0) {
    // if array is valid then start processing
    // connect to wallet
    let wallet = new ethers.Wallet(CONTRACT_PRIVATE_KEY, customHttpProvider);
    const contractDetail = await contractRepo.getContractById(REWARD_SMART_CONTRACT_ID);

    const contractWithSigner = new ethers.Contract(contractDetail.contractAddress, contractDetail.contractAbi, wallet);

    // if a single reward is minted
    if (rewardIds.length == 1) {
      const rewardId = rewardIds[0];

      //remove the unclaimed rewards from player state inventory
      const data = await redisClient.get(PLAYER_CACHE_PREFIX.concat(address));
      const playerState = JSON.parse(data);

      if (playerState.player_inventory?.length > 0) {
        //means player state and inventory exists
        const playerInventory = playerState.player_inventory;

        const rewardExists = helperFunctions.removeFromJsonArrayById(playerInventory, rewardId);
        // if reward exists as unclaimed then process otherwise give an error that player does not have the reward
        if (rewardExists) {
          // if lenght is one means there is only one reward to mint so calling the single mint function to mint against a single copy
          const assignRewardToPlayer = await contractWithSigner.mintReward(rewardId, 1, address);
          txnHash = assignRewardToPlayer.hash;

          //set with the reward removed from the unclaimed inventory of the player
          playerState.player_inventory = playerInventory;

          //Set the latest in cache
          await redisClient.set(PLAYER_CACHE_PREFIX.concat(address), JSON.stringify(playerState));
        } else {
          Logger.error(
            `InventoryService:mintRewards(): ${locale.PLAYER_HAS_NO_REWARD_AGAINST_REWARD_ID({ id: rewardId })}`,
          );
          throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            locale.PLAYER_HAS_NO_REWARD_AGAINST_REWARD_ID({ id: rewardId }),
            httpStatusCodes.BAD_REQUEST,
          );
        }
      }
    } else {
      // there are multiple rewardIds with the same id so need to find the duplicates of those ids
      // and generate a single id with the copies

      const rewardIdsCount = (ids) => ids.reduce((a, b) => ({ ...a, [b]: (a[b] || 0) + 1 }), {}); // don't forget to initialize the accumulator
      const rewardIdArray: number[] = [];
      const rewardCountArray: number[] = [];

      // call the method to get the distinct reward ids along with thier counts
      const rewards = rewardIdsCount(rewardIds);

      // seperate the ids and count so that they can be passed seperatley to the contract method
      for (const key of Object.keys(rewards)) {
        rewardIdArray.push(Number(key));
      }
      for (const value of Object.values(rewards)) {
        rewardCountArray.push(Number(value));
      }

      //remove the unclaimed reward from player state inventory and update the player state
      const data = await redisClient.get(PLAYER_CACHE_PREFIX.concat(address));
      const playerState = data ? JSON.parse(data) : {};

      if (playerState.player_inventory?.length > 0) {
        // means player state and inventory exists
        const playerInventory = playerState.player_inventory;

        // loop through the arrays and remove the rewardIds from the player state against the no of copies against the rewardId
        for (let counter in rewardIdArray) {
          for (let i = 0; i < rewardCountArray[counter]; i++) {
            const rewardDeleted = helperFunctions.removeFromJsonArrayById(
              playerInventory,
              Number(rewardIdArray[counter]),
            );
            if (!rewardDeleted) {
              Logger.error(
                `InventoryService:mintRewards(): ${locale.PLAYER_HAS_NO_REWARD_AGAINST_REWARD_ID({
                  id: rewardIdArray[counter],
                })}`,
              );
              throw new ApiError(
                httpStatusCodes.BAD_REQUEST,
                locale.PLAYER_HAS_NO_REWARD_AGAINST_REWARD_ID({ id: rewardIdArray[counter] }),
                httpStatusCodes.BAD_REQUEST,
              );
            }
          }
        }

        //set with the rewards removed from the unclaimed inventory of the player
        playerState.player_inventory = playerInventory;

        //Set the latest in cache
        await redisClient.set(PLAYER_CACHE_PREFIX.concat(address), JSON.stringify(playerState));
      } else {
        Logger.error(`InventoryService:mintRewards(): ${locale.INVENTORY_NOT_EXIST}`);
        throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.INVENTORY_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
      }

      // call the contract method to mint the rewards against the player address
      const assignRewardToPlayer = await contractWithSigner.mintRewardsOnAddress(
        rewardIdArray,
        rewardCountArray,
        address,
      );
      //set the hash returned
      txnHash = assignRewardToPlayer.hash;

      Logger.info('InventoryService:mintRewards(): - end');
    }
  }

  // return the hash
  return { txnHash };
};
export default {
  getAllInventory,
  getActiveInventory,
  getInventoryById,
  getInventoryByType,
  getRandomReward,
  getRewardsByPlayerAddress,
  getMetaDataByIdAndType,
  mintRewards,
};
