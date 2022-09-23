import httpStatusCodes from 'http-status-codes';
import AssetOwner from '../models/asset-owner-history.model';
import assetOwnerHistoryRepo from '../repos/asset-owner-history.repo';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import Logger from '../config/logger';

const getAllAssetOwners = async () => {
  Logger.info('AssetOwnerHistoryService:getAllAssetOwnersHistory(): - start');

  const result = await assetOwnerHistoryRepo.getAllAssetOwnersHistory();

  Logger.info('AssetOwnerHistoryService:getAllAssetOwnersHistory(): - end');

  return result;
};

const getAssetOwnerHistoryById = async (id: number) => {
  Logger.info('AssetOwnerHistoryService:getAssetOwnerHistoryById(): - start');

  const result = await assetOwnerHistoryRepo.getAssetOwnerHistoryById(id);

  if (!result) {
    Logger.error(`land building ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_OWNER_HISTORY_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('AssetOwnerHistoryService:getAssetOwnerHistoryById(): - end');

  return result;
};

const getAssetOwnersHistoryByAssetId = async (assetId: number) => {
  Logger.info('AssetOwnerHistoryService:getAssetOwnersHistoryByAssetId(): - start');

  const result = await assetOwnerHistoryRepo.getAssetOwnersHistoryByAssetId(assetId);

  Logger.info('AssetOwnerHistoryService:getAssetOwnersHistoryByAssetId(): - end');

  return result;
};

/*
 *get by ownerId
 */
const getAssetOwnersHistoryByOwnerId = async (buildingId: number) => {
  Logger.info('AssetOwnerHistoryService:getAssetOwnersHistoryByOwnerId(): - start');

  const result = await assetOwnerHistoryRepo.getAssetOwnersHistoryByOwnerId(buildingId);

  Logger.info('AssetOwnerHistoryService:getAssetOwnersHistoryByOwnerId(): - end');

  return result;
};

const createAssetOwnerHistory = async (assetOwner: any) => {
  Logger.info('AssetOwnerHistoryService:createAssetOwnerHistory(): - start');
  const newAssetOwner = new AssetOwner();

  newAssetOwner.assetId = assetOwner.assetId;
  newAssetOwner.ownerId = assetOwner.ownerId;

  Logger.info('AssetOwnerHistoryService:createAssetOwnerHistory(): - end');
  return assetOwnerHistoryRepo.createAssetOwnerHistory(newAssetOwner);
};

const createAssetOwnerHistoryByParams = async (assetId: number, ownerId: number) => {
  Logger.info('AssetOwnerHistoryService:createAssetOwnerHistoryByParams(): - start');
  const newAssetOwner = new AssetOwner();

  newAssetOwner.assetId = assetId;
  newAssetOwner.ownerId = ownerId;

  Logger.info('AssetOwnerHistoryService:createAssetOwnerHistoryByParams(): - end');
  return assetOwnerHistoryRepo.createAssetOwnerHistory(newAssetOwner);
};
const updateAssetOwnerHistory = async (id: number, assetOwner: any) => {
  Logger.info('AssetOwnerHistoryService:updateAssetOwnerHistory(): - start');
  // Get the lookup passed it and created the lookup obj for creation
  const result = await assetOwnerHistoryRepo.updateAssetOwnerHistory(id, assetOwner);
  Logger.info('AssetOwnerHistoryService:updateAssetOwnerHistory(): - end');
  if (!result) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.ASSET_OWNER_HISTORY_NOT_FOUND({ id }),
      httpStatusCodes.BAD_REQUEST,
    );
  }
  return result;
};

export default {
  createAssetOwnerHistory,
  createAssetOwnerHistoryByParams,
  updateAssetOwnerHistory,
  getAllAssetOwners,
  getAssetOwnerHistoryById,
  getAssetOwnersHistoryByAssetId,
  getAssetOwnersHistoryByOwnerId,
};
