import { validationResult, check } from 'express-validator';
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

const contractListValidator = () => {
  return [check('searchStr').optional().escape().trim()];
};

const contractValidator = () => {
  return [
    check('seasonName').notEmpty().withMessage(locale.REQUIRED_ERROR('Season name')),
    check('assetType').notEmpty().withMessage(locale.REQUIRED_ERROR('Asset type')),
    check('contractAddress').notEmpty().withMessage(locale.REQUIRED_ERROR('Contract address')),
    //check('sellerFee').notEmpty().isDecimal().withMessage(locale.DECIMAL_TYPE_ERROR("Seller Fee")),
  ];
};

const contractUpdateValidator = () => {
  return [
    // check('sellerFee').optional().isDecimal().withMessage(locale.DECIMAL_TYPE_ERROR("Seller Fee")),
  ];
};

const whiteListUsersValidator = () => {
  return [check('contractId').notEmpty().withMessage(locale.REQUIRED_ERROR('contractId'))];
};

const statusValidator = () => {
  return [check('status').notEmpty().withMessage(locale.REQUIRED_ERROR('status'))];
};

const baseURIValidator = () => {
  return [check('baseURI').notEmpty().withMessage(locale.REQUIRED_ERROR('baseURI'))];
};

const addressLimitValidator = () => {
  return [
    check('mintLimit').notEmpty().withMessage(locale.REQUIRED_ERROR('mint limit')),
    check('mintLimit').isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('mint limit')),
  ];
};

const mintLandValidator = () => {
  return [
    check('id').notEmpty().withMessage(locale.REQUIRED_ERROR('id')),
    check('id').isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('id')),
    check('type').notEmpty().withMessage(locale.REQUIRED_ERROR('type')),
    check('toAddress').notEmpty().withMessage(locale.REQUIRED_ERROR('toAddress')),
    check('key').notEmpty().withMessage(locale.REQUIRED_ERROR('key')),
  ];
};

const mintObjectValidator = () => {
  return [
    check('id').notEmpty().withMessage(locale.REQUIRED_ERROR('id')),
    check('id').isNumeric().withMessage(locale.NUMERIC_TYPE_ERROR('id')),
    check('toAddress').notEmpty().withMessage(locale.REQUIRED_ERROR('toAddress')),
    check('key').notEmpty().withMessage(locale.REQUIRED_ERROR('key')),
  ];
};
const addWhiteListAdminValidator = () => {
  return [
    check('userAddresses').notEmpty().withMessage(locale.REQUIRED_ERROR('user addresses')),
    check('permission').notEmpty().withMessage(locale.REQUIRED_ERROR('permission')),
  ];
};
const removeWhiteListAdminValidator = () => {
  return [check('userAddress').notEmpty().withMessage(locale.REQUIRED_ERROR('user address'))];
};
export {
  resultsValidator,
  contractValidator,
  contractUpdateValidator,
  contractListValidator,
  whiteListUsersValidator,
  statusValidator,
  baseURIValidator,
  addressLimitValidator,
  mintLandValidator,
  mintObjectValidator,
  addWhiteListAdminValidator,
  removeWhiteListAdminValidator,
};
