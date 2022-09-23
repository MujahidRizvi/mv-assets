import Asset from '../models/asset.model';
import Logger from '../config/logger';
import { QueryTypes, Op } from 'sequelize';
import sequelize from '../config/database';
import fs from 'fs';
import helperFunctions from '../utils/helper';
import {
  RAW_QUERY_FILE,
  DEFAULT_IMAGE_FILE_NAME,
  DEFAULT_ANIMATION_FILE_NAME,
  DEFAULT_STICKER_FILE_NAME,
} from '../utils/constants';

/*
 *get all asset
 */
const getAllAssets = async (page: number, size: number) => {
  Logger.info('AssetRepo:getAllAssets(): - start');

  let queries = JSON.parse(fs.readFileSync(RAW_QUERY_FILE).toString());
  //load the query for this function
  let query = queries.allAssets;

  //getting defaults values for image and animation
  const defaultPath = process.env.PINATA_GET_URL;
  const defaultImage = `${defaultPath.concat(DEFAULT_IMAGE_FILE_NAME)}`;
  const defaultAnimation = `${defaultPath.concat(DEFAULT_ANIMATION_FILE_NAME)}`;
  const defaultSticker = `${defaultPath.concat(DEFAULT_STICKER_FILE_NAME)}`;

  //pagination
  let pageSize: number = 0;

  if (size !== Number.MAX_SAFE_INTEGER) pageSize = (page - 1) * size;

  // add limit and offset in query
  query = `${query} LIMIT ${size} OFFSET ${pageSize}`;

  // passing the model type to return the result as the instance of the model
  const result = await sequelize.query(query, {
    bind: { defaultImage, defaultPath, defaultAnimation, defaultSticker },
    type: QueryTypes.SELECT,
  });

  Logger.info('AssetRepo:getAllAssets(): - end');

  return result;
};

/*
 *get assets count
 */
const getAssetsCount = async (minId: number = null, maxId: number = null, type: any = null) => {
  Logger.info('AssetRepo:getAssetsCount(): - start');
  const queryBody = {};
  if (minId || maxId) {
    queryBody['id'] = {};
  }
  if (minId) {
    queryBody['id'][Op.gte] = minId;
  }
  if (maxId) {
    queryBody['id'][Op.lte] = maxId;
  }
  if (type) {
    queryBody['assetType'] = type;
  }
  let result = await Asset.findAndCountAll({
    where: queryBody,
  });

  Logger.info('AssetRepo:getAssetsCount(): - end');

  return result.count;
};

/*
 *get all asset count by owner Id
 */
const getAllAssetsCountByOwnerId = async (ownerId: string) => {
  Logger.info('AssetRepo:getAllAssetsCountByOwnerId(): - start');

  const result = await Asset.findAndCountAll({ where: { ownerId } });

  Logger.info('AssetRepo:getAllAssetsCountByOwnerId(): - end');

  return result.count;
};

/*
 *get all asset count by owner Id
 */
const getAllAssetsCountByContractId = async (contractId: number) => {
  Logger.info('AssetRepo:getAllAssetsCountByContractId(): - start');

  const result = await Asset.findAndCountAll({ where: { contractId } });

  Logger.info('AssetRepo:getAllAssetsCountByContractId(): - end');

  return result.count;
};

/*
 *get all asset status count by group
 */
const getAssetStatusGroupByCount = async (contractId: number) => {
  Logger.info('AssetRepo:getAssetStatusGroupByCount(): - start');
  const result = await Asset.findAll({
    where: { contractId },
    attributes: ['assetStatus', [sequelize.fn('count', sequelize.col('id')), 'total']],
    group: ['asset.assetStatus'],
  });

  Logger.info('AssetRepo:getAssetStatusGroupByCount(): - end');

  return result;
};

/*
 *get asset by id
 */
const getAssetById = async (id: number) => {
  Logger.info('AssetRepo:getAssetById(): - start');

  const result = await Asset.findOne({ where: { id } });

  Logger.info('AssetRepo:getAssetById(): - end');

  return result;
};

