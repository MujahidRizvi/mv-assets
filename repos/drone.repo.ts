import Drone from '../models/drone.model';
import Logger from '../config/logger';
import { QueryTypes, Op } from 'sequelize';
import sequelize from '../config/database';
import fs from 'fs';
import helperFunctions from '../utils/helper';
import { RAW_QUERY_FILE, DEFAULT_IMAGE_FILE_NAME, DEFAULT_ANIMATION_FILE_NAME } from '../utils/constants';

/*
 *get all asset
 */
const getDrones = async (page: number, size: number) => {
  Logger.info('DroneRepo:getDrone(): - start');
  let pageSize: number = 0;

  if (size !== Number.MAX_SAFE_INTEGER) pageSize = (page - 1) * size;
  const result = await Drone.findAll({
    offset: pageSize,
    limit: size,
  });

  Logger.info('DroneRepo:getDrone(): - end');

  return result;
};

const getAllDroneCount = async () => {
  Logger.info('DroneRepo:getDroneCount(): - start');

  let result = await Drone.findAndCountAll({
   
  });

  Logger.info('AssetRepo:getAssetsCount(): - end');

  return result.count;
};

export default {
  getDrones,
  getAllDroneCount
};
