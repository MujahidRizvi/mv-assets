import inventoryService from '../services/inventory.service';
import httpStatusCodes from 'http-status-codes';
import ApiResponse from '../utils/ApiResponse';
import { InventoryType } from 'utils/enums';

const Logger = require('../config/logger');

const getAllInventory = async (req, res) => {
  Logger.info('InventoryController:getAllInventory(): - start');

  const result = await inventoryService.getAllInventory();

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('InventoryController:getAllInventory(): - end');
};

const getActiveInventory = async (req, res) => {
  Logger.info('InventoryController:getActiveInventory(): - start');

  const result = await inventoryService.getActiveInventory();

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('InventoryController:getActiveInventory(): - end');
};

const getInventoryById = async (req, res) => {
  Logger.info('InventoryController:getInventoryById(): - start');

  const result = await inventoryService.getInventoryById(req.params.id);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('InventoryController:getInventoryById(): - end');
};

const getRewardMetaDataById = async (req, res) => {
  Logger.info('InventoryController:getMetaDataByIdAndType(): - start');

  const result = await inventoryService.getMetaDataByIdAndType(req.params.id, InventoryType.REWARD);

  // ApiResponse.result(res, result, httpStatusCodes.OK);
  // need to send custom response so that it can be picked by OpenSea
  res.status(httpStatusCodes.OK).send(result);

  Logger.info('InventoryController:getInventoryById(): - end');
};

const getInventoryByType = async (req, res) => {
  Logger.info('InventoryController:getInventoryByType(): - start');

  const result = await inventoryService.getInventoryByType(req.params.type);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('InventoryController:getInventoryByType(): - end');
};

const getRandomReward = async (req, res) => {
  Logger.info('InventoryController:getRandomReward(): - start');

  const result = await inventoryService.getRandomReward();

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('InventoryController:getRandomReward(): - end');
};

const getRewardsByPlayerAddress = async (req, res) => {
  Logger.info('InventoryController:getRewardsByPlayerAddress(): - start');

  const result = await inventoryService.getRewardsByPlayerAddress(req.params.address);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('InventoryController:getRewardsByPlayerAddress(): - end');
};

const mintRewards = async (req, res) => {
  Logger.info('InventoryController:mintRewards(): - start');

  const result = await inventoryService.mintRewards(req.body.address, req.body.rewardIds);

  ApiResponse.result(res, result, httpStatusCodes.OK);

  Logger.info('InventoryController:mintRewards(): - end');
};

export default {
  getAllInventory,
  getActiveInventory,
  getInventoryById,
  getInventoryByType,
  getRandomReward,
  getRewardsByPlayerAddress,
  getRewardMetaDataById,
  mintRewards,
};