/*
 *get assets
 */
const getAssets = async (minId: number, maxId: number, type: any, page: number, size: number) => {
  Logger.info('AssetRepo:getAssets(): - start');

  let pageSize: number = 0;

  if (size !== Number.MAX_SAFE_INTEGER) pageSize = (page - 1) * size;

  let result;
  if (minId && maxId)
    result = await Asset.findAll({
      where: { id: { [Op.gte]: minId, [Op.lte]: maxId }, assetType: type },
      order: [['id', 'ASC']],
      offset: pageSize,
      limit: size,
    });
  else if (minId)
    result = await Asset.findAll({
      where: { id: { [Op.gte]: minId }, assetType: type },
      order: [['id', 'ASC']],
      offset: pageSize,
      limit: size,
    });
  else if (maxId)
    result = await Asset.findAll({
      where: { id: { [Op.lte]: maxId }, assetType: type },
      order: [['id', 'ASC']],
      offset: pageSize,
      limit: size,
    });
  else
    result = await Asset.findAll({ where: { assetType: type }, order: [['id', 'ASC']], offset: pageSize, limit: size });

  Logger.info('AssetRepo:getAssets(): - end');

  return result;
};

/*
 *get asset by ids
 */
const getAssetByIds = async (assetIds: number[]) => {
  Logger.info('AssetRepo:getAssetByIds(): - start');

  const result = await Asset.findAll({
    attributes: [
      'id',
      'contractId',
      'ownerId',
      'assetLocation',
      'price',
      'lat',
      'lon',
      'assetName',
      'seasonName',
      'description',
      'attributes',
      [
        Asset.sequelize.literal(
          `(CASE WHEN \"imageName\" IS NULL THEN '${process.env.PINATA_GET_URL}${DEFAULT_IMAGE_FILE_NAME}' ELSE CONCAT('${process.env.PINATA_GET_URL}',\"imageName"\) END)`,
        ),
        'imageName',
      ],
      [
        Asset.sequelize.literal(
          `(CASE WHEN \"animationName\" IS NULL THEN '${process.env.PINATA_GET_URL}${DEFAULT_ANIMATION_FILE_NAME}' ELSE CONCAT('${process.env.PINATA_GET_URL}',\"animationName"\) END)`,
        ),
        'animationName',
      ],
      [
        Asset.sequelize.literal(
          `(CASE WHEN \"stickerName\" IS NULL THEN '${process.env.PINATA_GET_URL}${DEFAULT_STICKER_FILE_NAME}' ELSE CONCAT('${process.env.PINATA_GET_URL}',\"stickerName"\) END)`,
        ),
        'stickerName',
      ],
    ],
    where: { id: { [Op.in]: assetIds } },
    order: [['id', 'ASC']],
  });

  Logger.info('AssetRepo:getAssetByIds(): - end');

  return result;
};

/*
 *get asset by ids
 */
const getAssetByIdsOrderByContractId = async (assetIds: number[]) => {
  Logger.info('AssetRepo:getAssetByIdsOrderByContractId(): - start');

  const result = await Asset.findAll({ where: { id: { [Op.in]: assetIds } }, order: [['contractId', 'ASC']] });

  Logger.info('AssetRepo:getAssetByIdsOrderByContractId(): - end');

  return result;
};
/*
 *get asset by lat lon
 */
const getAssetByLatLon = async (lat: number, lon: number) => {
  Logger.info('AssetRepo:getAssetByLatLon(): - start');

  const result = await Asset.findOne({ where: { lat, lon } });

  Logger.info('AssetRepo:getAssetByLatLon(): - end');

  return result;
};

/*
 *get asset by contract id
 */
