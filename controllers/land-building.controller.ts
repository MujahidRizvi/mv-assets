import landBuildingService from '../services/land-building.service';
import httpStatusCodes from 'http-status-codes';
import ApiResponse from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { resultsValidator } from '../validators/asset.validator';

const Logger = require('../config/logger');

const getAllLandBuildings = async (req, res) => {
  Logger.info('Land-BuildingController:getAllLandBuildings(): - start');

  const result = await landBuildingService.getAllLandBuildings();

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('Land-BuildingController:getAllLandBuildings(): - end');
};

const getLandBuildingById = async (req, res) => {
  Logger.info('Land-BuildingController:getLandBuildingById(): - start');

  const result = await landBuildingService.getLandBuildingById(req.params.id);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('Land-BuildingController:getLandBuildingById(): - end');
};

const getLandBuildingsByLandId = async (req, res) => {
  Logger.info('Land-BuildingController:getLandBuildingsByLandId(): - start');

  const result = await landBuildingService.getLandBuildingsByLandId(req.params.landId);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('Land-BuildingController:getLandBuildingsByLandId(): - end');
};

const getLandBuildingsByBuildingId = async (req, res) => {
  Logger.info('Land-BuildingController:getLandBuildingsByBuildingId(): - start');

  const result = await landBuildingService.getLandBuildingsByBuildingId(req.params.buildingId);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('Land-BuildingController:getLandBuildingsByBuildingId(): - end');
};

const createLandBuilding = async (req, res) => {
  Logger.info('Land-BuildingController:createLandBuilding(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      hasErrors.toString(),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await landBuildingService.createLandBuilding(req.body);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('Land-BuildingController:createLandBuilding(): - end');
};

const updateLandBuilding = async (req, res) => {
  Logger.info('Land-BuildingController:updateLandBuilding(): - start');

  //Call the method from the service layer
  const result = await landBuildingService.updateLandBuilding(req.params.id, req.body);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('Land-BuildingController:updateLandBuilding(): - end');
};

export default {
  createLandBuilding,
  updateLandBuilding,
  getAllLandBuildings,
  getLandBuildingById,
  getLandBuildingsByLandId,
  getLandBuildingsByBuildingId,
};
