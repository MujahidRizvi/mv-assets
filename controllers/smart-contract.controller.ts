import contractService from '../services/smart-contract.service';
import httpStatusCodes from 'http-status-codes';
import ApiResponse from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import { resultsValidator } from '../validators/asset.validator';
import Logger from '../config/logger';

const updatePauseStatus = async (req, res) => {
  Logger.info('Smart-Contract-Controller:updatePauseStatus(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.updatePauseStatus(req.params.contractId, req.body.status);

  Logger.info('Smart-Contract-Controller:updatePauseStatus(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getPauseStatus = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getPauseStatus(): - start');

  //Call the method from the service layer
  const result = await contractService.getPauseStatus(req.params.contractId);

  Logger.info('Smart-Contract-Controller:getPauseStatus(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const buildWhiteListUsers = async (req, res) => {
  Logger.info('ContractController:buildWhiteListUsers(): - start');
  const hasErrors = resultsValidator(req);

  if (!req.files || hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      locale.UPLOAD_FILE_NOT_SELECTED,
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  //Call the method from the service layer
  const result = await contractService.buildWhiteListUsers(req.body.contractId, req.files.file[0]);

  Logger.info('ContractController:buildWhiteListUsers(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const verifyWhiteListUser = async (req, res) => {
  Logger.info('ContractController:verifyWhiteListUser(): - start');

  //Call the method from the service layer
  const result = await contractService.verifyWhiteListUser(req.params.contractId, req.query.userAddress);

  Logger.info('ContractController:verifyWhiteListUser(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const updateMintingStatus = async (req, res) => {
  Logger.info('Smart-Contract-Controller:updateMintingStatus(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.updateMintingStatus(req.params.contractId, req.body.status);

  Logger.info('Smart-Contract-Controller:updatePauseStatus(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getMintingStatus = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getMintingStatus(): - start');

  //Call the method from the service layer
  const result = await contractService.getMintingStatus(req.params.contractId);

  Logger.info('Smart-Contract-Controller:getMintingStatus(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const updateBaseURI = async (req, res) => {
  Logger.info('Smart-Contract-Controller:updateBaseURI(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.updateBaseURI(req.params.contractId, req.body.baseURI);

  Logger.info('Smart-Contract-Controller:updatePauseStatus(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getBaseURI = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getBaseURI(): - start');

  //Call the method from the service layer
  const result = await contractService.getBaseURI(req.params.contractId);

  Logger.info('Smart-Contract-Controller:getBaseURI(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const updatePublicSaleStatus = async (req, res) => {
  Logger.info('Smart-Contract-Controller:updatePublicSaleStatus(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.updatePublicSaleStatus(req.params.contractId, req.body.status);

  Logger.info('Smart-Contract-Controller:updatePublicSaleStatus(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getPublicSaleStatus = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getPublicSaleStatus(): - start');

  //Call the method from the service layer
  const result = await contractService.getPublicSaleStatus(req.params.contractId);

  Logger.info('Smart-Contract-Controller:getPublicSaleStatus(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const updateLandMintingLimitPerAddress = async (req, res) => {
  Logger.info('Smart-Contract-Controller:updateLandMintingLimitPerAddress(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.updateLandMintingLimitPerAddress(req.params.contractId, req.body.mintLimit);

  Logger.info('Smart-Contract-Controller:updateLandMintingLimitPerAddress(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getLandMintingLimitPerAddress = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getLandMintingLimitPerAddress(): - start');

  //Call the method from the service layer
  const result = await contractService.getLandMintingLimitPerAddress(req.params.contractId);

  Logger.info('Smart-Contract-Controller:getLandMintingLimitPerAddress(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const mintLand = async (req, res) => {
  Logger.info('Smart-Contract-Controller:mintLand(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.mintLand(
    req.params.contractId,
    req.body.id,
    req.body.type,
    req.body.toAddress,
    req.body.key,
    req.body.proof,
  );

  Logger.info('Smart-Contract-Controller:mintLand(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const mintObject = async (req, res) => {
  Logger.info('Smart-Contract-Controller:mintObject(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.mintObject(req.params.contractId, req.body.id, req.body.toAddress, req.body.key);

  Logger.info('Smart-Contract-Controller:mintObject(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
const getDataById = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getDataById(): - start');

  //Call the method from the service layer
  const result = await contractService.getDataById(req.params.contractId, req.params.id);

  Logger.info('Smart-Contract-Controller:getDataById(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getDataByAddress = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getDataByAddress(): - start');

  //Call the method from the service layer
  const result = await contractService.getDataByAddress(req.params.contractId, req.params.address);

  Logger.info('Smart-Contract-Controller:getDataByAddress(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getInventoryByAddress = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getInventoryByAddress(): - start');

  //Call the method from the service layer
  const result = await contractService.getInventoryByAddress(req.params.address);

  Logger.info('Smart-Contract-Controller:getInventoryByAddress(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getTokenURI = async (req, res) => {
  Logger.info('Smart-Contract-Controller:getTokenURI(): - start');

  //Call the method from the service layer
  const result = await contractService.getTokenURI(req.params.contractId, req.params.tokenId);

  Logger.info('Smart-Contract-Controller:getTokenURI(): - end');

  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const addWhitelistAdmin = async (req, res) => {
  Logger.info('Smart-Contract-Controller:addWhitelistAdmin(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.addWhitelistAdmin(
    req.params.contractId,
    req.body.userAddresses,
    req.body.permission,
  );

  Logger.info('Smart-Contract-Controller:addWhitelistAdmin(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const removeWhitelistAdmin = async (req, res) => {
  Logger.info('Smart-Contract-Controller:removeWhitelistAdmin(): - start');
  //Call the method from the service layer
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.removeWhitelistAdmin(req.params.contractId, req.body.userAddresses);

  Logger.info('Smart-Contract-Controller:removeWhitelistAdmin(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
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
