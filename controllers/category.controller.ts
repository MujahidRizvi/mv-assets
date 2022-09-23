import categoryService from '../services/category.service';
import helper from '../utils/helper';
import httpStatusCodes from 'http-status-codes';
import ApiResponse from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { resultsValidator } from '../validators/asset.validator';
import Logger from '../config/logger';
import { AssetType } from 'utils/enums';
import { ENUM } from 'sequelize/types';
import locale from '../utils/locale';

const getCategories = async (req, res) => {
  Logger.info('CategoryController:getCategories(): - start');

  const result = await categoryService.getAllCategories(req.query.page, req.query.size);
  Logger.info('CategoryController:getCategories(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const getActiveCategories = async (req, res) => {
  Logger.info('CategoryController:getActiveCategories(): - start');

  const result = await categoryService.getActiveCategories();
  Logger.info('CategoryController:getActiveCategories(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const createCategory = async (req, res) => {
  Logger.info('CategoriesController:createCategory(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    await helper.removeAllTempAttachmentFile(req.files);
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      JSON.stringify(hasErrors),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await categoryService.createCategory(req.body, req.files);

  Logger.info('CategoriesController:createCategory(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const validateCategory = async (req, res) => {
  Logger.info('CategoriesController:validateCategory(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      JSON.stringify(hasErrors),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  Logger.info('CategoriesController:validateCategory(): - end');
  ApiResponse.result(res, { message: locale.CATEGORY_VALIDATED_SUCCESSFULLY }, httpStatusCodes.OK);
};

const updateCategory = async (req, res) => {
  Logger.info('CategoriesController:createCategory(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    await helper.removeAllTempAttachmentFile(req.files);
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      JSON.stringify(hasErrors),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await categoryService.updateCategory(req.params.id, req.body, req.files);

  Logger.info('CategoriesController:createCategory(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

const updateCategoryActiveStatus = async (req, res) => {
  Logger.info('CategoriesController:updateCategoryActiveStatus(): - start');

  const hasErrors = resultsValidator(req);
  if (hasErrors.length > 0) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      JSON.stringify(hasErrors),
      httpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  //Call the method from the service layer
  const result = await categoryService.updateActiveStatus(req.params.id, req.body.status);

  Logger.info('CategoriesController:updateCategoryActiveStatus(): - end');
  ApiResponse.result(res, result, httpStatusCodes.OK);
};

export default {
  getCategories,
  createCategory,
  updateCategory,
  getActiveCategories,
  validateCategory,
  updateCategoryActiveStatus
};
