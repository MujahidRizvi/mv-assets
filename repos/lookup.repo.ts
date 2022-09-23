import Lookup from '../models/lookup.model';
import Logger from '../config/logger';

/*
 *get all contracts
 */
const getAllLookups = async () => {
  Logger.info('LookupRepo:getAllLookups(): - start');

  const result = await Lookup.findAll();

  Logger.info('LookupRepo:getAllLookups(): - end');

  return result;
};

/*
 *get lookup by id
 */
const getLookupById = async (id: number) => {
  Logger.info('LookupRepo:getLookupById(): - start');

  const result = await Lookup.findOne({ where: { id } });

  Logger.info('LookupRepo:getLookupById(): - end');

  return result;
};

/*
 *get lookup by name
 */
const getLookupByName = async (name: string) => {
  Logger.info('LookupRepo:getLookupByName(): - start');

  const result = await Lookup.findOne({ where: { name } });

  Logger.info('LookupRepo:getLookupByName(): - end');

  return result;
};

/*
 *get lookup value by lookup name and key
 */
const getLookupValueByKey = async (name: string, key: string) => {
  Logger.info('LookupRepo:getLookupValueByKey(): - start');

  const result = await Lookup.findOne({ where: { name, key } });

  Logger.info('LookupRepo:getLookupValueByKey(): - end');

  return result;
};

/*
 *create lookup method , it will create a new lookup entry
 */
const createLookup = async (lookup: any) => {
  try {
    Logger.info('LookupRepo:createLookup(): - start');

    //call the save method to save the user account
    const result = await lookup.save();

    Logger.info('LookupRepo:createLookup(): - end');

    return result;
  } catch (e) {
    Logger.error(`LookupRepo:createLookup(): ${e} `);
    throw e;
  }
};

const updateLookup = async (id: number, lookup: any) => {
  try {
    Logger.info('LookupRepo:updateLookup(): - start');

    const result = await Lookup.update(lookup, {
      where: {
        id,
      },
      returning: true,
      plain: true,
    });
    Logger.info('LookupRepo:updateLookup(): - end');

    return result[1].dataValues;
  } catch (e) {
    Logger.error(`LookupRepo:updateLookup(): ${e} `);
    return e;
  }
};

export default {
  createLookup,
  updateLookup,
  getAllLookups,
  getLookupById,
  getLookupByName,
  getLookupValueByKey,
};
