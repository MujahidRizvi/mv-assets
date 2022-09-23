import httpStatusCodes from 'http-status-codes';
import contractRepo from '../repos/contract.repo';
import assetRepo from '../repos/asset.repo';
import whiteListUserRepo from '../repos/whitelist-user.repo';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import helperFunctions from '../utils/helper';
import Logger from '../config/logger';
import util from 'util';
import fs from 'fs';
import {
  LAND_CONTRACT_MANAGER_KEY,
  CONTRACT_BLOCK_CHAIN_API_URL,
  DEFAULT_IMAGE_FILE_NAME,
  DEFAULT_ANIMATION_FILE_NAME,
  LAND_SMART_CONTRACT_ID,
  OBJECT_SMART_CONTRACT_ID,
  LAND_CONTRACT_MINTER_KEY,
  OBJECT_CONTRACT_MINTER_KEY,
} from '../utils/constants';
import { UserType, AssetType } from '../utils/enums';
import pinataFunction from '../utils/pinata';
const ethers = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const unlinkFile = util.promisify(fs.unlink);
const customHttpProvider = new ethers.providers.JsonRpcProvider(CONTRACT_BLOCK_CHAIN_API_URL);

/**
 * buildWhiteListUsers function will be called to build users with whitelist
 * @param contractId
 * @param mintLimit
 * @returns file
 * @returns
 */

