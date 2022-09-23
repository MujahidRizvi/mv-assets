import httpStatusCodes from 'http-status-codes';
import Asset from '../models/asset.model';
import assetRepo from '../repos/asset.repo';
import assetTypeRepo from '../repos/asset-type.repo';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import Logger from '../config/logger';
import pinataFunction from '../utils/pinata';
import util from 'util';
import fs from 'fs';
import helper from '../utils/helper';
import zipStream from 'node-stream-zip';
import {
  EARTH_RADIUS_IN_METERS,
  DEFAULT_IMAGE_FILE_NAME,
  DEFAULT_ANIMATION_FILE_NAME,
  DEFAULT_STICKER_FILE_NAME,
  LAND_EXPORT_TEMPLATE,
} from '../utils/constants';

import { AssetStatus, AssetType } from '../utils/enums';

const unlinkFile = util.promisify(fs.unlink);

/**
 * getAllAssetTypes is a function which will return all assets types.
 * @returns all assets types
 */
const getAllAssetTypes = async () => {
  Logger.info('AssetService:getAllAssetTypes(): - start');

  const result = await assetTypeRepo.getAllAssetTypes();

  Logger.info('AssetService:getAllAssetTypes(): - end');
  return result;
};

/**
 * getAllAssets is a function which will return all assets.
 * @param page
 * @param size
 * @returns all assets returned
 */
const getAllAssets = async (page: number, size: number) => {
  Logger.info('AssetService:getAllAssets(): - start');

  //get count of data returned from the query
  const total = await assetRepo.getAssetsCount();

  //get total number of pages
  const totalPages = Math.ceil(total / size);

  const result = await assetRepo.getAllAssets(page, size);

  Logger.info('AssetService:getAllAssets(): - end');
  return { result, total, page, totalPages };
};

/**
 * getAssetsById is a function which will return asset by id.
 * @param  id
 * @returns asset returned
 */
