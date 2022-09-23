import droneService from '../services/drone.service';
import helper from '../utils/helper';
import httpStatusCodes from 'http-status-codes';
import ApiResponse from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { resultsValidator } from '../validators/asset.validator';
import Logger from '../config/logger';
import { AssetType } from 'utils/enums';
import { ENUM } from 'sequelize/types';

const getDrones = async (req, res) => {
  Logger.info('DroneController:getDrones(): - start');

  const result = await droneService.getDrones(req.query.playerAddress,req.query.page, req.query.size);

  Logger.info('DroneController:getDrones(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};
/*const buyDrones = async (req, res) => {
  Logger.info('DroneController:buyDrones(): - start');

  const result = await droneService.buyDrones(req.body.droneId,req.body.price,req.body.signer);

  Logger.info('DroneController:buyDrones(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};*/

const markDroneForSale = async (req, res) => {
  Logger.info('DroneController:markDroneForSale(): - start');

  const result = await droneService.markDroneForSale(req.body.droneId,req.body.price);

  Logger.info('DroneController:markDroneForSale(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

export default {
  getDrones,
 // buyDrones,
  markDroneForSale
};