const getAssetsByContractId = async (contractId: number, page: number, size: number) => {
  Logger.info('AssetRepo:getAssetByContractId(): - start');

  //pagination
  let pageSize: number = 0;

  if (size !== Number.MAX_SAFE_INTEGER) {
    pageSize = (page - 1) * size;
  }

  const result = await Asset.findAll({
    attributes: [
      'id',
      'contractId',
      'ownerId',
      'assetLocation',
      'price',
      'lat',
      'lon',
      'assetName',
      'seasonName',
      'assetType',
      'assetStatus',
      'isActive',
      'createdBy',
      'updatedBy',
      'updatedAt',
      'createdAt',
      'description',
      'attributes',
      [
        Asset.sequelize.literal(
          `(CASE WHEN \"imageName\" IS NULL THEN \"imageName\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"imageName"\) END)`,
        ),
        'imageName',
      ],
      [
        Asset.sequelize.literal(
          `(CASE WHEN \"animationName\" IS NULL THEN \"animationName\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"animationName"\) END)`,
        ),
        'animationName',
      ],
      [
        Asset.sequelize.literal(
          `(CASE WHEN \"stickerName\" IS NULL THEN \"stickerName\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"stickerName"\) END)`,
        ),
        'stickerName',
      ],
    ],
    where: { contractId },
    limit: size,
    offset: pageSize,
  });

  Logger.info('AssetRepo:getAssetByContractId(): - end');

  return result;
};

/*
 *get asset by owner id
 */
const getAssetsByOwnerId = async (ownerId: string, page: number, size: number) => {
  Logger.info('AssetRepo:getAssetsByOwnerId(): - start');

  let queries = JSON.parse(fs.readFileSync(RAW_QUERY_FILE).toString());
  //load the query for this function
  let query = queries.assetsByOwner;

  //getting defaults values for image and animation
  const defaultPath = process.env.PINATA_GET_URL;
  const defaultImage = `${defaultPath.concat(DEFAULT_IMAGE_FILE_NAME)}`;
  const defaultAnimation = `${defaultPath.concat(DEFAULT_ANIMATION_FILE_NAME)}`;

  //pagination
  let pageSize: number = 0;

  if (size !== Number.MAX_SAFE_INTEGER) {
    pageSize = (page - 1) * size;
  }

  // add limit and offset in query
  query = `${query} LIMIT ${size} OFFSET ${pageSize}`;

  // passing the model type to return the result as the instance of the model
  return sequelize.query(query, {
    bind: { defaultImage, defaultPath, defaultAnimation, ownerId },
    type: QueryTypes.SELECT,
  });
};

/*
 *get asset by type
 */
const getAssetsByAssetType = async (assetType: string) => {
  Logger.info('AssetRepo:getAssetsByAssetType(): - start');

  const result = await Asset.findAll({ where: { assetType } });

  Logger.info('AssetRepo:getAssetsByAssetType(): - end');

  return result;
};

/*
 *get asset by season Name
 */
const getAssetsBySeasonName = async (seasonName: string) => {
  Logger.info('AssetRepo:getAssetBySeasonName(): - start');

  const result = await Asset.findAll({ where: { seasonName } });

  Logger.info('AssetRepo:getAssetBySeasonName(): - end');

  return result;
};

/*
 *create Asset method , it will create a new asset entry
 */
const createAsset = async (asset: any) => {
  try {
    Logger.info('AssetRepo:createAsset(): - start');
    //call the save method to save the user account
    const result = await asset.save();

    Logger.info('AssetRepo:createAsset(): - end');

    return result;
  } catch (e) {
    Logger.error(`AssetRepo:createContract(): ${e} `);
    return e;
  }
};

const updateAsset = async (id: number, asset: any) => {
  try {
    Logger.info('AssetRepo:updateAsset(): - start');

    const result = await Asset.update(asset, {
      where: {
        id,
      },
      returning: true,
      plain: true,
    });
    Logger.info('AssetRepo:updateAsset(): - end');

    return result[1].dataValues;
  } catch (e) {
    Logger.error(`AssetRepo:updateAsset(): ${e} `);
    return e;
  }
};