const buildWhiteListUsers = async (contractId: number, file) => {
  // Get the contract passed it and created the contract obj for creation
  Logger.info('Smart-Contract-Service:buildWhiteListUsers(): - start');

  let fileDataArr;
  const whitelistAddresses = [];
  const usersList = [];

  try {
    let fileData = fs.readFileSync(file.path).toString();
    fileDataArr = fileData.slice(1, -1).split(',');
    //delete the file
    await unlinkFile(file.path);
  } catch (ex) {
    //delete the file
    await unlinkFile(file.path);
    Logger.error(`Smart-Contract-Service:buildWhiteListUsers(): ${ex}`);
    Logger.info('Smart-Contract-Service:buildWhiteListUsers(): - end');
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.UPLOAD_FILE_PROCESSING_ERROR, httpStatusCodes.BAD_REQUEST);
  }

  // delete all existing records from table and reset the id
  await whiteListUserRepo.deleteAll(contractId);

  for (const addr of fileDataArr) {
    let userBody: any = {};
    //call to the check by method
    const user = helperFunctions.encrypt(addr);
    userBody.contractId = contractId;
    userBody.user = user;
    usersList.push(userBody);
  }

  //bulk insert user encrypted addresses in database
  if (usersList.length > 0) await whiteListUserRepo.createUpdateWhiteListUserBulk(usersList);

  //get all the users against the contract
  const whiteListUsers = await whiteListUserRepo.getwhiteListUsersByContractId(contractId);
  //Now makeup the merkle tree

  for (const whiteListUser of whiteListUsers) {
    whitelistAddresses.push(helperFunctions.decrypt(whiteListUser.dataValues.user));
  }

  const leafNodes = whitelistAddresses.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  const rootHash = `0x${merkleTree.getRoot().toString('hex')}`;

  //store the rootHash in DB against it
  const contract = await contractRepo.updateMerkleHash(contractId, rootHash);

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const landContract = new ethers.Contract(contract.contractAddress, contract.contractAbi, wallet);
  try {
    // mint will be count of users coming from the file
    const result = await landContract.updateWhitelistUsers(whitelistAddresses.length, rootHash);

    Logger.info('Smart-Contract-Service:buildWhiteListUsers(): - end');
    return { hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:buildWhiteListUsers(): ${ex}`);
    Logger.info('Smart-Contract-Service:buildWhiteListUsers(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * verifyWhiteListUser function will be called on before the whitelist user tries to mint. we need to verify if it is able to mint the land or not
 * @param contractId
 * @param userAddress
 * @returns hexProof
 * @returns verified
 */
const verifyWhiteListUser = async (contractId: number, userAddress: string) => {
  Logger.info('Smart-Contract-Service:verifyWhiteListUser(): - start');

  const whitelistAddresses = [];

  //get all the users against the contract
  let whiteListUsers = await whiteListUserRepo.getwhiteListUsersByContractId(contractId);
  //Now makeup the merkle tree

  for (const whiteListUser of whiteListUsers) {
    whitelistAddresses.push(helperFunctions.decrypt(whiteListUser.dataValues.user));
  }

  const leafNodes = whitelistAddresses.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  const rootHash = merkleTree.getRoot();

  //pass in the userAddress to generate hexProof
  const claimingAddress = keccak256(userAddress);
  const hexProof = merkleTree.getHexProof(claimingAddress);
  const verified = merkleTree.verify(hexProof, claimingAddress, rootHash);

  Logger.info('Smart-Contract-Service:buildWhiteListUsers(): - end');
  return { hexProof, verified };
};

const updatePauseStatus = async (contractId: number, status: boolean) => {
  Logger.info('Smart-Contract-Service:updatePauseStatus(): - start');
  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const result = await contract.updateContractPauseStatus(status);

    Logger.info('Smart-Contract-Service:updatePauseStatus(): - end');
    return { status, hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:updatePauseStatus: ${ex}`);
    Logger.info('Smart-Contract-Service:updatePauseStatus(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const getPauseStatus = async (contractId: number) => {
  Logger.info('Smart-Contract-Service:updatePauseStatus(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const status = await contract.paused();
    Logger.info('Smart-Contract-Service:updatePauseStatus(): - end');
    return { status };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:updatePauseStatus: ${ex}`);
    Logger.info('Smart-Contract-Service:updatePauseStatus(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * updateMintingStatus will get the minting status of the contract by calling the smart contract method
 * @param status
 * @returns status and hash of the mint
 */

const updateMintingStatus = async (contractId: number, status: boolean) => {
  Logger.info('Smart-Contract-Service:updateMintingStatus(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const result = await contract.updateMintingStatus(status);

    Logger.info('Smart-Contract-Service:updateMintingStatus(): - end');
    return { status, hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:updateMintingStatus: ${ex}`);
    Logger.info('Smart-Contract-Service:updateMintingStatus(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * getMintingStatus will get the minting status of the contract by calling the smart contract method
 * @param none
 * @returns status of the mint
 */
const getMintingStatus = async (contractId: number) => {
  Logger.info('Smart-Contract-Service:getMintingStatus(): - start');

  // FUTURE IMPLEMENTATION:: WILL BE CALLING THE AUTHENTICATOR CONTRACT METHOD TO DETERMINE ROLE OF THE USER ADDRESS
  // if (roleId != ALLOWED_LAND_CONTRACT_ROLE)
  //   throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.UNAUTHORIZED_OPERATION_ERROR, httpStatusCodes.BAD_REQUEST);

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const status = await contract.isMintingEnable();

    Logger.info('Smart-Contract-Service:getMintingStatus(): - end');
    return { status };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getMintingStatus: ${ex}`);
    Logger.info('Smart-Contract-Service:getMintingStatus(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * updateBaseURI will get the minting status of the contract by calling the smart contract method
 * @param status
 * @returns status and hash of the mint
 */

const updateBaseURI = async (contractId: number, baseURI: string) => {
  Logger.info('Smart-Contract-Service:updateBaseURI(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const result = await contract.updateBaseURI(baseURI);

    Logger.info('Smart-Contract-Service:updateBaseURI(): - end');
    return { baseURI, hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:updateBaseURI: ${ex}`);
    Logger.info('Smart-Contract-Service:updateBaseURI(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * getBaseURI will get the value of baseURI of the contract by calling the smart contract method
 * @param none
 * @returns baseURI
 */
const getBaseURI = async (contractId: number) => {
  Logger.info('Smart-Contract-Service:getBaseURI(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const baseURI = await contract.baseURI();

    Logger.info('Smart-Contract-Service:getBaseURI(): - end');
    return { baseURI };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getBaseURI: ${ex}`);
    Logger.info('Smart-Contract-Service:getBaseURI(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * updatePublicSaleStatus will update the public sale status by calling the smart contract method
 * @param status
 * @returns status and hash of the mint
 */

const updatePublicSaleStatus = async (contractId: number, status: boolean) => {
  Logger.info('Smart-Contract-Service:updatePublicSaleStatus(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const result = await contract.updatePublicSaleStatus(status);

    Logger.info('Smart-Contract-Service:updatePublicSaleStatus(): - end');
    return { status, hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:updatePublicSaleStatus(): ${ex}`);
    Logger.info('Smart-Contract-Service:updatePublicSaleStatus(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * getPublicSaleStatus will get the value of baseURI of the contract by calling the smart contract method
 * @param none
 * @returns status
 */
const getPublicSaleStatus = async (contractId: number) => {
  Logger.info('Smart-Contract-Service:getPublicSaleStatus(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const status = await contract.isPublicSaleActive();

    Logger.info('Smart-Contract-Service:getPublicSaleStatus(): - end');
    return { status };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getPublicSaleStatus: ${ex}`);
    Logger.info('Smart-Contract-Service:getPublicSaleStatus(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * updateLandMintingLimitPerAddress will update the public sale status by calling the smart contract method
 * @param mintLimit
 * @returns mintLimit and hash of the mint
 */

const updateLandMintingLimitPerAddress = async (contractId, mintLimit: number) => {
  Logger.info('Smart-Contract-Service:updateLandMintingLimitPerAddress(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const result = await contract.updateLandMintingLimitPerAddress(mintLimit);

    Logger.info('Smart-Contract-Service:updateLandMintingLimitPerAddress(): - end');
    return { mintLimit, hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:updateLandMintingLimitPerAddress(): ${ex}`);
    Logger.info('Smart-Contract-Service:updateLandMintingLimitPerAddress(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * getLandMintingLimitPerAddress will get the value of baseURI of the contract by calling the smart contract method
 * @param none
 * @returns status
 */
const getLandMintingLimitPerAddress = async (contractId: number) => {
  Logger.info('Smart-Contract-Service:getLandMintingLimitPerAddress(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);
  let mintLimit = 0;

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const result = await contract.landMintingLimitPerAddress();

    if (result) mintLimit = parseInt(result.toString());

    Logger.info('Smart-Contract-Service:getLandMintingLimitPerAddress(): - end');
    return { mintLimit };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getLandMintingLimitPerAddress: ${ex}`);
    Logger.info('Smart-Contract-Service:getLandMintingLimitPerAddress(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * mintLand will mint land against the user address by calling the smart contract method
 * @param landId
 * @param userType
 * @param userAddress
 * @param userKey
 * @param hashProof
 * @returns hashData in case of successful mint
 */

const mintLand = async (
  contractId: number,
  id: number,
  userType: string,
  toAddress: string,
  minterKey: string,
  proof: any,
) => {
  Logger.info('Smart-Contract-Service:mintLand(): - start');

  let coordinates = null;
  let lat = null;
  let lon = null;

  const contractDetails = await contractRepo.getContractById(contractId);
  //get asset details based on the passed id
  const assetDetails = await assetRepo.getAssetById(id);

  if (assetDetails) {
    coordinates = JSON.parse(assetDetails.assetLocation);
    coordinates = JSON.stringify(coordinates[0]);
    lat = assetDetails.lat;
    lon = assetDetails.lon;
  } else {
    // if no asset found then throw an error
    Logger.error(`Smart-Contract-Service:mintLand(): no asset found against id:${id}.`);
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      `no asset found against id:${id}.`,
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  let wallet = null;
  let contract = null;
  let hashProof = null;

  //build up the wallet by using the
  //pass in the user private key for processing in case of public and default minter key for admin and whitelist user
  if (userType === UserType.PUBLIC) {
    wallet = new ethers.Wallet(minterKey, customHttpProvider);
  } else {
    wallet = new ethers.Wallet(LAND_CONTRACT_MINTER_KEY, customHttpProvider);
  }

  contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  hashProof = contractDetails.merkleHash;

  try {
    let result = null;

    //check providerType and act accordingly.
    switch (userType) {
      case UserType.ADMIN:
        //call wallet mechisim to process and return the result
        result = await contract.mintLandWhitelistAdmin(toAddress, id, lon, lat, coordinates);
        break;
      case UserType.USER:
        if (hashProof) {
          //call wallet mechisim to process and return the result
          result = await contract.mintLandWhitelistUsers(toAddress, id, lon, lat, coordinates, proof);
        } else {
          Logger.error(`Smart-Contract-Service:mintLand(): ${locale.MINT_PROOF_REQUIRED}`);
          throw new ApiError(
            httpStatusCodes.UNPROCESSABLE_ENTITY,
            locale.MINT_PROOF_REQUIRED,
            httpStatusCodes.UNPROCESSABLE_ENTITY,
          );
        }
        break;
      case UserType.PUBLIC:
        //call wallet mechisim to process and return the result
        result = await contract.mintLandPublic(toAddress, id, lon, lat, coordinates);
        break;
      default: {
        Logger.error(`Smart-Contract-Service:mintLand(): ${locale.INVALID_TYPE}`);
        throw new ApiError(
          httpStatusCodes.UNPROCESSABLE_ENTITY,
          locale.INVALID_TYPE,
          httpStatusCodes.UNPROCESSABLE_ENTITY,
        );
      }
    }

    Logger.info('Smart-Contract-Service:mintLand(): - end');
    return { hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:mintLand(): ${ex}`);
    Logger.info('Smart-Contract-Service:mintLand(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * mintObject will mint land against the user address by calling the smart contract method
 * @param contractId
 * @param id
 * @param userType
 * @param toAddress
 * @param minterKey
 * @returns hashData in case of successful mint
 */
const mintObject = async (contractId: number, id: number, toAddress: string, minterKey: string) => {
  Logger.info('Smart-Contract-Service:mintObject(): - start');

  let metadata = {};
  let ipfsHash = null;
  let objectType = '';
  const attributesJson = [];

  // get the contract details
  const contractDetails = await contractRepo.getContractById(contractId);
  //get asset details based on the passed id
  const assetDetails = await assetRepo.getAssetById(id);

  if (assetDetails) {
    //build up the data that will set the metadata object
    Object.entries(assetDetails.attributes).forEach(([key, value]) => {
      attributesJson.push(value);
      if (value['trait_type'] === 'type') objectType = value['value'];
    });

    metadata = {
      name: assetDetails.assetName,
      description: assetDetails.assetName,
      image: assetDetails.imageName
        ? process.env.PINATA_GET_URL.concat(assetDetails.imageName)
        : process.env.PINATA_GET_URL.concat(DEFAULT_IMAGE_FILE_NAME),
      animation_url: assetDetails.animationName
        ? process.env.PINATA_GET_URL.concat(assetDetails.animationName)
        : process.env.PINATA_GET_URL.concat(DEFAULT_ANIMATION_FILE_NAME),
      attributes: attributesJson,
    };

    //save metadata to IPFS using pinata service
    ipfsHash = await pinataFunction.uploadJsonFileToIPFS(JSON.stringify(metadata));
  } else {
    // if no asset found then throw an error
    Logger.error(`Smart-Contract-Service:mintObject(): no asset found against id:${id}.`);
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      `no asset found against id:${id}.`,
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //build up the wallet by using the user private key
  //pass in the user private key for processing
  const wallet = new ethers.Wallet(OBJECT_CONTRACT_MINTER_KEY, customHttpProvider);
  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);

  try {
    // call the smart contract mint object
    const result = await contract.mintObject(toAddress, id, assetDetails.assetName, objectType, ipfsHash);

    Logger.info('Smart-Contract-Service:mintObject(): - end');

    return { hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:mintObject(): ${ex}`);
    Logger.info('Smart-Contract-Service:mintObject(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * getDataById will get the  data by calling the smart contract method
 * @param id
 * @returns status
 */
const getDataById = async (contractId: number, id: number) => {
  Logger.info('Smart-Contract-Service:getDataById(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);
  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);

  try {
    let result = null;

    if (contractDetails.assetType === AssetType.LAND) {
      result = await contract.getLandById(id);
    } else if (contractDetails.assetType === AssetType.OBJECT) {
      result = await contract.getObjectByID(id);
    }

    //extract the id from the result and load the asset detail which needs to be returned

    Logger.info('Smart-Contract-Service:getDataById(): - end');
    return { result };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getDataById: ${ex}`);
    Logger.info('Smart-Contract-Service:getDataById(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * getDataByAddress will get the land data against a user address by calling the smart contract method
 * @param address
 * @returns status
 */
const getDataByAddress = async (contractId: number, address: string) => {
  Logger.info('Smart-Contract-Service:getDataByAddress(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);
  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);

  try {
    let result = null;
    const assetIds: number[] = [];
    if (contractDetails.assetType === AssetType.LAND) {
      result = await contract.getLandsByAddress(address);
    } else if (contractDetails.assetType === AssetType.OBJECT) {
      result = await contract.getObjectsByAddress(address);
    }

    for (const values of result) {
      // get the assetId and build up the asset ids
      assetIds.push(parseInt(values[0]));
    }

    result = await assetRepo.getAssetByIds(assetIds);

    Logger.info('Smart-Contract-Service:getDataByAddress(): - end');
    return { result };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getDataByAddress: ${ex}`);
    Logger.info('Smart-Contract-Service:getDataByAddress(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * getInventoryByAddress will get the all the assets owned by the user through his address by calling the smart contract method
 * @param address
 * @returns inventory of the user against the user address
 */
const getInventoryByAddress = async (address: string) => {
  Logger.info('Smart-Contract-Service:getInventoryByAddress(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);

  const inventory = [];

  try {
    let result = null;
    const assetIds: number[] = [];
    //first get the land data against the user
    const contractDetails = await contractRepo.getContractById(LAND_SMART_CONTRACT_ID);
    const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);

    result = await contract.getLandsByAddress(address);

    for (const values of result) {
      // get the assetId and build up the asset ids
      assetIds.push(parseInt(values[0]));
    }

    result = await assetRepo.getAssetByIds(assetIds);

    //embed result in inventory
    inventory.push({ land: result });
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getInventoryByAddress: no data found for land against the user`);
    inventory.push({ land: [] });
  }

  //Get the objects against the user
  try {
    let result = null;
    const assetIds: number[] = [];
    //first get the land data against the user
    const contractDetails = await contractRepo.getContractById(OBJECT_SMART_CONTRACT_ID);
    const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);

    result = await contract.getObjectsByAddress(address);

    for (const values of result) {
      // get the assetId and build up the asset ids
      assetIds.push(parseInt(values[0]));
    }

    result = await assetRepo.getAssetByIds(assetIds);
    //embed result in inventory
    inventory.push({ object: result });
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getInventoryByAddress: no data found for objects against the user`);
    inventory.push({ object: [] });
  }

  Logger.info('Smart-Contract-Service:getInventoryByAddress(): - end');

  return inventory;
};

/**
 * tokenURI will get the land data against a user address by calling the smart contract method
 * @param address
 * @returns status
 */
const getTokenURI = async (contractId: number, tokenId: number) => {
  Logger.info('Smart-Contract-Service:getTokenURI(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);
  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);

  try {
    const result = await contract.tokenURI(tokenId);

    Logger.info('Smart-Contract-Service:getTokenURI(): - end');
    return { result };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:getTokenURI: ${ex}`);
    Logger.info('Smart-Contract-Service:getTokenURI(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * addWhitelistAdmin will update the public sale status by calling the smart contract method
 * @param userAddresses
 * @param allowPermission
 * @returns hash of the successful transaction
 */

const addWhitelistAdmin = async (contractId: number, userAddresses: string[], allowPermission: string) => {
  Logger.info('Smart-Contract-Service:addWhitelistAdmin(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const result = await contract.addWhitelistAdmin(userAddresses, allowPermission);

    Logger.info('Smart-Contract-Service:addWhitelistAdmin(): - end');
    return { hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:addWhitelistAdmin(): ${ex}`);
    Logger.info('Smart-Contract-Service:addWhitelistAdmin(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * removeWhitelistAdmin will update the public sale status by calling the smart contract method
 * @param userAddress
 * @returns hash of the successful transaction
 */

const removeWhitelistAdmin = async (contractId: number, userAddresses: string) => {
  Logger.info('Smart-Contract-Service:removeWhitelistAdmin(): - start');

  const wallet = new ethers.Wallet(LAND_CONTRACT_MANAGER_KEY, customHttpProvider);
  const contractDetails = await contractRepo.getContractById(contractId);

  const contract = new ethers.Contract(contractDetails.contractAddress, contractDetails.contractAbi, wallet);
  try {
    const result = await contract.removeWhitelistAdmin(userAddresses);

    Logger.info('Smart-Contract-Service:removeWhitelistAdmin(): - end');
    return { hash: result.hash };
  } catch (ex) {
    Logger.error(`Smart-Contract-Service:removeWhitelistAdmin(): ${ex}`);
    Logger.info('Smart-Contract-Service:removeWhitelistAdmin(): - end');
    throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, ex, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export default {
  updatePauseStatus,
  getPauseStatus,
  buildWhiteListUsers,
  verifyWhiteListUser,
  updateMintingStatus,
  getMintingStatus,
  updateBaseURI,
  getBaseURI,
  updatePublicSaleStatus,
  getPublicSaleStatus,
  updateLandMintingLimitPerAddress,
  getLandMintingLimitPerAddress,
  mintLand,
  mintObject,
  getDataById,
  getDataByAddress,
  getInventoryByAddress,
  getTokenURI,
  addWhitelistAdmin,
  removeWhitelistAdmin,
};
