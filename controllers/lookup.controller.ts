import lookupService from '../services/lookup.service';
import httpStatusCodes from 'http-status-codes';
import ApiResponse from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { resultsValidator } from '../validators/asset.validator';

const Logger = require('../config/logger');

const getAllLookups = async (req, res) => {
  Logger.info('LookupController:getAllLookups(): - start');

  const result = await lookupService.getAllLookups();

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('LookupController:getAllLookups(): - end');
};

const getLookupById = async (req, res) => {
  Logger.info('LookupController:getLookupById(): - start');

  const result = await lookupService.getLookupById(req.params.id);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('LookupController:getLookupById(): - end');
};

const getLookupByName = async (req, res) => {
  Logger.info('LookupController:getLookupByName(): - start');

  const result = await lookupService.getLookupByName(req.params.name);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('LookupController:getLookupByName(): - end');
};

const getLookupValueByKey = async (req, res) => {
  Logger.info('LookupController:getLookupValueByKey(): - start');

  const result = await lookupService.getLookupValueByKey(req.params.name, req.params.key);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('LookupController:getLookupValueByKey(): - end');
};

const createLookup = async (req, res) => {
  Logger.info('LookupController:createLookup(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await lookupService.createLookup(req.body);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('LookupController:createLookup(): - end');
};

const updateLookup = async (req, res) => {
  Logger.info('LookupController:updateLookup(): - start');

  //Call the method from the service layer
  const result = await lookupService.updateLookup(req.params.id, req.body);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('LookupController:updateLookup(): - end');
};

export default {
  createLookup,
  updateLookup,
  getAllLookups,
  getLookupById,
  getLookupByName,
  getLookupValueByKey,
};