const updateAssetBulk = async (assetIds: number[], asset: any) => {
  try {
    Logger.info('AssetRepo:updateAsset(): - start');

    const result = await Asset.update(asset, {
      where: {
        id: {
          [Op.in]: assetIds,
        },
      },
      returning: true,
      plain: true,
    });
    Logger.info('AssetRepo:updateAsset(): - end');
    return result[1].dataValues;
  } catch (e) {
    Logger.error(`AssetRepo:updateAsset(): ${e} `);
    return e;
  }
};

/*
 *update owner , it will update the asset owner
 */
const updateAssetOwner = async (id: number, ownerId: number) => {
  try {
    Logger.info('AssetRepo:updateAssetOwner(): - start');

    // call the method to update the screenname
    const result = await Asset.update(
      { ownerId },
      {
        where: {
          id,
        },
        returning: true,
        plain: true,
      },
    );
    Logger.info('AssetRepo:updateAssetOwner(): - end');

    // return the object
    return result[1].dataValues;
  } catch (e) {
    Logger.error(`AssetRepo:updateAssetOwner(): ${e} `);
    return e;
  }
};

/*
 *update asset status , it will update the asset status
 */
const updateAssetStatus = async (id: number, assetStatus: string) => {
  try {
    Logger.info('AssetRepo:updateAssetStatus(): - start');

    // call the method to update the screenname
    const result = await Asset.update(
      { assetStatus },
      {
        where: {
          id,
        },
        returning: true,
        plain: true,
      },
    );
    Logger.info('AssetRepo:updateAssetStatus(): - end');

    // return the object
    return result[1].dataValues;
  } catch (e) {
    Logger.error(`AssetRepo:updateAssetStatus(): ${e} `);
    return e;
  }
};

/*
 *update asset image , it will update the file names of
 */
const updateAssetImage = async (assetIds: number[], imageName: string) => {
  try {
    Logger.info('AssetRepo:updateAssetImage(): - start');
    // call the method to update the image name
    const result = await Asset.update(
      { imageName },
      {
        where: {
          id: {
            [Op.in]: assetIds,
          },
        },
        returning: true,
        plain: true,
      },
    );
    Logger.info('AssetRepo:updateAssetImage(): - end');

    // return the object
    return result[1].dataValues;
  } catch (e) {
    Logger.error(`AssetRepo:updateAssetStatus(): ${e} `);
    return e;
  }
};

/*
 *update asset animation , it will update the file names of
 */
const updateAssetAnimation = async (assetIds: number[], animationName: string) => {
  try {
    Logger.info('AssetRepo:updateAssetAnimation(): - start');
    // call the method to update the animation name
    const result = await Asset.update(
      { animationName },
      {
        where: {
          id: {
            [Op.in]: assetIds,
          },
        },
        returning: true,
        plain: true,
      },
    );
    Logger.info('AssetRepo:updateAssetAnimation(): - end');

    // return the object
    return result[1].dataValues;
  } catch (e) {
    Logger.error(`AssetRepo:updateAssetStatus(): ${e} `);
    return e;
  }
};

const updateAssetSticker = async (assetIds: number[], stickerName: string) => {
  try {
    Logger.info('AssetRepo:updateAssetSticker(): - start');
    // call the method to update the sticker name

    // call the method to update the sticker name
    const result = await Asset.update(
      { stickerName },
      {
        where: {
          id: {
            [Op.in]: assetIds,
          },
        },
        returning: true,
        plain: true,
      },
    );
    Logger.info('AssetRepo:updateAssetSticker(): - end');

    // return the object
    return result[1].dataValues;
  } catch (e) {
    Logger.error(`AssetRepo:updateAssetSticker(): ${e} `);
    return e;
  }
};

/*
 *get assets count based on asset type and the surrounding in the radius of given lat, lon
 */
const getCountByAssetsByTypeAndLatLonRadius = async (assetType: string, lat: number, lon: number, radius: number) => {
  Logger.info('AssetRepo:getCountByAssetsByTypeAndLatLonRadius(): - start');

  //load raw queries from json file

  const queries = JSON.parse(fs.readFileSync(RAW_QUERY_FILE).toString());

  //load the query for this function
  let query = queries.countAssetByTypeAndLatLonRadius;

  // passing the model type to return the result as the instance of the model
  const result = await sequelize.query(query, {
    bind: { assetType, lat, lon, radius },
    type: QueryTypes.SELECT,
  });

  Logger.info('AssetRepo:getCountByAssetsByTypeAndLatLonRadius(): - end');

  //as the total will always be the first element of the array so return it
  return Number(result[0].total);
};

