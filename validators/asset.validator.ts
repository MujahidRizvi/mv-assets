const { validationResult, check, query, body, oneOf } = require('express-validator');
import locale from '../utils/locale';
const resultsValidator = (req) => {
  const messages: string[] = [];
  if (!validationResult(req).isEmpty()) {
    const errors = validationResult(req).array();
    for (const i of errors) {
      const objError = { error: i.msg };

      messages.push(JSON.stringify(objError));
    }
  }
  return messages;
};

const assetValidator = () => {
  return [
    check('assetName').notEmpty().withMessage(locale.REQUIRED_ERROR('assetName')),
    check('seasonName').notEmpty().withMessage(locale.REQUIRED_ERROR('seasonName')),
    check('assetType').notEmpty().withMessage(locale.REQUIRED_ERROR('assetType')),
    check('assetStatus').notEmpty().withMessage(locale.REQUIRED_ERROR('assetStatus')),
  ];
};

const assetUpdateValidator = () => {
  return [
    check('assetName').optional({ nullable: false }).notEmpty().withMessage(locale.REQUIRED_ERROR('assetName')),

    check('seasonName').optional({ nullable: false }).notEmpty().withMessage(locale.REQUIRED_ERROR('seasonName')),

    check('assetType').optional({ nullable: false }).notEmpty().withMessage(locale.REQUIRED_ERROR('assetType')),

    check('assetStatus').optional({ nullable: false }).notEmpty().withMessage(locale.REQUIRED_ERROR('assetStatus')),

    check('description').isLength({ max: 512 }).withMessage(locale.REQUIRED_ERROR('description')),
  ];
};
const assetLandExportValidator = () => {
  return [
    query('minId').optional({ nullable: false }).notEmpty().isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('minId')),

    query('maxId').optional({ nullable: false }).notEmpty().isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('maxId')),

    query('page').optional({ nullable: false }).notEmpty().isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('page')),

    query('pageSize')
      .optional({ nullable: false })
      .notEmpty()
      .isNumeric()
      .withMessage(locale.NUMERIC_TYPE_ERROR('pageSize')),
  ];
};

const assetLandValidator = () => {
  return [
    check('assetName').notEmpty().withMessage(locale.REQUIRED_ERROR('assetName')),
    check('seasonName').notEmpty().withMessage(locale.REQUIRED_ERROR('seasonName')),
    check('assetType').notEmpty().withMessage(locale.REQUIRED_ERROR('asetType')),
    check('assetStatus').notEmpty().withMessage(locale.REQUIRED_ERROR('assetStatus')),
    check('features').notEmpty().withMessage(locale.REQUIRED_ERROR('features')),
  ];
};

const assetObjectValidator = () => {
  return [
    check('assetName').notEmpty().withMessage(locale.REQUIRED_ERROR('assetName')),
    check('seasonName').notEmpty().withMessage(locale.REQUIRED_ERROR('seasonName')),
    check('assetType').notEmpty().withMessage(locale.REQUIRED_ERROR('asetType')),
    check('assetStatus').notEmpty().withMessage(locale.REQUIRED_ERROR('assetStatus')),
    check('features').notEmpty().withMessage(locale.REQUIRED_ERROR('features')),
  ];
};

const assetStatusValidator = () => {
  return [
    check('assetStatus').notEmpty().withMessage(locale.REQUIRED_ERROR('assetStatus')),
    check('id').isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('id')),
  ];
};

const assetOwnerValidator = () => {
  return [
    check('ownerId').notEmpty().withMessage(locale.REQUIRED_ERROR('ownerId')),
    check('ownerId').isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('ownerId')),
    check('id').isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('id')),
  ];
};

const assetByTypeLatLonRadiusValidator = () => {
  return [
    query('assetType').notEmpty().withMessage(locale.REQUIRED_ERROR('assetType')),
    query('lat').notEmpty().withMessage(locale.REQUIRED_ERROR('lat')),
    query('lon').notEmpty().withMessage(locale.REQUIRED_ERROR('lon')),
    query('radius').notEmpty().withMessage(locale.REQUIRED_ERROR('radius')),
  ];
};

const assetByFilterValidator = () => {
  return [check('contractId').notEmpty().withMessage(locale.REQUIRED_ERROR('contractId'))];
};
export {
  resultsValidator,
  assetValidator,
  assetStatusValidator,
  assetOwnerValidator,
  assetLandValidator,
  assetByTypeLatLonRadiusValidator,
  assetUpdateValidator,
  assetLandExportValidator,
  assetByFilterValidator,
  assetObjectValidator
};
