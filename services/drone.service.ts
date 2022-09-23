import droneRepo from '../repos/drone.repo';
import contractRepo from '../repos/contract.repo';
import httpStatusCodes from 'http-status-codes';
import Logger from '../config/logger';
import helperFunctions from '../utils/helper';
import { create } from 'ipfs-http-client';
import contractAbi from '../artifacts/DroneContract_metadata.json';
import {
  ADMIN_ADDRESS,
  DRONES_CONTRACT_ADDRESS,
  DRONES_SMART_CONTRACT_ID,
  PLAYER_CACHE_PREFIX,
  UPDATE_PLAYER_STATE_ROUTE,
  WALLET_PRIVATE_KEY,
} from '../utils/constants';
import { redisClient } from '../app';
import httpClient from '../utils/httpclient';
import locale from '../utils/locale';
import { ApiError } from '../utils/ApiError';

const ethers = require('ethers');
const customHttpProvider = new ethers.providers.JsonRpcProvider(process.env.BLOCK_CHAIN_API_URL);

/**
 * buyDrone is a function which will return all drones.
 * @returns drones returned
 */
/*
const buyDrones = async (droneId: string) => {
  Logger.info('DroneService:getDrones(): - start');
  //var pvtKey = '';
  //const wallet = new ethers.Wallet(pvtKey, customHttpProvider);
  const contract = new ethers.Contract(DRONES_CONTRACT_ADDRESS, contractAbi.output.abi, signer);
  var droneInfo = {};
  try {
    const buyResult = await contract.buyDrone(droneId, { value: amount });
    droneInfo = await contract.getDroneInfo(droneId);
  } catch (ex) {
    console.log(ex);
  }

  return droneInfo;
  //return { results: droneList, page: page, totalPages: totalPages, total: total };
};

/**
 * buyDrone is a function which will return all drones.
 * @returns drones returned
 */
const markDroneForSale = async (droneId: string, price: string) => {
  Logger.info('DroneService:markDroneForSale(): - start');
  const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, customHttpProvider);
  const contract = new ethers.Contract(DRONES_CONTRACT_ADDRESS, contractAbi.output.abi, wallet);
  let droneInfo = {};
  try {
    await contract.updateDroneToSale(droneId, ethers.utils.parseEther(price));
    droneInfo = await contract.getDroneInfo(droneId);
  } catch (ex) {
    Logger.error(`DroneService:markDroneForSale: ${ex}`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.GENERAL_TECHNICAL_ERROR, httpStatusCodes.BAD_REQUEST);
  }
  Logger.info('DroneService:markDroneForSale(): - end');
  return droneInfo;
};

/**
 * getDrones is a function which will return all drones.
 * @returns drones returned
 */
const getDrones = async (playerAddress: string, page: number, size: number) => {
  Logger.info('DroneService:getDrones(): - start');
  page = page || 1;
  size = size || Number.MAX_SAFE_INTEGER;
  const total = await droneRepo.getAllDroneCount();
  //get total number of pages
  const totalPages = Math.ceil(total / size);

  /* Player Drones fetching-Start*/
  const freeDronesResult = await droneRepo.getDrones(page, size);
  const ipfs = create({ url: process.env.IPFS_NODE_URL });
  let freeDroneList = [];

  const freeCacheList = await redisClient.get('freeDrones');
  if (freeCacheList) {
    freeDroneList = JSON.parse(freeCacheList);
  } else {
    for (let i = 0; i < freeDronesResult.length; i++) {
      try {
        const CID = freeDronesResult[i].dataValues.droneCID;
        for await (const data of ipfs.cat(CID)) {
          const raw = Buffer.from(data).toString('utf8');
          const jsonObj = helperFunctions.isValidJSONObject(raw);
          if (jsonObj) {
            jsonObj.attributes.push({
              trait_type: 'drone_id',
              value: freeDronesResult[i].dataValues.id,
            });

            freeDroneList.push(jsonObj);
          }
        }
      } catch (ex) {
        Logger.error(`Error found: ${ex} `);
      }
    }
    await redisClient.set('freeDrones', JSON.stringify(freeDroneList));
  }
  /* Free Drones fetching-End*/
  const contractDetails = await contractRepo.getContractById(DRONES_SMART_CONTRACT_ID);

  const contract = new ethers.Contract(
    contractDetails.contractAddress,
    contractDetails.contractAbi,
    customHttpProvider,
  );

  /* Player Drones fetching-Start*/
  let allDroneList = [];
  const allCacheList = await redisClient.get('availableDrones');
  if (allCacheList) {
    allDroneList = JSON.parse(allCacheList);
  } else {
    const allDronesResult = await contract.getDronesByAddress(ADMIN_ADDRESS);
    for (let i = 0; i < allDronesResult.length; i++) {
      try {
        const CID = allDronesResult[i].metadataHash;

        for await (const data of ipfs.cat(CID)) {
          const raw = Buffer.from(data).toString('utf8');
          let jsonObj = helperFunctions.isValidJSONObject(raw);
          if (jsonObj) {
            jsonObj.attributes.push({
              trait_type: 'drone_id',
              value: allDronesResult[i].droneID._hex,
            });

            allDroneList.push(jsonObj);
          }
        }
      } catch (ex) {
        Logger.error(`Error found: ${ex} `);
      }
    }
    await redisClient.set('availableDrones', JSON.stringify(allDroneList));
  }
  /* Player Drones available-End*/

  /* Player Drones fetching-Start*/
  let playerDroneList = [];
  if (playerAddress) {
    let playerCacheState = JSON.parse(await redisClient.get(PLAYER_CACHE_PREFIX.concat(playerAddress)));

    if (playerCacheState && playerCacheState.ownedDrones?.length > 0) {
      playerDroneList = playerCacheState.ownedDrones;
    } else {
      const playerDrones = await contract.getDronesByAddress(playerAddress);
      for (let i = 0; i < playerDrones.length; i++) {
        try {
          const CID = playerDrones[i].metadataHash;

          for await (const data of ipfs.cat(CID)) {
            const raw = Buffer.from(data).toString('utf8');
            let jsonObj = helperFunctions.isValidJSONObject(raw);
            if (jsonObj) {
              jsonObj.attributes.push({
                trait_type: 'drone_id',
                value: playerDrones[i].droneID._hex,
              });
              playerDroneList.push(jsonObj);
            }
          }
        } catch (ex) {
          Logger.error(`Error found: ${ex} `);
        }
      }
      playerCacheState = playerCacheState ? playerCacheState : {};
      playerCacheState.ownedDrones = playerDroneList;
      playerDroneList = playerDroneList;
      let jsonData = {
        playerAddress: playerAddress,
        playerState: playerCacheState,
        playerScore: 100,
      };
      try {
        httpClient.post(process.env.MV_PLAYER_URL.concat(UPDATE_PLAYER_STATE_ROUTE), jsonData);
      } catch (ex) {
        Logger.error(`Error found: ${ex} `);
      }
    }
  }

  /* Player Drones fetching-End*/
  return { freeDrones: freeDroneList, availableDrones: allDroneList, playerDrones: playerDroneList };
};

export default {
  getDrones,
  // buyDrones,
  markDroneForSale,
};
