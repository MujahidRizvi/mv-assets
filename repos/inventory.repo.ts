import Invetory from '../models/inventory.model';
import Logger from '../config/logger';

/*
 *get all inventory items
 */
const getAllInventory = async () => {
  Logger.info('InventoryRepo:getAllInventory(): - start');

  const result = await Invetory.findAll();

  Logger.info('InventoryRepo:getAllInventory(): - end');

  return result;
};

/*
 *get all activeinventory items
 */
const getActiveInventory = async () => {
  Logger.info('InventoryRepo:getActiveInventory(): - start');

  const result = await Invetory.findAll({ where: { isActive: true } });

  Logger.info('InventoryRepo:getActiveInventory(): - end');

  return result;
};

/*
 *get inventory by id
 */
const getInventoryById = async (id: number) => {
  Logger.info('InventoryRepo:getInventoryById(): - start');

  const result = await Invetory.findOne({ where: { id } });

  Logger.info('InventoryRepo:getInventoryById(): - end');

  return result;
};

/*
 *get inventory by type and id
 */
const getInventoryByIdAndType = async (id: number, type: string) => {
  Logger.info('InventoryRepo:getInventoryByIdAndType(): - start');

  const result = await Invetory.findOne({ where: { id, type } });

  Logger.info('InventoryRepo:getInventoryByIdAndType(): - end');

  return result;
};

/*
 *get data by type
 */
const getInventoryByType = async (type: string) => {
  Logger.info('InventoryRepo:getInventoryByType(): - start');

  const result = await Invetory.findAll({ where: { type } });

  Logger.info('InventoryRepo:getInventoryByType(): - end');

  return result;
};

export default {
  getAllInventory,
  getActiveInventory,
  getInventoryById,
  getInventoryByType,
  getInventoryByIdAndType,
};