const getAssetById = async (id: number) => {
  Logger.info('AssetService:getAssetById(): - start');

  const result = await assetRepo.getAssetById(id);

  if (!result) {
    Logger.error(`asset ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }

  const asset = {
    id: result.id,
    contractId: result.contractId,
    ownerId: result.ownerId,
    assetLocation: result.assetLocation,
    price: result.price,
    lat: result.lat,
    lon: result.lon,
    assetName: result.assetName,
    seasonName: result.seasonName,
    assetType: result.assetType,
    assetStatus: result.assetStatus,
    imageName: result.imageName
      ? process.env.PINATA_GET_URL.concat(result.imageName)
      : process.env.PINATA_GET_URL.concat(DEFAULT_IMAGE_FILE_NAME),
    animationName: result.animationName
      ? process.env.PINATA_GET_URL.concat(result.animationName)
      : process.env.PINATA_GET_URL.concat(DEFAULT_ANIMATION_FILE_NAME),
    stickerName: result.stickerName
      ? process.env.PINATA_GET_URL.concat(result.stickerName)
      : process.env.PINATA_GET_URL.concat(DEFAULT_STICKER_FILE_NAME),

    isActive: result.isActive,
    createdBy: result.createdBy,
    updatedBy: result.updatedBy,
    attributes: result.attributes,
  };
  Logger.info('AssetService:getAssetById(): - end');

  return asset;
};

/**
 * getAssetsByIds is a function which will return asset by id.
 * @param  assetIds
 * @returns asset returned
 */
const exportAssetsData = async (minId: number, maxId: number, type: any, page: number, size: number) => {
  Logger.info('AssetService:getAssets(): - start');

  const total = await assetRepo.getAssetsCount(minId, maxId, type);

  //get total number of pages
  const totalPages = Math.ceil(total / size);

  const result = await assetRepo.getAssets(minId, maxId, type, page, size);

  if (!result) {
    Logger.error(`asset ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }
  const mapedResult = result.map((asset: any) => {
    let data = {
      id: asset.id,
      name: asset.assetName,
      seasonName: asset.seasonName,
      status: asset.assetStatus,
      imageName: process.env.PINATA_GET_URL + (asset.imageName ? asset.imageName : DEFAULT_IMAGE_FILE_NAME),
      animationName:
        process.env.PINATA_GET_URL + (asset.animationName ? asset.animationName : DEFAULT_ANIMATION_FILE_NAME),
      stickerName: process.env.PINATA_GET_URL + (asset.stickerName ? asset.stickerName : DEFAULT_STICKER_FILE_NAME),
      isActive: asset.isActive,
      description: asset.description,
      price: asset.price,
      assetType: asset.assetType,
      assetStatus: asset.assetStatus,
    };
    if (asset.attributes) {
      asset.attributes.forEach((val: any) => {
        data[val['trait_type']] = val['value'];
      });
    }
    //console.log(asset.attributes,"Attr")
    return {
      type: 'Feature',
      properties: data,
      geometry: { type: 'Polygon', coordinates: asset.assetLocation ? JSON.parse(asset.assetLocation) : [] },
    };
  });
  Logger.info('AssetService:getAssetByIds(): - end');
  let resultTemplate = LAND_EXPORT_TEMPLATE;

  resultTemplate['features'] = mapedResult;
  resultTemplate['totalPages'] = totalPages;
  resultTemplate['total'] = total;
  resultTemplate['page'] = page;
  resultTemplate['size'] = size;

  return resultTemplate;
};

/**
 * getAssetsByIds is a function which will return asset by id.
 * @param  assetIds
 * @returns asset returned
 */
const getAssetByIds = async (assetIds: number[]) => {
  Logger.info('AssetService:getAssetByIds(): - start');

  const result = await assetRepo.getAssetByIds(assetIds);

  if (!result) {
    Logger.error(`asset ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('AssetService:getAssetByIds(): - end');

  return result;
};

/**
 * getAssetByIdsOrderByContractId is a function which will return asset by id.
 * @param  assetIds
 * @returns asset returned
 */
const getAssetByIdsOrderByContractId = async (assetIds: number[]) => {
  Logger.info('AssetService:getAssetByIdsOrderByContractId(): - start');

  const result = await assetRepo.getAssetByIdsOrderByContractId(assetIds);

  if (!result) {
    Logger.error(`asset ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('AssetService:getAssetByIdsOrderByContractId(): - end');

  return result;
};

/**
 * getAssetMetadataById is a function which will return asset by id as metadata for contract.
 * @param  id
 * @returns asset returned
 */
const getAssetMetadataById = async (id: number, assetType: string) => {
  Logger.info('AssetService:getAssetMetadataById(): - start');

  let metadata = {};
  const attributesJson = [];

  let result = await assetRepo.getAssetById(id);

  if (!result) {
    Logger.error(`asset ${result} not found`);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_NOT_EXIST, httpStatusCodes.BAD_REQUEST);
  }
  Logger.info('AssetService:getAssetMetadataById(): - end');

  //build up the data that will set the metadata object
  Object.entries(result.attributes).forEach(([key, value]) => {
    attributesJson.push(value);
  });

  if (assetType === AssetType.LAND) {
    attributesJson.push(
      {
        trait_type: 'Latitude',
        value: result.lat,
      },
      {
        trait_type: 'Longitude',
        value: result.lon,
      },
      {
        trait_type: 'Polygon',
        value: result.assetLocation,
      },
      {
        trait_type: 'Status',
        value: result.assetStatus,
      },
    );
  }

  metadata = {
    name: result.assetName,
    description: result.assetName,
    image: result.imageName
      ? process.env.PINATA_GET_URL.concat(result.imageName)
      : process.env.PINATA_GET_URL.concat(DEFAULT_IMAGE_FILE_NAME),
    animation_url: result.animationName
      ? process.env.PINATA_GET_URL.concat(result.animationName)
      : process.env.PINATA_GET_URL.concat(DEFAULT_ANIMATION_FILE_NAME),
    attributes: attributesJson,
  };

  //save metadata to IPFS using pinata service
  const ipfsHash = await pinataFunction.uploadJsonFileToIPFS(JSON.stringify(metadata));

  return {
    ipfsHash,
    metadata,
  };
};
/**
 * getAssetsByContractId is a function which will return asset by contract id.
 * @param  contractId
 * @returns assets returned
 */
const getAssetsByContractId = async (contractId: number, page: number, size: number) => {
  Logger.info('AssetService:getAssetsByContractId(): - start');

  //get count of data returned from the query
  const total = await assetRepo.getAllAssetsCountByContractId(contractId);

  //get total number of pages
  const totalPages = Math.ceil(total / size);

  const result = await assetRepo.getAssetsByContractId(contractId, page, size);

  Logger.info('AssetService:getAssetsByContractId(): - end');
  return { result, total, page, totalPages };
};

/**
 * getAssetStatusGroupByCount is a function which will return asset by contract id.
 * @returns assets returned
 */
const getAssetStatusGroupByCount = async (contractId: number) => {
  Logger.info('AssetService:getAssetStatusGroupByCount(): - start');

  const result = await assetRepo.getAssetStatusGroupByCount(contractId);

  Logger.info('AssetService:getAssetStatusGroupByCount(): - end');
  return result;
};

/**
 * getAssetsByOwnerId is a function which will return asset by owner id.
 * @param  ownerId
 * @returns assets returned
 */
const getAssetsByOwnerId = async (ownerId: string, page: number, size: number) => {
  Logger.info('AssetService:getAssetsByOwnerId(): - start');

  //get count of data returned from the query
  const total = await assetRepo.getAllAssetsCountByOwnerId(ownerId);

  //get total number of pages
  const totalPages = Math.ceil(total / size);

  const result = await assetRepo.getAssetsByOwnerId(ownerId, page, size);

  Logger.info('AssetService:getAssetsByOwnerId(): - end');
  return { result, total, page, totalPages };
};

/**
 * getAssetsByAssetType is a function which will return asset by asset type.
 * @param  type
 * @returns assets returned
 */
const getAssetsByAssetType = async (type: string) => {
  Logger.info('AssetService:getAssetsByAssetType(): - start');

  const result = await assetRepo.getAssetsByAssetType(type);

  Logger.info('AssetService:getAssetsByAssetType(): - end');
  return result;
};

/**
 * getAssetsBySeasonName is a function which will return asset by season name.
 * @param  seasonName
 * @returns asset returned
 */
const getAssetsBySeasonName = async (seasonName: string) => {
  Logger.info('AssetService:getAssetsBySeasonName(): - start');

  const result = await assetRepo.getAssetsBySeasonName(seasonName);

  Logger.info('AssetService:getAssetsBySeasonName(): - end');
  return result;
};

/**
 * getAssetsByTypeAndLatLonRadius is a function which will return asset by given parameters.
 * @param assetType
 * @param lat
 * @param lon
 * @param radius
 * @param isPaginationRequired
 * @param page
 * @param size
 * @returns assets returned
 */
const getAssetsByTypeAndLatLonRadius = async (
  assetType: string,
  lat: number,
  lon: number,
  radius: number,
  page: number,
  size: number,
) => {
  Logger.info('AssetService:getAssetsByTypeAndLatLonRadius(): - start');

  if (radius >= 0 && radius < EARTH_RADIUS_IN_METERS) {
    //get count of data returned from the query based on asset type,lat,lon and radius
    const total = await assetRepo.getCountByAssetsByTypeAndLatLonRadius(assetType, lat, lon, radius);

    //get total number of pages
    const totalPages = Math.ceil(total / size);

    // now do a query with page and size
    const result = await assetRepo.getAssetsByTypeAndLatLonRadius(assetType, lat, lon, radius, true, page, size);

    Logger.info('AssetService:getAssetsByTypeAndLatLonRadius(): - end');
    return { result, total, page, totalPages };
  } else {
    Logger.error(`AssetService:getAssetsByTypeAndLatLonRadius(): ${locale.ASSET_RADIUS_NOT_VALID}`);
    Logger.info('AssetService:getAssetsByTypeAndLatLonRadius(): - end');
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_RADIUS_NOT_VALID, httpStatusCodes.BAD_REQUEST);
  }
};

/**
 * getAssetAttributesWithCountByContractId is a function which will return asset by contract id.
 * @param  contractId
 * @returns assets returned
 */
const getAssetAttributesWithCountByContractId = async (contractId: number) => {
  Logger.info('AssetService:getAssetAttributesWithCountByContractId(): - start');

  const result = await assetRepo.getAssetAttributesWithCountByContractId(contractId);

  Logger.info('AssetService:getAssetAttributesWithCountByContractId(): - end');
  return result;
};

/**
 * createAsset is a function which will create asset.
 * @param  asset
 * @returns asset added
 */
const createAsset = async (asset: any, files: any) => {
  Logger.info('AssetService:createAsset(): - start');

  //check if lat lon already exists wit
  //call to the check by userName method
  //const assetExists = await assetRepo.getAssetByLatLon(asset.lat, asset.lon);

  //if (!assetExists) {
  // Get the asset passed it and created the asset obj for creation
  let newAsset = new Asset();

  newAsset.assetName = asset.assetName;
  newAsset.contractId = asset.contractId;
  newAsset.ownerId = asset.ownerId;
  newAsset.attributes = asset.attributes ? JSON.parse(asset.attributes) : [];
  // newAsset.lat = -1;
  //newAsset.lon = -1;
  newAsset.seasonName = asset.seasonName;
  newAsset.assetType = asset.assetType;
  newAsset.assetStatus = AssetStatus.AVAILABLE;
  newAsset.imageName = asset.imageName;
  newAsset.description = asset.description;
  newAsset.animationName = asset.animationName;
  newAsset.price = asset.price;
  newAsset.isActive = true;
  newAsset = await uploadAssetsAttachments(newAsset, files);
  Logger.info('AssetService:createAsset(): - end');

  const assetCreated = await assetRepo.createAsset(newAsset);

  if (assetCreated.stack) {
    await helper.removeAllTempAttachmentFile(files);
    Logger.error(`AssetService:createAsset(): ${assetCreated.stack}`);
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      assetCreated.stack,
      httpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  } else return assetCreated;
  /*} else {
    const assetLatLon = `${asset.lat},${asset.lon}`;
    Logger.error(
      `AssetService:createAsset(): ${locale.ASSET_EXIST_WITH_LAT_LON({
        data: assetLatLon,
      })}`,
    );
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.ASSET_EXIST_WITH_LAT_LON({ data: assetLatLon }),
      httpStatusCodes.BAD_REQUEST,
    );
  }*/
};

/**
 * getLatLonFromPolygon is a function which will when a land has polygon assetLocation.
 * @param  feature
 * @returns ceteriod of lat lon of the polygon
 */
const getLatLonFromPolygon = (feature: any) => {
  let centerLat = 0.0,
    centerLon = 0.0;
  const coordinates: string[] = [];

  //check of the geomatry type is MultiPolygon
  if (feature.geometry.type) {
    let geoCooridnates;
    if (feature.geometry.type === 'Polygon') geoCooridnates = feature.geometry.coordinates[0];
    else geoCooridnates = feature.geometry.coordinates[0][0];

    if (geoCooridnates) {
      // loop through to get the coordinates
      for (let counter in geoCooridnates) {
        //push up the coordinates
        coordinates.push(geoCooridnates[counter]);
      }
    }
  }

  if (coordinates.length > 0) {
    const result = calculateCentriod(coordinates);
    centerLat = result.centerLat;
    centerLon = result.centerLon;
  }

  //return centeriod of lat and lon
  return { centerLat, centerLon };
};

/**
 * calculateCentriod is a function which will calculate the centriod of lat lon based on the average .
 * @param  coordinates
 * @returns ceteriod of lat lon based on the array
 */
const calculateCentriod = (coordinates: string[]) => {
  Logger.info('AssetService:calculateCentriod(): - start');

  // default to 0
  let centerLat = 0.0;
  let centerLon = 0.0;
  let totalLat = 0.0;
  let totalLon = 0.0;

  // loop through to get the coordinates
  for (let counter in coordinates) {
    //get lat at 0 and lon at 1
    totalLat = totalLat + parseFloat(coordinates[counter][0]);
    totalLon = totalLon + parseFloat(coordinates[counter][1]);
  }

  //get the average to get the centriod
  centerLat = totalLat / coordinates.length;
  centerLon = totalLon / coordinates.length;

  Logger.info('AssetService:calculateCentriod(): - end');

  return { centerLat, centerLon };
};

/**
 * updateAsset is a function which will update the asset  based on asset id .
 * @param  id
 * @param  asset
 * @returns updated asset
 */
const updateAsset = async (assetIds: number[], asset: any, files: any = {}) => {
  // Get the asset passed it and created the asset obj for creation
  Logger.info('AssetService:updateAsset(): - start');

  try {
    // if image is present then update image name against asset ids
    if (files.image) {
      //upload files ito s3 bucket
      const imageCID = await pinataFunction.uploadFileToIPFS(files.image[0]);
      asset.imageName = imageCID;
      // delete the file from local storage
      await unlinkFile(files.image[0].path);
    }

    // if animation is present then update animation name against asset ids
    if (files.animation) {
      //upload files to pinata
      const animationCID = await pinataFunction.uploadFileToIPFS(files.animation[0]);
      asset.animationName = animationCID;
      //delete the file from local storage
      await unlinkFile(files.animation[0].path);
    }

    if (files.sticker) {
      //upload files ito s3 bucket
      const stickerCID = await pinataFunction.uploadFileToIPFS(files.sticker[0]);
      asset.stickerName = stickerCID;
      //delete the file from local storage
      await unlinkFile(files.sticker[0].path);
    }

    if (asset.attributes) asset.attributes = JSON.parse(asset.attributes);
    const result = await assetRepo.updateAssetBulk(assetIds, asset);

    // stack will be there in case of any error thrown from database
    if (result.stack) {
      Logger.error(`AssetService:updateAsset(): ${result.stack} `);
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        locale.ASSET_NOT_FOUND({ id: assetIds }),
        httpStatusCodes.BAD_REQUEST,
      );
    }
    Logger.info('AssetService:updateAsset(): - end');
    return result;
  } catch (e) {
    //delete the file from local storage
    if (files.image) await unlinkFile(files.image[0].path);
    if (files.animation) await unlinkFile(files.animation[0].path);
    if (files.sticker) await unlinkFile(files.sticker[0].path);

    Logger.info('AssetService:updateAsset(): - end');
    // throw the error to api
    throw new ApiError(httpStatusCodes.BAD_REQUEST, e, httpStatusCodes.BAD_REQUEST);
  }
};

