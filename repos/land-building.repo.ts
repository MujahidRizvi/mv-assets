import LandBuilding from '../models/land-building.model';
import Logger from '../config/logger';

/*
 *get all buildings
 */
const getAllLandBuildings = async () => {
  Logger.info('LandBuildingRepo:getAllLandBuildings(): - start');

  const result = await LandBuilding.findAll();

  Logger.info('LandBuildingRepo:getAllLandBuildings(): - end');

  return result;
};

/*
 *get landBuilding by id
 */
const getLandBuildingById = async (id: number) => {
  Logger.info('LandBuildingRepo:getLandBuildingById(): - start');

  const result = await LandBuilding.findOne({ where: { id } });

  Logger.info('LandBuildingRepo:getLandBuildingById(): - end');

  return result;
};

/*
 *get data by landId
 */
const getLandBuildingsByLandId = async (landId: number) => {
  Logger.info('LandBuildingRepo:getBuildingsByLandId(): - start');

  const result = await LandBuilding.findOne({ where: { landId } });

  Logger.info('LandBuildingRepo:getBuildingsByLandId(): - end');

  return result;
};

/*
 *get data by landId
 */
const getLandBuildingsByBuildingId = async (buildingId: number) => {
  Logger.info('LandBuildingRepo:getLandBuildingsByBuildingId(): - start');

  const result = await LandBuilding.findOne({ where: { buildingId } });

  Logger.info('LandBuildingRepo:getLandBuildingsByBuildingId(): - end');

  return result;
};
/*
 *create  method , it will create a new entry
 */
const createLandBuilding = async (landBuilding: any) => {
  try {
    Logger.info('LandBuildingRepo:createLandBuilding(): - start');

    //call the save method to save the user account
    const result = await landBuilding.save();

    Logger.info('LandBuildingRepo:createLandBuilding(): - end');

    return result;
  } catch (e) {
    Logger.error(`LandBuildingRepo:createLandBuilding(): ${e} `);
    throw e;
  }
};

const updateLandBuilding = async (id: number, landBuilding: any) => {
  try {
    Logger.info('LandBuildingRepo:updateLandBuilding(): - start');

    const result = await landBuilding.update(landBuilding, {
      where: {
        id,
      },
      returning: true,
      plain: true,
    });
    Logger.info('LandBuildingRepo:updateLandBuilding(): - end');

    return result[1].dataValues;
  } catch (e) {
    Logger.error(`LandBuildingRepo:updateLandBuilding(): ${e} `);
    return e;
  }
};

export default {
  createLandBuilding,
  updateLandBuilding,
  getAllLandBuildings,
  getLandBuildingById,
  getLandBuildingsByLandId,
  getLandBuildingsByBuildingId,
};
