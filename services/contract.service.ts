import httpStatusCodes from 'http-status-codes';
import Contract from '../models/contract.model';
import contractRepo from '../repos/contract.repo';
import assetService from '../services/asset.service';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import Logger from '../config/logger';
import pinataFunction from '../utils/pinata';
import util from 'util';
import fs from 'fs';
import helper from '../utils/helper';

const unlinkFile = util.promisify(fs.unlink);

const getAllContracts = async (page: number, size: number) => {
  Logger.info('ContractService:getAllContracts(): - start');
  const total = await contractRepo.getAllContractCount();
  if (!page) {
    page = 1;
  }
  if (!size) {
    size = Number.MAX_SAFE_INTEGER;
  }
  //get total number of pages
  const totalPages = Math.ceil(total / size);
  const result = await contractRepo.getAllContracts(page, size);

  Logger.info('ContractService:getAllContracts(): - end');

  return {
    results: result,
    totalPages: totalPages,
    total: total,
    page: page,
    size: size,
  };
};

const getAllContractsFilter = async (query: any = {}) => {
  Logger.info('ContractService:getAllContractsFilter(): - start');
  const total = await contractRepo.getAllContractCount(query);

  query.size = query.size ? query.size : Number.MAX_SAFE_INTEGER;
  query.page = query.page ? query.page : 1;
  //get total number of pages
  const totalPages = Math.ceil(total / query.size);

  const result = await contractRepo.getAllContractsFilter(query);

  Logger.info('ContractService:getAllContractsFilter(): - end');

  return {
    results: result,
    totalPages: totalPages,
    total: total,
    page: query.page,
    // size: query.size,
  };
};