const uploadAssetsAttachments = async (asset: any, files: any = {}) => {
  try {
    // if image is present then update image name against asset ids
    if (files.image) {
      //upload files ito s3 bucket
      const imageCID = await pinataFunction.uploadFileToIPFS(files.image[0]);
      asset.imageName = imageCID;
      // delete the file from local storage
      await unlinkFile(files.image[0].path);
    }

    // if animation is present then update animation name against asset ids
    if (files.animation) {
      //upload files to pinata
      const animationCID = await pinataFunction.uploadFileToIPFS(files.animation[0]);
      asset.animationName = animationCID;
      //delete the file from local storage
      await unlinkFile(files.animation[0].path);
    }

    if (files.sticker) {
      //upload files ito s3 bucket
      const stickerCID = await pinataFunction.uploadFileToIPFS(files.sticker[0]);
      asset.stickerName = stickerCID;
      //delete the file from local storage
      await unlinkFile(files.sticker[0].path);
    }
    // const result = await assetRepo.updateAssetBulk([asset.id], asset);

    // stack will be there in case of any error thrown from database
    /* if (result.stack) {
      Logger.error(`AssetService:updateAsset(): ${result.stack} `);
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        locale.ASSET_NOT_FOUND({ id: asset.id }),
        httpStatusCodes.BAD_REQUEST,
      );
    }*/
    Logger.info('AssetService:updateAsset(): - end');
    return asset;
  } catch (e) {
    //delete the file from local storage
    if (files.image) await unlinkFile(files.image[0].path);
    if (files.animation) await unlinkFile(files.animation[0].path);
    if (files.sticker) await unlinkFile(files.sticker[0].path);

    Logger.info('AssetService:updateAsset(): - end');
    // throw the error to api
    throw new ApiError(httpStatusCodes.BAD_REQUEST, e, httpStatusCodes.BAD_REQUEST);
  }
};

