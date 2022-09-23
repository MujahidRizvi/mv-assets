import assetService from '../services/asset.service';
import helper from '../utils/helper';
import httpStatusCodes from 'http-status-codes';
import ApiResponse from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { resultsValidator } from '../validators/asset.validator';
import Logger from '../config/logger';
import { AssetType } from '../utils/enums';

const getAllAssetTypes = async (req, res) => {
  Logger.info('AssetController:getAllAssetTypes(): - start');

  const result = await assetService.getAllAssetTypes();

  Logger.info('AssetController:getAllAssetTypes(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getAllAssets = async (req, res) => {
  Logger.info('AssetController:getAllAssets(): - start');

  const page = Number(req.query.page) || 1;
  const size = Number(req.query.size) || Number.MAX_SAFE_INTEGER;
  const result = await assetService.getAllAssets(page, size);

  Logger.info('AssetController:getAllAssets(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const getAssetById = async (req, res) => {
  Logger.info('AssetController:getAssetById(): - start');

  const result = await assetService.getAssetById(req.params.id);

  Logger.info('AssetController:getAssetById(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getMetadataById = async (req, res) => {
  Logger.info('AssetController:getMetadataById(): - start');

  const result = await assetService.getAssetMetadataById(req.params.id, req.params.assetType);

  Logger.info('AssetController:getMetadataById(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getLandMetadataById = async (req, res) => {
  Logger.info('AssetController:getLandMetadataById(): - start');

  const result = await assetService.getAssetMetadataById(req.params.id, AssetType.LAND);

  Logger.info('AssetController:getLandMetadataById(): - end');

  // need to send custom response so that it can be picked by OpenSea
  res.status(httpStatusCodes.OK).send(result.metadata);
};
const getAssetsByContractId = async (req, res) => {
  Logger.info('AssetController:getAssetsBycontractId(): - start');

  const page = Number(req.query.page) || 1;
  const size = Number(req.query.size) || Number.MAX_SAFE_INTEGER;

  const result = await assetService.getAssetsByContractId(req.params.id, page, size);
  Logger.info('AssetController:getAssetsBycontractId(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const getAssetsByOwnerId = async (req, res) => {
  Logger.info('AssetController:getAssetsByOwnerId(): - start');

  const page = Number(req.query.page) || 1;
  const size = Number(req.query.size) || Number.MAX_SAFE_INTEGER;

  const result = await assetService.getAssetsByOwnerId(req.params.id, page, size);

  Logger.info('AssetController:getAssetsByOwnerId(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const getAssetsByAssetType = async (req, res) => {
  Logger.info('AssetController:getAssetsByAssetType(): - start');

  const result = await assetService.getAssetsByAssetType(req.params.assetType);

  Logger.info('AssetController:getAssetsByAssetType(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const getAssetsBySeasonName = async (req, res) => {
  Logger.info('AssetController:getAssetsBySeasonName(): - start');

  const result = await assetService.getAssetsBySeasonName(req.params.seasonName);

  Logger.info('AssetController:getAssetsBySeasonName(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const getAssetsByTypeAndLatLonRadius = async (req, res) => {
  Logger.info('AssetController:getAssetsByTypeAndLatLonRadius(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //check if page and size passed , if not default them to get all records matching the criteria
  const page = Number(req.query.page) || 1;
  const size = Number(req.query.size) || Number.MAX_SAFE_INTEGER;
  //call the service
  const result = await assetService.getAssetsByTypeAndLatLonRadius(
    req.query.assetType,
    req.query.lat,
    req.query.lon,
    req.query.radius,
    page,
    size,
  );

  Logger.info('AssetController:getAssetsByTypeAndLatLonRadius(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const createAsset = async (req, res) => {
  Logger.info('AssetController:createAsset(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await assetService.createAsset(req.body, req.files);

  Logger.info('AssetController:createAsset(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const updateAsset = async (req, res) => {
  Logger.info('AssetController:updateAsset(): - start');
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    await helper.removeAllTempAttachmentFile(req.files);
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const result = await assetService.updateAsset([req.params.id], req.body, req.files);

  Logger.info('AssetController:updateAsset(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const updateAssetOwner = async (req, res) => {
  Logger.info('AssetController:updateAssetOwner(): - start');
  const hasErrors = resultsValidator(req);

  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await assetService.updateAssetOwner(req.params.id, req.body.ownerId);
  const ownerId = result.ownerId;

  Logger.info('AssetController:updateAssetOwner(): - end');
  ApiResponse.result(res, { ownerId }, httpStatusCodes.OK);
};
const updateAssetStatus = async (req, res) => {
  Logger.info('AssetController:updateAssetStatus(): - start');
  const hasErrors = resultsValidator(req);

  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await assetService.updateAssetStatus(req.params.id, req.body.assetStatus);
  const assetStatus = result.assetStatus;

  Logger.info('AssetController:updateAssetStatus(): - end');
  ApiResponse.result(res, { assetStatus }, httpStatusCodes.OK);
};

const uploadFiles = async (req, res) => {
  Logger.info('AssetController:uploadFiles(): - start');

  //Call the method from the service layer
  const result = await assetService.uploadFiles(req.body.assetIds, req.files);

  Logger.info('AssetController:updateAsset(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const exportAssetType = async (req, res) => {
  Logger.info('AssetController:getAllAssets(): - start');
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await assetService.exportAssetsData(
    req.query.minId,
    req.query.maxId,
    req.query.assetType,
    req.query.page ? req.query.page : 1,
    req.query.pageSize ? req.query.pageSize : Number.MAX_SAFE_INTEGER,
  );

  Logger.info('AssetController:getAllAssets(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const importBulkLandAsset = async (req, res) => {
  Logger.info('AssetController:importBulkLandAsset(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await assetService.importBulkLandAsset(req.body);

  Logger.info('AssetController:importBulkLandAsset(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const importBulkAsset = async (req, res) => {
  Logger.info('AssetController:importBulkLandAsset(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await assetService.importBulkAsset(req.body, req.files);

  Logger.info('AssetController:importBulkLandAsset(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getAssetsByFilter = async (req, res) => {
  Logger.info('AssetController:getAssetsByFilter(): - start');
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await assetService.getAssetsByFilter(req.body);

  Logger.info('AssetController:getAllContracts(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
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
  getAssetsByTypeAndLatLonRadius,
  getMetadataById,
  getLandMetadataById,
  uploadFiles,
  exportAssetType,
  importBulkLandAsset,
  getAllAssetTypes,
  getAssetsByFilter,
  importBulkAsset,
};
