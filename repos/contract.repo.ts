import Contract from '../models/contract.model';
import Logger from '../config/logger';

import { QueryTypes, Op } from 'sequelize';
import fs from 'fs';
import { RAW_QUERY_FILE } from '../utils/constants';
import sequelize from '../config/database';
import helperFunctions from '../utils/helper';
/*
 *get all contracts
 */
const getAllContracts = async (page: number, size: number) => {
  Logger.info('ContractRepo:getAllContracts(): - start');

  let pageSize: number = 0;

  if (size !== Number.MAX_SAFE_INTEGER) pageSize = (page - 1) * size;

  const result = await Contract.findAll({
    order: [['id', 'ASC']],
    offset: pageSize,
    limit: size,
    attributes: [
      'id',
      'seasonName',
      'assetType',
      'contractAddress',
      'contractAbi',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'categoryId',
      'payoutAddress',
      'sellerFee',
      'updatedAt',
      'createdAt',
      'blockNumber',
      'name',
      'attributes',
      'attributesPanel',
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"featuredImage\" IS NULL THEN \"featuredImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"featuredImage"\) END)`,
        ),
        'featuredImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"bannerImage\" IS NULL THEN \"bannerImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"bannerImage"\) END)`,
        ),
        'bannerImage',
      ],
    ],
  });

  Logger.info('ContractRepo:getAllContracts(): - end');

  return result;
};
/*
 *get all contracts filter
 */