/**
 * updateAssetOwner is a function which will update the asset owner based on asset id .
 * @param  id
 * @param  asset
 * @returns updated asset
 */
const updateAssetOwner = async (id: number, ownerId: number) => {
  const result = await assetRepo.updateAssetOwner(id, ownerId);

  // stack will be there in case of any error thrown from database
  if (result.stack) {
    Logger.error(`AssetService:updateAsset(): ${result.stack} `);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_NOT_FOUND({ id }), httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('AssetService:updateAsset(): - end');
  return result;
};

/**
 * updateAssetStatus is a function which will update the asset status based on asset id .
 * @param  id
 * @param  assetStatus
 * @returns updated asset status
 */
const updateAssetStatus = async (id: number, assetStatus: string) => {
  Logger.info('AssetService:updateAssetStatus(): - start');

  const result = await assetRepo.updateAssetStatus(id, assetStatus);

  // stack will be there in case of any error thrown from database
  if (result.stack) {
    Logger.error(`AssetService:updateAssetStatus(): ${result.stack} `);
    throw new ApiError(httpStatusCodes.BAD_REQUEST, locale.ASSET_NOT_FOUND({ id }), httpStatusCodes.BAD_REQUEST);
  }

  Logger.info('AssetService:updateAssetStatus(): - end');
  return result;
};

/**
 * uploadFiles is a function which will upload the image and animation files .
 * @param  id
 * @param  asset
 * @returns updated asset
 */
const uploadFiles = async (assetIds: string, files: any) => {
  Logger.info('AssetService:uploadFiles(): - start');

  const arrAssetIds: number[] = JSON.parse(assetIds);
  await updateAsset(arrAssetIds, {}, files);
  Logger.info('AssetService:uploadFiles(): - end');
  // Get the latest asset data
  return assetRepo.getAssetByIds(arrAssetIds);
};

/**
 * importBulkLandAsset is a function which will update/create the asset-Land  based on asset id .
 * @param  data
 * @returns updated asset
 */
const importBulkLandAsset = async (data: any, assetType: any = AssetType.LAND) => {
  Logger.info('AssetService:createLandAsset(): - start');

  let assetsList = [];
  data.features.map((val) => {
    let assetBody: any = {};

    if (assetType == AssetType.LAND) {
      const centeriod = getLatLonFromPolygon(val);
      const centerLat = centeriod.centerLat;
      const centerLon = centeriod.centerLon;
      assetBody.assetLocation = JSON.stringify(val.geometry.coordinates);
      assetBody.lat = centerLat;
      assetBody.lon = centerLon;
    }

    assetBody.id = val.properties.plotId;
    assetBody.assetName = data.assetName;
    assetBody.contractId = data.contractId;
    assetBody.ownerId = data.ownerId;

    assetBody.seasonName = data.seasonName;
    assetBody.assetType = data.assetType;
    assetBody.assetStatus = data.assetStatus;
    assetBody.imageName = data.imageName;
    assetBody.animationName = data.animationName;
    assetBody.price = data.price;
    assetBody.isActive = true;
    let attributes = [];
    let geoKeys = Object.keys(val.geometry);
    geoKeys.forEach((element) => {
      if (element != 'type' && element != 'coordinates') {
        attributes.push({ trait_type: element, value: val.properties.geometry[element] });
      }
    });
    assetBody.attributes = attributes;
    assetsList.push(assetBody);
  });
  const result = await assetRepo.createUpdateAssetBulk(assetsList);

  //make a async call to build the collection panel
  //contractService.buildCollectionPanel(data.contractId);
  return result;
};

/**
 * importBulkAsset is a function which will update/create the asset-Land  based on asset id .
 * @param  data
 * @returns updated asset
 */
const importBulkAsset = async (data: any, files: any) => {
  Logger.info('AssetService:importBulkAsset(): - start');

  let assetsList = [];
  let errReport = [];
  let disAllowParams = [
    'name',
    'plotId',
    'id',
    'ownerId',
    'seasonName',
    'assetStatus',
    'animationName',
    'imageName',
    'price',
    'assetType',
    'assetName',
    'status',
    'stickerName',
    'isActive',
    'description',
  ];
  let assetType: any = data.assetType ? data.assetType : AssetType.LAND;
  const featuers = JSON.parse(data.features);
  featuers.map((val) => {
    let assetBody: any = {};

    assetBody.id = val.properties.id;

    if (assetType === AssetType.LAND) {
      if (!val.geometry.coordinates) {
        errReport.push({
          data: val,
          errorMessage: locale.REQUIRED_ERROR('coordinates'),
        });
        return;
      } else {
        try {
          const centeriod = getLatLonFromPolygon(val);
          const centerLat = centeriod.centerLat;
          const centerLon = centeriod.centerLon;
          assetBody.assetLocation = JSON.stringify(val.geometry.coordinates);
          assetBody.lat = centerLat;
          assetBody.lon = centerLon;
          // assetBody.id = val.properties.plotId;
        } catch (ex) {
          errReport.push({
            data: val,
            errorMessage: locale.LOCATION_CALCULATE_ERROR,
          });
        }
      }
    }

    if (!val.geometry.coordinates) {
      errReport.push({
        data: val,
        errorMessage: locale.REQUIRED_ERROR('coordinates'),
      });
      return;
    }
    if (!val.properties) {
      errReport.push({
        data: val,
        errorMessage: locale.REQUIRED_ERROR('properties'),
      });
      return;
    }
    if (!val.properties.assetName) {
      errReport.push({
        data: val,
        errorMessage: locale.REQUIRED_ERROR('assetName'),
      });
      return;
    }

    if (!val.properties.seasonName) {
      errReport.push({
        data: val,
        errorMessage: locale.REQUIRED_ERROR('seasonName'),
      });
      return;
    }
    if (!val.properties.assetStatus) {
      errReport.push({
        data: val,
        errorMessage: locale.REQUIRED_ERROR('assetStatus'),
      });
      return;
    }

    assetBody.assetName = val.properties.name;
    assetBody.contractId = data.contractId;
    assetBody.ownerId = val.properties.ownerId;

    assetBody.seasonName = val.properties.seasonName;
    assetBody.assetType = assetType;
    assetBody.assetStatus = val.properties.assetStatus;
    assetBody.imageName = val.properties.imageName;
    assetBody.animationName = val.properties.animationName;
    assetBody.stickerName = val.properties.stickerName;
    assetBody.description = val.properties.description;
    assetBody.price = val.properties.price;
    assetBody.isActive = true;
    let attributes: any = [];
    let keys = Object.keys(val.properties);
    keys.forEach((element) => {
      if (!disAllowParams.includes(element)) {
        attributes.push({ trait_type: element, value: val.properties[element] });
      }
    });
    assetBody.attributes = attributes;
    assetsList.push(assetBody);
    return;
  });

  if (files && files.attachmentZip) {
    try {
      let zip = new zipStream.async({ file: files.attachmentZip[0].path });
      fs.mkdirSync('./uploads/extracted/' + files.attachmentZip[0].filename);
      const count = await zip.extract(null, './uploads/extracted/' + files.attachmentZip[0].filename);
      await zip.close();
      for (let i = 0; i < assetsList.length; i++) {
        try {
          let resp = await pinataFunction.uploadFileToIPFS({
            path: './uploads/extracted/' + files.attachmentZip[0].filename + '/' + assetsList[i]['imageName'],
          });
          assetsList[i]['imageName'] = resp;
        } catch (ex) {
          errReport.push({ data: assetsList[i], errorMessage: locale.FAILED_UPLOAD_ERROR('image') });
          assetsList[i]['imageName'] = undefined;
        }
        try {
          let resp = await pinataFunction.uploadFileToIPFS({
            path: './uploads/extracted/' + files.attachmentZip[0].filename + '/' + assetsList[i]['stickerName'],
          });
          assetsList[i]['stickerName'] = resp;
        } catch (ex) {
          errReport.push({ data: assetsList[i], errorMessage: locale.FAILED_UPLOAD_ERROR('sticker') });
          assetsList[i]['stickerName'] = undefined;
        }
        try {
          let resp = await pinataFunction.uploadFileToIPFS({
            path: './uploads/extracted/' + files.attachmentZip[0].filename + '/' + assetsList[i]['animationName'],
          });
          assetsList[i]['animationName'] = resp;
        } catch (ex) {
          errReport.push({ data: assetsList[i], errorMessage: locale.FAILED_UPLOAD_ERROR('animation') });
          assetsList[i]['animationName'] = undefined;
        }
      }
    } catch (ex) {
      errReport.push({ errorMessage: 'Failed processing attachments' });
    }
    fs.rm('./uploads/extracted/' + files.attachmentZip[0].filename, { recursive: true }, () =>
      Logger.info('AssetService:importBulkAsset(): - file extracted deleted'),
    );
    unlinkFile(files.attachmentZip[0].path);
  }

  const result = await assetRepo.createUpdateAssetBulk(assetsList);

  //make a async call to build the collection panel
  // contractService.buildCollectionPanel(data.contractId);
  return { result, errors: errReport };
};

/**
 * importBulkLandAsset is a function which will update/create the asset-Land  based on asset id .
 * @param  data
 * @returns updated asset
 */
const importBulk3DAsset = async (data: any) => {
  Logger.info('AssetService:importBulk3DAsset(): - start');

  let assetsList = [];
  data.features.map((val) => {
    let assetBody: any = {};
    assetBody.id = val.properties.id;
    assetBody.assetName = data.assetName;
    assetBody.contractId = data.contractId;
    assetBody.ownerId = data.ownerId;

    assetBody.seasonName = data.seasonName;
    assetBody.assetType = data.assetType;
    assetBody.assetStatus = data.assetStatus;
    assetBody.imageName = data.imageName;
    assetBody.animationName = data.animationName;
    assetBody.description = data.description;
    let attributes = [];
    let geoKeys = Object.keys(val.geometry);
    geoKeys.forEach((element) => {
      if (element != 'type' && element != 'coordinates') {
        attributes.push({ trait_type: element, value: val.properties.geometry[element] });
      }
    });
    assetBody.attributes = attributes;
    assetBody.price = data.price;
    assetBody.isActive = true;
    assetsList.push(assetBody);
  });
  const result = await assetRepo.createUpdateAssetBulk(assetsList);
  //make a async call to build the collection panel
  //contractService.buildCollectionPanel(data.contractId);
  return result;
};

/**
 * getAssetsByFilter is a function which will return assets against a collection based on the filter attributes .
 * @param  criteria
 * @returns asstes based on the criteria
 */
const getAssetsByFilter = async (criteria: any = {}) => {
  Logger.info('AssetService:getAssetsByFilter(): - start');

  const contractId = criteria.contractId;
  const sort = criteria.sort ? criteria.sort : 'asc';
  const sortBy = criteria.sortBy ? criteria.sortBy : 'id';
  // get the search query if any
  const search = criteria.search?.query ? criteria.search?.query : '';
  const filter = criteria.search?.filter ? criteria.search?.filter : '';

  const result = await assetRepo.getAssetsByFilter(contractId, sort, sortBy, search, filter);

  Logger.info('AssetService:getAssetsByFilter(): - end');
  return result;
};

export default {
  createAsset,
  updateAsset,
  updateAssetOwner,
  updateAssetStatus,
  getAllAssets,
  getAssetById,
  getAssetByIds,
  getAssetByIdsOrderByContractId,
  getAssetsByContractId,
  getAssetsByTypeAndLatLonRadius,
  getAssetsByOwnerId,
  getAssetsByAssetType,
  getAssetsBySeasonName,
  getAssetMetadataById,
  uploadFiles,
  exportAssetsData,
  importBulkLandAsset,
  getAllAssetTypes,
  getAssetAttributesWithCountByContractId,
  getAssetStatusGroupByCount,
  getAssetsByFilter,
  importBulk3DAsset,
  importBulkAsset,
};