/*
 *get assets based on asset type and the surrounding in the radius of given lat, lon
 */
const getAssetsByTypeAndLatLonRadius = async (
  assetType: string,
  lat: number,
  lon: number,
  radius: number,
  isPaginationRequired: boolean,
  page?: number,
  size?: number,
) => {
  Logger.info('AssetRepo:getAssetsByTypeAndLatLonRadius(): - start');

  //load raw queries from json file
  let queries = JSON.parse(fs.readFileSync(RAW_QUERY_FILE).toString());
  //load the query for this function
  let query = queries.assetByTypeAndLatLonRadius;

  //getting defaults values for image and animation
  const defaultPath = String(process.env.PINATA_GET_URL);
  const defaultImage = `${defaultPath.concat(DEFAULT_IMAGE_FILE_NAME)}`;
  const defaultAnimation = `${defaultPath.concat(DEFAULT_ANIMATION_FILE_NAME)}`;

  // if paging is required then
  if (isPaginationRequired) {
    let pageSize: number = 0;

    if (size !== Number.MAX_SAFE_INTEGER) pageSize = (page - 1) * size;

    // add limit and offset in query
    query = `${query} LIMIT ${size} OFFSET ${pageSize}`;
  }

  // passing the model type to return the result as the instance of the model
  const result = await sequelize.query(query, {
    bind: { defaultImage, defaultPath, defaultAnimation, assetType, lat, lon, radius },
    type: QueryTypes.SELECT,
  });

  Logger.info('AssetRepo:getAssetsByTypeAndLatLonRadius(): - end');

  return result;
};

const createUpdateAssetBulk = async (assets: any) => {
  try {
    Logger.info('AssetRepo:createUpdateAssetBulk(): - start');

    const result = await Asset.bulkCreate(assets, {
      updateOnDuplicate: [
        'assetName',
        'contractId',
        'ownerId',
        'assetLocation',
        'lat',
        'lon',
        'seasonName',
        'assetType',
        'assetStatus',
        'imageName',
        'animationName',
      ],
    });
    Logger.info('AssetRepo:createUpdateAssetBulk(): - end');

    return result;
  } catch (e) {
    Logger.error(`AssetRepo:createUpdateAssetBulk(): ${e} `);
    return e;
  }
};

/*
 *get assets count based on asset type and the surrounding in the radius of given lat, lon
 */
const getAssetAttributesWithCountByContractId = async (contractId: number) => {
  Logger.info('AssetRepo:getAssetAttributesWithCountByContractId(): - start');

  //load raw queries from json file

  const queries = JSON.parse(fs.readFileSync(RAW_QUERY_FILE).toString());

  //load the query for this function
  let query = queries.getAssetAttributesWithCountByContractId;

  // replace parameters
  query = helperFunctions.replaceAll(query, '${contractId}', contractId);

  // passing the model type to return the result as the instance of the model
  const result = await sequelize.query(query, { type: QueryTypes.SELECT });

  Logger.info('AssetRepo:getAssetAttributesWithCountByContractId(): - end');

  //as the total will always be the first element of the array so return it
  return result;
};

/*
 *get all assets by filter
 */