const getAllActiveContracts = async () => {
  Logger.info('ContractService:getAllActiveContracts(): - start');

  const result = await contractRepo.getAllActiveContracts();
  Logger.info('ContractService:getAllActiveContracts(): - end');

  return result;
};
const getContractById = async (id: number) => {
  Logger.info('ContractService:getContractById(): - start');

  const result = await contractRepo.getContractById(id);
  if (!result) {
    Logger.error(`contract ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.CONTRACT_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('ContractService:getContractById(): - end');

  return result;
};

const getSearchFilterPanel = async (id: number) => {
  Logger.info('ContractService:getSearchFilterPanel(): - start');

  // get the data based on the contract id
  const result = await contractRepo.getContractById(id);
  if (!result) {
    Logger.error(`contract ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.CONTRACT_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('ContractService:getSearchFilterPanel(): - end');

  return { panel: result.dataValues.attributesPanel };
};

const getContractsByAssetType = async (assetType: string) => {
  Logger.info('ContractService:getContractsByAssetType(): - start');

  const result = await contractRepo.getContractsByAssetType(assetType);
  Logger.info('ContractService:getContractsByAssetType(): - end');

  return result;
};

const getContractsByCategoryId = async (id: number) => {
  Logger.info('ContractService:getContractsByCategoryId(): - start');

  const result = await contractRepo.getContractByCategoryId(id);
  Logger.info('ContractService:getContractsByCategoryId(): - end');

  return result;
};

/*
 *get contracts by season Name
 */
const getContractsBySeasonName = async (seasonName: string) => {
  Logger.info('ContractService:getContractsBySeasonName(): - start');

  const result = await contractRepo.getContractsBySeasonName(seasonName);
  Logger.info('ContractService:getContractsBySeasonName(): - end');

  return result;
};

const createContract = async (contract: any, files: any = {}) => {
  Logger.info('ContractService:createContract(): - start');

  //get the name to check if the contract address exists
  const contractAddress = contract.contractAddress;

  //call to the check by method
  const contractExists = await contractRepo.getContractByAddress(contractAddress);

  if (!contractExists) {
    // Get the contract passed it and created the contract obj for creation
    let newContract = new Contract();

    newContract.seasonName = contract.seasonName;
    newContract.assetType = contract.assetType;
    newContract.contractAddress = contract.contractAddress;

    newContract.contractAbi = contract.contractAbi ? JSON.parse(contract.contractAbi) : null;
    newContract.createdBy = contract.createdBy;
    newContract.updatedBy = contract.updatedBy;
    newContract.isActive = true;
    newContract.name = contract.name;
    newContract.description = contract.description;
    newContract.categoryId = contract.categoryId;
    newContract.payoutAddress = contract.payoutAddress;
    newContract.paymentToken = contract.paymentToken;
    newContract.sellerFee = contract.sellerFee;
    newContract.attributes = contract.attributes ? JSON.parse(contract.attributes) : null;
    newContract.attributesPanel = contract.attributesPanel ? JSON.parse(contract.attributesPanel) : null;

    newContract = await uploadContractAttachments(newContract, files);

    Logger.info('ContractService:createContract(): - end');
    const res = await contractRepo.createContract(newContract);
    res.logoImage = res.logoImage ? process.env.PINATA_GET_URL + res.logoImage : null;
    res.bannerImage = res.bannerImage ? process.env.PINATA_GET_URL + res.bannerImage : null;
    res.featuredImage = res.featuredImage ? process.env.PINATA_GET_URL + res.featuredImage : null;
    return res;
  } else {
    await helper.removeAllTempAttachmentFile(files);
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.CONTRACT_EXIST_WITH_ADRESS({ address: contractAddress }),
      httpStatusCodes.BAD_REQUEST,
    );
  }
};

const uploadContractAttachments = async (contract: any, files: any = {}) => {
  try {
    Logger.info('ContractService:updateContractAttachments(): - start');
    // if image is present then update logo image against contract ids
    if (files.logo) {
      //upload logo file to ipfs
      const logoCID = await pinataFunction.uploadFileToIPFS(files.logo[0]);
      contract['logoImage'] = logoCID;
      // delete the file from local storage
      await unlinkFile(files.logo[0].path);
    }

    // if animation is present then update featured name against contract ids
    if (files.featured) {
      //upload featured to ipfs
      const featuredCID = await pinataFunction.uploadFileToIPFS(files.featured[0]);
      contract['featuredImage'] = featuredCID;
      //delete the file from local storage
      await unlinkFile(files.featured[0].path);
    }

    if (files.banner) {
      //upload banner to ipfs
      const bannerCID = await pinataFunction.uploadFileToIPFS(files.banner[0]);
      contract['bannerImage'] = bannerCID;
      //delete the file from local storage
      await unlinkFile(files.banner[0].path);
    }
    return contract;
  } catch (e) {
    //delete the file from local storage
    if (files.logo) await unlinkFile(files.logo[0].path);
    if (files.featured) await unlinkFile(files.featured[0].path);
    if (files.banner) await unlinkFile(files.banner[0].path);

    Logger.info('AssetService:updateContractAttachments(): - end');
    // throw the error to api
    throw new ApiError(httpStatusCodes.BAD_REQUEST, e, httpStatusCodes.BAD_REQUEST);
  }
};

const updateContract = async (contractId: number, contract: any, files = {}) => {
  // Get the contract passed it and created the contract obj for creation
  Logger.info('ContractService:updateContract(): - start');
  contract = await uploadContractAttachments(contract, files);
  if (contract.contractAbi) contract.contractAbi = JSON.parse(contract.contractAbi);
  if (contract.attributes) contract.attributes = JSON.parse(contract.attributes);
  if (contract.attributesPanel) contract.attributesPanel = JSON.parse(contract.attributesPanel);
  const result = await contractRepo.updateContract(contractId, contract);
  // stack will be there in case of any error thrown from database
  if (!result || result.stack) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.CONTRACT_NOT_FOUND({ id: contractId }),
      httpStatusCodes.BAD_REQUEST,
    );
  }

  Logger.info('ContractService:updateContract(): - end');
  result.logoImage = result.logoImage ? process.env.PINATA_GET_URL.concat(result.logoImage) : null;
  result.bannerImage = result.bannerImage ? process.env.PINATA_GET_URL.concat(result.bannerImage) : null;
  result.featuredImage = result.featuredImage ? process.env.PINATA_GET_URL.concat(result.featuredImage) : null;
  return result;
};

/**
 * buildCollectionPanel is a function which will build the search panel whenever an asset is added against the collectioj
 * this will be then stored in the table for searching
 * @param  contractId
 * @returns updated panel and store it against the contract
 */
