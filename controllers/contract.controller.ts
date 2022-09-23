import contractService from '../services/contract.service';
import httpStatusCodes from 'http-status-codes';
import ApiResponse from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { resultsValidator } from '../validators/contract.validator';
import helper from '../utils/helper';

const Logger = require('../config/logger');

const getAllContracts = async (req, res) => {
  Logger.info('ContractController:getAllContracts(): - start');
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.getAllContracts(req.query.page, req.query.size);

  Logger.info('ContractController:getAllContracts(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getAllActiveContracts = async (req, res) => {
  Logger.info('ContractController:getAllActiveContracts(): - start');

  const result = await contractService.getAllActiveContracts();

  Logger.info('ContractController:getAllActiveContracts(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getAllContractsFilter = async (req, res) => {
  Logger.info('ContractController:getAllContractsFilter(): - start');
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  const result = await contractService.getAllContractsFilter(req.query);

  Logger.info('ContractController:getAllContracts(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getContractById = async (req, res) => {
  Logger.info('ContractController:getContractById(): - start');

  const result = await contractService.getContractById(req.params.id);

  Logger.info('ContractController:getContractById(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getContractsByAssetType = async (req, res) => {
  Logger.info('ContractController:getContractsByAssetType(): - start');

  const result = await contractService.getContractsByAssetType(req.params.assetType);

  Logger.info('ContractController:getContractsByAssetType(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getContractsByCategoryId = async (req, res) => {
  Logger.info('ContractController:getContractsByCategoryId(): - start');

  const result = await contractService.getContractsByCategoryId(req.params.id);

  Logger.info('ContractController:getContractsByCategoryId(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getContractsBySeasonName = async (req, res) => {
  Logger.info('ContractController:getContractsBySeasonName(): - start');

  const result = await contractService.getContractsBySeasonName(req.params.seasonName);

  Logger.info('ContractController:getContractsBySeasonName(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const createContract = async (req, res) => {
  Logger.info('ContractController:createContract(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    await helper.removeAllTempAttachmentFile(req.files);
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await contractService.createContract(req.body, req.files);

  Logger.info('ContractController:createContract(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const updateContract = async (req, res) => {
  Logger.info('ContractController:updateContract(): - start');
  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    await helper.removeAllTempAttachmentFile(req.files);
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
  //Call the method from the service layer
  const result = await contractService.updateContract(req.params.id, req.body, req.files);

  Logger.info('ContractController:updateContract(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const buildCollectionPanel = async (req, res) => {
  Logger.info('ContractController:buildCollectionPanel(): - start');
  const result = await contractService.buildCollectionPanel(req.params.id);
  Logger.info('ContractController:buildCollectionPanel(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getSearchFilterPanel = async (req, res) => {
  Logger.info('ContractController:getSearchFilterPanel(): - start');
  const result = await contractService.getSearchFilterPanel(req.params.id);
  Logger.info('ContractController:getSearchFilterPanel(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

export default {
  createContract,
  updateContract,
  getContractsByCategoryId,
  getAllContracts,
  getContractById,
  getSearchFilterPanel,
  getContractsByAssetType,
  getContractsBySeasonName,
  getAllContractsFilter,
  buildCollectionPanel,
  getAllActiveContracts
};
