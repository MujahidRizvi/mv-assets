import AssetOwnerHistory from '../models/asset-owner-history.model';
import Logger from '../config/logger';

/*
 *get all asset owner history
 */
const getAllAssetOwnersHistory = async () => {
  Logger.info('AssetOwnerHistoryRepo:getAllAssetOwnersHistory(): - start');

  const result = await AssetOwnerHistory.findAll();

  Logger.info('AssetOwnerHistoryRepo:getAllAssetOwnersHistory(): - end');

  return result;
};

/*
 *get AssetOwnerHistory by id
 */
const getAssetOwnerHistoryById = async (id: number) => {
  Logger.info('AssetOwnerHistoryRepo:getAssetOwnerHistoryById(): - start');

  const result = await AssetOwnerHistory.findOne({ where: { id } });

  Logger.info('AssetOwnerHistoryRepo:getAssetOwnerHistoryById(): - end');

  return result;
};

/*
 *get data by assetId
 */
const getAssetOwnersHistoryByAssetId = async (assetId: number) => {
  Logger.info('AssetOwnerHistoryRepo:getAssetOwnersHistoryByAssetId(): - start');

  const result = await AssetOwnerHistory.findAll({ where: { assetId } });

  Logger.info('AssetOwnerHistoryRepo:getAssetOwnersHistoryByAssetId(): - end');

  return result;
};

/*
 *get data by ownerId
 */
const getAssetOwnersHistoryByOwnerId = async (ownerId: number) => {
  Logger.info('AssetOwnerHistoryRepo:getAssetOwnersHistoryByOwnerId(): - start');

  const result = await AssetOwnerHistory.findAll({ where: { ownerId } });

  Logger.info('AssetOwnerHistoryRepo:getAssetOwnersHistoryByOwnerId(): - end');

  return result;
};

/*
 *create  method , it will create a new entry
 */
const createAssetOwnerHistory = async (assetOwnerHistory: any) => {
  try {
    Logger.info('AssetOwnerHistoryRepo:createAssetOwnerHistory(): - start');

    //call the save method to save the user account
    const result = await assetOwnerHistory.save();

    Logger.info('AssetOwnerHistoryRepo:createAssetOwnerHistory(): - end');

    return result;
  } catch (e) {
    Logger.error(`AssetOwnerHistoryRepo:createAssetOwnerHistory(): ${e} `);
    throw e;
  }
};

const updateAssetOwnerHistory = async (id: number, assetOwnerHistory: any) => {
  try {
    Logger.info('AssetOwnerHistoryRepo:updateAssetOwnerHistory(): - start');

    const result = await AssetOwnerHistory.update(assetOwnerHistory, {
      where: {
        id,
      },
      returning: true,
      plain: true,
    });
    Logger.info('AssetOwnerHistoryRepo:updateAssetOwnerHistory(): - end');

    return result[1].dataValues;
  } catch (e) {
    Logger.error(`AssetOwnerHistoryRepo:updateAssetOwnerHistory(): ${e} `);
    return e;
  }
};

export default {
  createAssetOwnerHistory,
  updateAssetOwnerHistory,
  getAllAssetOwnersHistory,
  getAssetOwnerHistoryById,
  getAssetOwnersHistoryByAssetId,
  getAssetOwnersHistoryByOwnerId,
};