const getAllContractsFilter = async (query: any = {}) => {
  Logger.info('ContractRepo:getAllContracts(): - start');
  let queries = JSON.parse(fs.readFileSync(RAW_QUERY_FILE).toString());
  //load the query for this function
  let sqlQuery = queries.getAllContracts;
  let bindParams: any = {};
  bindParams['imgPath'] = process.env.PINATA_GET_URL;
  //bindParams['order'] = query.order?query.order:'asc';
  //bindParams['orderBy'] = "\"" +( query.orderBy?query.orderBy:'id') + "\""
  sqlQuery = helperFunctions.replaceAll(sqlQuery, '${order}', query.order ? query.order : 'asc');
  sqlQuery = helperFunctions.replaceAll(sqlQuery, '${orderBy}', '"' + (query.orderBy ? query.orderBy : 'id') + '"');

  if (query.searchStr) {
    let searchParams =
      ' ( c."seasonName" iLike $searchStr or c."assetType" iLike $searchStr or c."categoryId" iLike $searchStr or c."name" iLike $searchStr or c."description" iLike $searchStr  ) ';
    sqlQuery = helperFunctions.replaceAll(sqlQuery, '${searchParams}', ' and ' + searchParams);
    bindParams['searchStr'] = '%' + query.searchStr.toLowerCase() + '%';
  } else {
    sqlQuery = helperFunctions.replaceAll(sqlQuery, '${searchParams}', '');
  }

  let filterParams = '';

  if (query.seasonName) {
    filterParams += ' and c."seasonName"= $seasonName';
    bindParams['seasonName'] = query.seasonName;
  }

  if (query.assetType) {
    filterParams += ' and c."assetType"= $assetType';
    bindParams['assetType'] = query.assetType;
  }

  if (query.categoryId) {
    filterParams += ' and c."categoryId"= $categoryId';
    bindParams['categoryId'] = query.categoryId;
  }

  if (query.minSellerFee) {
    filterParams += ' and c."sellerFee" >= $minSellerFee';
    bindParams['minSellerFee'] = query.minSellerFee;
  }
  if (query.maxSellerFee) {
    filterParams += ' and c."sellerFee"<= $maxSellerFee';
    bindParams['maxSellerFee'] = query.maxSellerFee;
  }

  if (query.minLat) {
    filterParams += ' and a."lat">= $minLat';
    bindParams['minLat'] = query.minLat;
  }

  if (query.maxLat) {
    filterParams += ' and a."lat"<= $maxLat';
    bindParams['maxLat'] = query.maxLat;
  }

  if (query.minLon) {
    filterParams += ' and a."lon">= $minLon';
    bindParams['minLon'] = query.minLon;
  }

  if (query.maxLon) {
    filterParams += ' and a."lon"<= $maxLon';
    bindParams['maxLon'] = query.maxLon;
  }

  if (query.contractAddress) {
    filterParams += ' and c."contractAddress"= $contractAddress';
    bindParams['contractAddress'] = query.contractAddress;
  }

  sqlQuery = helperFunctions.replaceAll(sqlQuery, '${filterParams}', filterParams);

  let pageSize: number = 0;
  let size: number = query.size;
  let page: number = query.page;

  if (size !== Number.MAX_SAFE_INTEGER) pageSize = (page - 1) * size;
  sqlQuery = sqlQuery + ' LIMIT $size OFFSET $pageSize';
  bindParams['size'] = size;
  bindParams['pageSize'] = pageSize;

  const result = await sequelize.query(sqlQuery, {
    type: QueryTypes.SELECT,
    bind: bindParams,
    // replacements: ['id', 'desc'],
  });

  Logger.info('ContractRepo:getAllContracts(): - end');

  return result;
  /*var queryBody = {};
  if (query) {
    if (query.searchStr) {
      queryBody[Op.or] = [
        { name: { [Op.iLike]: '%' + query.searchStr.toLowerCase() + '%' } },
        { description: { [Op.iLike]: '%' + query.searchStr.toLowerCase() + '%' } },
        { seasonName: { [Op.iLike]: '%' + query.searchStr.toLowerCase() + '%' } },
        { assetType: { [Op.iLike]: '%' + query.searchStr.toLowerCase() + '%' } },
        { category: { [Op.iLike]: '%' + query.searchStr.toLowerCase() + '%' } },
      ];*/
  /*   queryBody[Op.or] = [
        { name: { [Op.substring]: query.searchStr.toLowerCase() } },
        { description: { [Op.substring]: query.searchStr } },
        { seasonName: where(fn('LOWER', col('seasonName')), 'locate', query.searchStr.toLowerCase()) },
        { assetType: { [Op.substring]: query.searchStr } },
        { category: { [Op.substring]: query.searchStr } },
      ];*/
  /*   }

    if (query.seasonName) {
      queryBody['seasonName'] = query.seasonName;
    }

    if (query.assetType) {
      queryBody['assetType'] = query.assetType;
    }

    if (query.category) {
      queryBody['category'] = query.category;
    }

    if (query.minSellerFee || query.maxSellerFee) {
      queryBody['sellerFee'] = {};
    }

    if (query.minSellerFee) {
      queryBody['sellerFee'][Op.gte] = query.minSellerFee;
    }
    if (query.maxSellerFee) {
      queryBody['sellerFee'][Op.lte] = query.maxSellerFee;
    }

    /* if (query.minLat || query.maxLat) {
      queryBody['lat'] = {};
    }

    if (query.minLat) {
      queryBody['lat'][Op.gte] = query.minLat;
    }
    if (query.maxLat) {
      queryBody['lat'][Op.lte] = query.maxLat;
    }*/
  /*
    if (query.contractAddress) {
      queryBody['contractAddress'] = query.contractAddress;
    }
  }

  let pageSize: number = 0;
  let size: number = query.size;
  let page: number = query.page;

  if (size !== Number.MAX_SAFE_INTEGER) pageSize = (page - 1) * size;

  const result = await Contract.findAll({
    attributes: [
      'id',
      'seasonName',
      'assetType',
      'contractAddress',
      'contractAbi',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'category',
      'payoutAddress',
      'sellerFee',
      'updatedAt',
      'createdAt',
      'blockNumber',
      'name',
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"featuredImage\" IS NULL THEN \"featuredImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"featuredImage"\) END)`,
        ),
        'featuredImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"bannerImage\" IS NULL THEN \"bannerImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"bannerImage"\) END)`,
        ),
        'bannerImage',
      ],
    ],
    where: queryBody,
    order: [[query.sortBy ? query.sortBy : 'id', query.order ? query.order : 'ASC']],
    offset: pageSize,
    limit: size,
  });
*/
  //return result;
};

const getAllContractCount = async (query: any = {}) => {
  Logger.info('ContractRepo:getContractCount(): - start');
  const queryBody = {};
  if (query) {
    if (query.searchStr) {
      queryBody[Op.or] = [
        { name: { [Op.like]: '%' + query.searchStr + '%' } },
        { description: { [Op.like]: '%' + query.searchStr + '%' } },
        { seasonName: { [Op.like]: '%' + query.searchStr + '%' } },
        { assetType: { [Op.like]: '%' + query.searchStr + '%' } },
        { categoryId: { [Op.like]: '%' + query.searchStr + '%' } },
      ];
    }

    if (query.seasonName) {
      queryBody['seasonName'] = query.seasonName;
    }

    if (query.assetType) {
      queryBody['assetType'] = query.assetType;
    }

    if (query.categoryId) {
      queryBody['categoryId'] = query.categoryId;
    }

    if (query.minSellerFee || query.maxSellerFee) {
      queryBody['sellerFee'] = {};
    }

    if (query.minSellerFee) {
      queryBody['sellerFee'][Op.gte] = query.minSellerFee;
    }
    if (query.maxSellerFee) {
      queryBody['sellerFee'][Op.lte] = query.maxSellerFee;
    }

    /* if (query.minLat || query.maxLat) {
      queryBody['lat'] = {};
    }

    if (query.minLat) {
      queryBody['lat'][Op.gte] = query.minLat;
    }
    if (query.maxLat) {
      queryBody['lat'][Op.lte] = query.maxLat;
    }*/

    if (query.contractAddress) {
      queryBody['contractAddress'] = query.contractAddress;
    }
  }

  let result = await Contract.findAndCountAll({
    where: queryBody,
  });

  Logger.info('ContractRepo:getContractCount(): - end');

  return result.count;
};

