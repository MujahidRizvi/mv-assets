import httpStatusCodes from 'http-status-codes';
import categoryRepo from '../repos/category.repo';
import { ApiError } from '../utils/ApiError';
import locale from '../utils/locale';
import Logger from '../config/logger';
import Category from '../models/category.model';
import pinataFunction from '../utils/pinata';
import util from 'util';
import fs from 'fs';
import helper from '../utils/helper';

const unlinkFile = util.promisify(fs.unlink);

const getAllCategories = async (page: number, size: number) => {
  Logger.info('CategoryService:getAllCategories(): - start');
  const total = await categoryRepo.getAllCategoryCount();
  if (!page) {
    page = 1;
  }
  if (!size) {
    size = Number.MAX_SAFE_INTEGER;
  }
  //get total number of pages
  const totalPages = Math.ceil(total / size);
  const result = await categoryRepo.getAllCategories(page, size);
  Logger.info('CategoryService:getAllCategories(): - end');

  return {
    results: result,
    totalPages: totalPages,
    total: total,
    page: page,
    size: size,
  };
};

const getActiveCategories = async () => {
  Logger.info('CategoryService:getActiveCategories(): - start');

  const result = await categoryRepo.getActiveCategories();
  Logger.info('CategoryService:getActiveCategories(): - end');

  return result;
};

/**
 * createCategory is a function which will create asset.
 * @param  asset
 * @returns asset added
 */
const createCategory = async (category: any, files: any = {}) => {
  Logger.info('CategoryService:createCategory(): - start');

  let categoryExist = await categoryRepo.getCategoryByName(category.name);

  if (!categoryExist) {
    let newCategory = new Category();
    newCategory.name = category.name;
    newCategory.description = category.description;
    newCategory.isActive = true;
    newCategory.createdBy = 'system';
    newCategory.updatedBy = 'system';

    try {
      // if image is present then update imnage name against asset ids
      if (files.logo) {
        //upload files to ipfs using pinata service
        const logoCID = await pinataFunction.uploadFileToIPFS(files.logo[0]);

        newCategory.logoImage = logoCID;
        // delete the file from local storage
        await unlinkFile(files.logo[0].path);
      }

      let categoryCreated = await categoryRepo.createCategory(newCategory);
      if (newCategory.logoImage) {
        categoryCreated.logoImage = process.env.PINATA_GET_URL.concat(newCategory.logoImage);
      }
      return categoryCreated;
    } catch (e) {
      //delete the file from local storage
      if (files.logo) await unlinkFile(files.logo[0].path);
      Logger.info('CategoryService:createCategory(): - end');
      // throw the error to api
      throw new ApiError(httpStatusCodes.BAD_REQUEST, e, httpStatusCodes.BAD_REQUEST);
    }
  } else {
    await helper.removeAllTempAttachmentFile(files);
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      locale.CATEGORY_EXIST_WITH_NAME({ name: category.name }),
      httpStatusCodes.BAD_REQUEST,
    );
  }
};

/**
 * createCategory is a function which will create asset.
 * @param  asset
 * @returns asset added
 */
const updateCategory = async (categoryId: any, category: any, files: any = {}) => {
  Logger.info('CategoryService:updateCategory(): - start');

  let categoryExist = await categoryRepo.getCategoryById(categoryId);
  if (categoryExist) {
    try {
      // if image is present then update imnage name against asset ids
      if (files.logo) {
        //upload files to pinata bucket
        const logoCID = await pinataFunction.uploadFileToIPFS(files.logo[0]);
        category.logoImage = logoCID;
        // delete the file from local storage
        await unlinkFile(files.logo[0].path);
      }

      const categoryUpdated = await categoryRepo.updateCategory(categoryId, category);
      if (category.logoImage && categoryUpdated && categoryUpdated.length > 1) {
        categoryUpdated[1].logoImage = process.env.PINATA_GET_URL.concat(category.logoImage);
      }
      Logger.info('CategoryService:updateCategory(): - end');
      return categoryUpdated && categoryUpdated.length > 1 ? categoryUpdated[1] : null;
    } catch (e) {
      //delete the file from local storage
      if (files.logo) await unlinkFile(files.logo[0].path);
      Logger.info('CategoryService:createCategory(): - end');
      // throw the error to api
      throw new ApiError(httpStatusCodes.BAD_REQUEST, e, httpStatusCodes.BAD_REQUEST);
    }
  } else {
    await helper.removeAllTempAttachmentFile(files);
    throw new ApiError(httpStatusCodes.NOT_FOUND, locale.CATEGORY_DOES_NOT_EXIST, httpStatusCodes.NOT_FOUND);
  }
};

/**
 * createCategory is a function which will create asset.
 * @param  asset
 * @returns asset added
 */
 const updateActiveStatus = async (categoryId: any, status: any) => {
  Logger.info('CategoryService:updateCategory(): - start');

  let categoryExist = await categoryRepo.getCategoryById(categoryId);
  if (categoryExist) {
      const categoryUpdated = await categoryRepo.updateCategory(categoryId, {isActive:status}); 
      return categoryUpdated[1] 
  } else {
    throw new ApiError(httpStatusCodes.NOT_FOUND, locale.CATEGORY_DOES_NOT_EXIST, httpStatusCodes.NOT_FOUND);
  }
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  updateActiveStatus,
  getActiveCategories
};