const buildCollectionPanel = async (contractId: number) => {
  Logger.info('ContractService:buildCollectionPanel(): - start');

  // build up the panel for the attributes
  let panels = [];

  panels = await buildCollectionPanelForAttributes(contractId);
  // call the status build and add it in the panel
  panels.push(await buildPanelForAssetStatus(contractId));

  Logger.info('ContractService:buildCollectionPanel(): - end');

  // store the panel data in the database against the contractId
  await contractRepo.updateContract(contractId, { attributesPanel: panels });

  //return the panels
  return panels;
};

/**
 * buildCollectionPanelForAttributes is a function which will build the search panel whenever an asset is added against the collection
 * this will be then stored in the table for searching
 * @param  contract
 * @returns Json Panel
 */
const buildCollectionPanelForAttributes = async (contractId: number) => {
  Logger.info('ContractService:buildCollectionPanel(): - start');

  let mainTraitArray = [];
  let traitAttributesArray = [];

  let lastTrait: string = '';
  let traitCount = 0;
  let assetCount = 0;
  // Get all the assets attributes with thier count against the contract Id passed
  const assets = await assetService.getAssetAttributesWithCountByContractId(contractId);

  //got all the assets now iterate through the assets to get the attributes of each asset

  for (const asset of assets) {
    const trait: string = asset.trait_type;

    // if the attribute is the last element then add it as the main attribute
    if (assetCount === assets.length - 1) {
      //increase the count
      traitCount = traitCount + Number(asset.total);
      const mainTrait = {
        trait_type: lastTrait,
        value: traitCount,
        attributes: traitAttributesArray,
      };
      mainTraitArray.push(mainTrait);
    }
    // build up the attributes for the trait till the trait changes
    if (trait !== lastTrait) {
      if (lastTrait !== '') {
        const mainTrait = {
          trait_type: lastTrait,
          value: traitCount,
          attributes: traitAttributesArray,
        };

        mainTraitArray.push(mainTrait);
        //initialize the trait so that it can be ready to process the next one
        traitCount = 0;
        traitAttributesArray = [];

        //increase the count of the trait
        traitCount = traitCount + Number(asset.total);
        const attributes = {
          trait_type: asset.value,
          value: asset.total,
        };
        //push the built attribute against the trait
        traitAttributesArray.push(attributes);
      } else {
        // build up the trait
        //increase the count
        traitCount = traitCount + Number(asset.total);
        const attributes = {
          trait_type: asset.value,
          value: asset.total,
        };
        traitAttributesArray.push(attributes);
      }
      lastTrait = trait;
    } else {
      //increase the count
      traitCount = traitCount + Number(asset.total);
      const attributes = {
        trait_type: asset.value,
        value: asset.total,
      };

      traitAttributesArray.push(attributes);
    }
    //increase the counter
    assetCount++;
  }

  Logger.info('ContractService:buildCollectionPanel(): - end');

  return mainTraitArray;
};

/**
 * buildPanelForAssetStatus is a function which will build the search panel whenever an asset is added against the collectioj
 * this will be then stored in the table for searching
 * @param  contractId
 * @returns attribuetJsonArray
 */
const buildPanelForAssetStatus = async (contractId: number) => {
  Logger.info('ContractService:buildPanelForAssetStatus(): - start');

  // Get all the assets attributes with thier count against the contract Id passed
  const assets = await assetService.getAssetStatusGroupByCount(contractId);

  let statusCount = 0;
  let attributesJsonArray = [];

  //got all the assets now iterate through the assets to get the attributes of each asset
  for (const asset of assets) {
    //increase the count
    statusCount = statusCount + Number(asset.dataValues.total);
    const attributes = {
      trait_type: asset.dataValues.assetStatus,
      value: asset.dataValues.total,
    };

    attributesJsonArray.push(attributes);
  }

  Logger.info('ContractService:buildPanelForAssetStatus(): - end');

  return {
    trait_type: 'Status',
    value: statusCount,
    attributes: attributesJsonArray,
  };
};

export default {
  createContract,
  updateContract,
  getAllContracts,
  getAllActiveContracts,
  getContractById,
  getSearchFilterPanel,
  getContractsByAssetType,
  getContractsBySeasonName,
  getAllContractsFilter,
  buildCollectionPanelForAttributes,
  buildCollectionPanel,
  getContractsByCategoryId,
};