/*
 *get all active contracts
 */
const getAllActiveContracts = async () => {
  Logger.info('ContractRepo:getAllActiveContracts(): - start');

  const result = await Contract.findAll({
    attributes: [
      'id',
      'seasonName',
      'assetType',
      'contractAddress',
      'contractAbi',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'categoryId',
      'payoutAddress',
      'sellerFee',
      'updatedAt',
      'createdAt',
      'blockNumber',
      'name',
      'attributes',
      'attributesPanel',
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"featuredImage\" IS NULL THEN \"featuredImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"featuredImage"\) END)`,
        ),
        'featuredImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"bannerImage\" IS NULL THEN \"bannerImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"bannerImage"\) END)`,
        ),
        'bannerImage',
      ],
    ],
    where: { isActive: true },
  });

  Logger.info('ContractRepo:getAllActiveContracts(): - end');

  return result;
};
/*
 *get contract by id
 */
const getContractById = async (id: number) => {
  Logger.info('ContractRepo:getContractById(): - start');

  const result = await Contract.findOne({
    attributes: [
      'id',
      'seasonName',
      'assetType',
      'contractAddress',
      'contractAbi',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'categoryId',
      'payoutAddress',
      'sellerFee',
      'updatedAt',
      'createdAt',
      'blockNumber',
      'name',
      'attributes',
      'attributesPanel',
      'merkleHash',
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"featuredImage\" IS NULL THEN \"featuredImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"featuredImage"\) END)`,
        ),
        'featuredImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"bannerImage\" IS NULL THEN \"bannerImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"bannerImage"\) END)`,
        ),
        'bannerImage',
      ],
    ],
    where: { id },
  });

  Logger.info('ContractRepo:getContractById(): - end');

  return result;
};

/*
 *get contract by contract address
 */
const getContractByAddress = async (contractAddress: string) => {
  Logger.info('ContractRepo:getContractByAddress(): - start');

  const result = await Contract.findOne({
    attributes: [
      'id',
      'seasonName',
      'assetType',
      'contractAddress',
      'contractAbi',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'categoryId',
      'payoutAddress',
      'sellerFee',
      'updatedAt',
      'createdAt',
      'blockNumber',
      'name',
      'attributes',
      'attributesPanel',
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"featuredImage\" IS NULL THEN \"featuredImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"featuredImage"\) END)`,
        ),
        'featuredImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"bannerImage\" IS NULL THEN \"bannerImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"bannerImage"\) END)`,
        ),
        'bannerImage',
      ],
    ],
    where: { contractAddress },
  });

  Logger.info('ContractRepo:getContractByAddress(): - end');

  return result;
};

/*
 *get contract by asset type
 */
const getContractsByAssetType = async (assetType: string) => {
  Logger.info('ContractRepo:getContractsByAssetType(): - start');

  const result = await Contract.findAll({
    attributes: [
      'id',
      'seasonName',
      'assetType',
      'contractAddress',
      'contractAbi',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'categoryId',
      'payoutAddress',
      'sellerFee',
      'updatedAt',
      'createdAt',
      'blockNumber',
      'name',
      'attributes',
      'attributesPanel',
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"featuredImage\" IS NULL THEN \"featuredImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"featuredImage"\) END)`,
        ),
        'featuredImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"bannerImage\" IS NULL THEN \"bannerImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"bannerImage"\) END)`,
        ),
        'bannerImage',
      ],
    ],
    where: { assetType },
  });

  Logger.info('ContractRepo:getContractsByAssetType(): - end');

  return result;
};

