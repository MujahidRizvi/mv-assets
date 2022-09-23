import Logger from '../config/logger';
import { QueryTypes, Op } from 'sequelize';
import sequelize from '../config/database';
import fs from 'fs';
import helperFunctions from '../utils/helper';
import { RAW_QUERY_FILE, DEFAULT_IMAGE_FILE_NAME, DEFAULT_ANIMATION_FILE_NAME } from '../utils/constants';
import AssetType from '../models/asset-type.model';


/*
 *get asset types
 */
const getAllAssetTypes= async () => {
  Logger.info('Asset-type Repo:getAllAssetTypes(): - start');

  const result = await AssetType.findAll();

  Logger.info('Asset-type Repo:getAllAssetTypes(): - end');

  return result;
};



export default {
  getAllAssetTypes
};
