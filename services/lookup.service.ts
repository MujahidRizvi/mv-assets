import httpStatusCodes from 'http-status-codes';
import Lookup from '../models/lookup.model';
import lookupRepo from '../repos/lookup.repo';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import Logger from '../config/logger';

const getAllLookups = async () => {
  Logger.info('LookupService:getAlllookups(): - start');

  const result = await lookupRepo.getAllLookups();

  Logger.info('LookupService:getAlllookups(): - end');

  return result;
};

const getLookupById = async (id: number) => {
  Logger.info('LookupService:getLookupById(): - start');

  const result = await lookupRepo.getLookupById(id);

  if (!result) {
    Logger.error(`lookup ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.LOOKUP_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('LookupService:getLookupById(): - end');

  return result;
};

const getLookupByName = async (lookupType: string) => {
  Logger.info('LookupService:getLookupByName(): - start');

  const result = await lookupRepo.getLookupByName(lookupType);

  Logger.info('LookupService:getLookupByName(): - end');

  return result;
};

/*
 *get lookups by season Name
 */
const getLookupValueByKey = async (name: string, key: string) => {
  Logger.info('LookupService:getLookupValueByKey(): - start');

  const result = await lookupRepo.getLookupValueByKey(name, key);

  Logger.info('LookupService:getLookupValueByKey(): - end');

  return result;
};

const createLookup = async (lookup: any) => {
  //get the name to check if the lookup address exists
  const lookupName = lookup.name;

  //call to the check by method
  const lookupExists = await lookupRepo.getLookupByName(lookupName);

  if (!lookupExists) {
    // Get the lookup passed it and created the lookup obj for creation
    const newLookup = new Lookup();

    newLookup.name = lookup.name;
    newLookup.key = lookup.key;
    newLookup.value = lookup.value;

    return lookupRepo.createLookup(newLookup);
  } else {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.LOOKUP_EXIST_WITH_NAME({ name: lookupName }),
      httpStatusCodes.BAD_REQUEST,
    );
  }
};

const updateLookup = async (lookupId: number, lookup: any) => {
  // Get the lookup passed it and created the lookup obj for creation

  const result = await lookupRepo.updateLookup(lookupId, lookup);

  if (!result) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.LOOKUP_NOT_FOUND({ id: lookupId }),
      httpStatusCodes.BAD_REQUEST,
    );
  }
  return result;
};

export default {
  createLookup,
  updateLookup,
  getAllLookups,
  getLookupById,
  getLookupByName,
  getLookupValueByKey,
};