/*
 *get contract by category id
 */
 const getContractByCategoryId = async (categoryId: number) => {
  Logger.info('ContractRepo:getContractByCategoryId(): - start');

  const result = await Contract.findAll({
    attributes: [
      'id',
      'seasonName',
      'assetType',
      'isActive',
      'description',
      'categoryId',
      'name',
      'attributes',
      'attributesPanel',
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"featuredImage\" IS NULL THEN \"featuredImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"featuredImage"\) END)`,
        ),
        'featuredImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"bannerImage\" IS NULL THEN \"bannerImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"bannerImage"\) END)`,
        ),
        'bannerImage',
      ],
    ],
    where: { categoryId , isActive:true },
  });

  Logger.info('ContractRepo:getContractByCategoryId(): - end');

  return result;
};

/*
 *get contract by seasonName
 */
const getContractsBySeasonName = async (seasonName: string) => {
  Logger.info('ContractRepo:getContractsBySeasonName(): - start');

  const result = await Contract.findAll({
    attributes: [
      'id',
      'seasonName',
      'assetType',
      'contractAddress',
      'contractAbi',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'categoryId',
      'payoutAddress',
      'sellerFee',
      'updatedAt',
      'createdAt',
      'blockNumber',
      'name',
      'attributes',
      'attributesPanel',
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"featuredImage\" IS NULL THEN \"featuredImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"featuredImage"\) END)`,
        ),
        'featuredImage',
      ],
      [
        Contract.sequelize.literal(
          `(CASE WHEN \"bannerImage\" IS NULL THEN \"bannerImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"bannerImage"\) END)`,
        ),
        'bannerImage',
      ],
    ],
    where: { seasonName },
  });

  Logger.info('ContractRepo:getContractsBySeasonName(): - end');

  return result;
};

/*
 *create contract method , it will create a new contract entry
 */
const createContract = async (contract: any) => {
  try {
    Logger.info('ContractRepo:createContract(): - start');

    //call the save method to save the user account
    const result = await contract.save();

    Logger.info('ContractRepo:createContract(): - end');

    return result;
  } catch (e) {
    Logger.error(`ContractRepo:createContract(): ${e} `);
    throw e;
  }
};

const updateContract = async (id: number, contract: any) => {
  try {
    Logger.info('ContractRepo:updateContract(): - start');

    const result = await Contract.update(contract, {
      where: {
        id,
      },
      returning: true,
      plain: true,
    });
    Logger.info('ContractRepo:updateContract(): - end');

    return result[1].dataValues;
  } catch (e) {
    Logger.error(`ContractRepo:updateContract(): ${e} `);
    return e;
  }
};

/*
 *update blockNumber , it will update the latest blockNumber against the contract
 */
const updateBlockNumber = async (id: number, blockNumber: number) => {
  try {
    Logger.info('ContractRepo:updateBlockNumber(): - start');

    // call the method to update the screenname
    const result = await Contract.update(
      { blockNumber },
      {
        where: {
          id,
        },
        returning: true,
        plain: true,
      },
    );
    Logger.info('ContractRepo:updateBlockNumber(): - end');

    // return the object
    return result[1].dataValues;
  } catch (e) {
    Logger.error(`ContractRepo:updateBlockNumber(): ${e} `);
    throw e;
  }
};

/*
 *get contract categories
 */
const getAllCategories = async () => {
  Logger.info('Contract Repo:getAllCategories(): - start');

  const result = await Contract.findAll({
    attributes: [
      // specify an array where the first element is the SQL function and the second is the alias
      [sequelize.fn('DISTINCT', sequelize.col('categoryId')), 'categoryId'],

      // specify any additional columns, e.g. country_code
      // 'country_code'
    ],
  });

  Logger.info('Contract Repo:getAllCategories(): - end');

  return result;
};

/*
 *update merkle hash , it will update the merkle hash against the contract
 */
const updateMerkleHash = async (id: number, merkleHash: string) => {
  try {
    Logger.info('ContractRepo:updateMerkleHash(): - start');

    // call the method to update the screenname
    const result = await Contract.update(
      { merkleHash },
      {
        where: {
          id,
        },
        returning: true,
        plain: true,
      },
    );
    Logger.info('ContractRepo:updateMerkleHash(): - end');

    // return the object
    return result[1].dataValues;
  } catch (e) {
    Logger.error(`ContractRepo:updateMerkle(): ${e} `);
    throw e;
  }
};

export default {
  getAllCategories,
  createContract,
  updateContract,
  getAllContracts,
  getAllActiveContracts,
  getContractById,
  getContractByAddress,
  getContractsByAssetType,
  getContractsBySeasonName,
  updateBlockNumber,
  getAllContractCount,
  getAllContractsFilter,
  updateMerkleHash,
  getContractByCategoryId
};