const getAssetsByFilter = async (contractId: number, sort: string, sortBy: string, search: string, filter: any) => {
  Logger.info('AssetRepo:getAssetsByFilter(): - start');

  let queries = JSON.parse(fs.readFileSync(RAW_QUERY_FILE).toString());
  //load the query for this function
  let sqlQuery = queries.getAssetsByFilter;
  let sqlQueryFilter = '';
  let bindParams: any = {};
  const defaultPath = process.env.PINATA_GET_URL;
  let attributesIncluded: boolean = false;

  bindParams['contractId'] = contractId;
  bindParams['defaultPath'] = process.env.PINATA_GET_URL;
  bindParams['defaultImage'] = `${defaultPath.concat(DEFAULT_IMAGE_FILE_NAME)}`;
  bindParams['defaultAnimation'] = `${defaultPath.concat(DEFAULT_ANIMATION_FILE_NAME)}`;
  bindParams['defaultSticker'] = `${defaultPath.concat(DEFAULT_STICKER_FILE_NAME)}`;

  // if search criteria is given
  if (search) {
    let searchParams =
      '("seasonName" iLike $search or "ownerId" iLike $search or "assetName" iLike $search or "description" iLike $search )';
    sqlQuery = helperFunctions.replaceAll(sqlQuery, '${searchParams}', ' and ' + searchParams);
    bindParams['search'] = '%' + search.toLowerCase() + '%';
  } else {
    sqlQuery = helperFunctions.replaceAll(sqlQuery, '${searchParams}', '');
  }

  // check if filters have been applied
  if (filter) {
    //first fill up the hard coded columns and build up the sqlQuery
    for (const obj of filter) {
      //asset status is a hard column so adding it directly
      if (obj.trait_type === 'assetStatus') {
        sqlQuery = `${sqlQuery} and "assetStatus"='${obj.value}'`;
      }
    }

    // iterate filters again and now checking the trait_type from attributes Json
    for (const obj of filter) {
      //asset status is a hard column so adding it directly
      if (obj.trait_type !== 'assetStatus') {
        if (!attributesIncluded) {
          sqlQuery = helperFunctions.replaceAll(
            sqlQuery,
            '${jsonbParams}',
            ',jsonb_to_recordset(mv_object_mgmt.assets."attributes") as items(trait_type text, value text)',
          );

          sqlQueryFilter = `${sqlQuery} and items."trait_type"='${obj.trait_type}' and items."value"='${obj.value}'`;
          attributesIncluded = true;
        }
        // need to add it in intersection'
        else {
          const sqlIntersectQuery = ` INTERSECT ${sqlQuery} and items."trait_type"='${obj.trait_type}' and items."value"='${obj.value}'`;
          sqlQueryFilter = `${sqlQueryFilter}${sqlIntersectQuery}`;
        }
      }
    }
  } else {
    // no filter criteria found so clear out the variables
    sqlQuery = helperFunctions.replaceAll(sqlQuery, '${filterParams}', '');
    sqlQuery = helperFunctions.replaceAll(sqlQuery, '${jsonbParams}', '');
  }

  // check if filters have been added then replace it with the main query otherwise empty jsonbParams
  if (sqlQueryFilter) {
    sqlQuery = sqlQueryFilter;
  } else {
    sqlQuery = helperFunctions.replaceAll(sqlQuery, '${jsonbParams}', '');
  }

  // add order by clause
  sqlQuery = `${sqlQuery} order by ${sortBy} ${sort} `;

  const result = await sequelize.query(sqlQuery, {
    type: QueryTypes.SELECT,
    bind: bindParams,
  });

  Logger.info('AssetRepo:getAllContracts(): - end');

  return result;
};

export default {
  createAsset,
  updateAsset,
  updateAssetOwner,
  updateAssetStatus,
  getAllAssets,
  getAssetById,
  getAssetsByContractId,
  getAssetsByOwnerId,
  getAssetsByAssetType,
  getAssetsBySeasonName,
  getAssetByLatLon,
  getAssetsByTypeAndLatLonRadius,
  getCountByAssetsByTypeAndLatLonRadius,
  updateAssetImage,
  getAllAssetsCountByOwnerId,
  updateAssetAnimation,
  getAssetByIds,
  getAssetByIdsOrderByContractId,
  updateAssetSticker,
  updateAssetBulk,
  getAssets,
  getAssetsCount,
  getAllAssetsCountByContractId,
  createUpdateAssetBulk,
  getAssetAttributesWithCountByContractId,
  getAssetStatusGroupByCount,
  getAssetsByFilter,
};
