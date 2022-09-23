import httpStatusCodes from 'http-status-codes';
import LandBuilding from '../models/land-building.model';
import landBuildingRepo from '../repos/land-building.repo';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import Logger from '../config/logger';

const getAllLandBuildings = async () => {
  Logger.info('LandBuildingService:getAllLandBuilding(): - start');

  const result = await landBuildingRepo.getAllLandBuildings();

  Logger.info('LandBuildingService:getAllLandBuilding(): - end');

  return result;
};

const getLandBuildingById = async (id: number) => {
  Logger.info('LandBuildingService:getLandBuildingById(): - start');

  const result = await landBuildingRepo.getLandBuildingById(id);

  if (!result) {
    Logger.error(`land building ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.LAND_BUILDING_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('LandBuildingService:getLandBuildingById(): - end');

  return result;
};

const getLandBuildingsByLandId = async (landId: number) => {
  Logger.info('LandBuildingService:getLandBuildingsByLandId(): - start');

  const result = await landBuildingRepo.getLandBuildingsByLandId(landId);

  Logger.info('LandBuildingService:getLandBuildingsByLandId(): - end');

  return result;
};

/*
 *get by buildingId
 */
const getLandBuildingsByBuildingId = async (buildingId: number) => {
  Logger.info('LandBuildingService:getLandBuildingsByBuildingId(): - start');

  const result = await landBuildingRepo.getLandBuildingsByBuildingId(buildingId);

  Logger.info('LandBuildingService:getLandBuildingsByBuildingId(): - end');

  return result;
};

const createLandBuilding = async (landBuilding: any) => {
  //get the name to check if the lookup address exists
  //const lookupName = lookup.name;

  //call to the check by method
  // const lookupExists = await landBuildingRepo.getLandBuildingsByLandId(lookupName);

  // if (!lookupExists)
  // {
  // Get the lookup passed it and created the lookup obj for creation
  const newLandBuilding = new LandBuilding();

  newLandBuilding.landId = landBuilding.landId;
  newLandBuilding.buildingId = landBuilding.buildingId;

  return landBuildingRepo.createLandBuilding(newLandBuilding);
  // }
  // else
  // {
  //   throw new ApiError(httpStatusCodes.BAD_REQUEST,locale.LOOKUP_EXIST_WITH_NAME({ name: lookupName }),httpStatusCodes.BAD_REQUEST);
  // }
};

const updateLandBuilding = async (id: number, landBuilding: any) => {
  // Get the lookup passed it and created the lookup obj for creation

  const result = await landBuildingRepo.updateLandBuilding(id, landBuilding);

  if (!result) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.LAND_BUILDING_NOT_FOUND({ id }),
      httpStatusCodes.BAD_REQUEST,
    );
  }
  return result;
};

export default {
  createLandBuilding,
  updateLandBuilding,
  getAllLandBuildings,
  getLandBuildingById,
  getLandBuildingsByLandId,
  getLandBuildingsByBuildingId,
};
