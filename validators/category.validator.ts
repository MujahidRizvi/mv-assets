import { validationResult, check } from 'express-validator';
import locale from '../utils/locale';
const resultsValidator = (req) => {
  const messages: any[] = [];
  if (!validationResult(req).isEmpty()) {
    const errors = validationResult(req).array();
    for (const i of errors) {
      const objError = { error: i.msg };

      messages.push(objError);
    }
  }
  return messages;
};

const categoryCreateValidator = () => {
  return [
    check('name')
      .notEmpty()
      .withMessage(locale.REQUIRED_ERROR('Name'))
      .isLength({ min: 1, max: 64 })
      .withMessage(locale.LENGTH_MAX_MIN_ERROR({ field: 'Name', min: 1, max: 64 })),
    check('description')
      .notEmpty()
      .withMessage(locale.REQUIRED_ERROR('Description'))
      .isLength({ min: 1, max: 128 })
      .withMessage(locale.LENGTH_MAX_MIN_ERROR({ field: 'Description', min: 1, max: 128 })),
  ];
};

const categoryUpdateValidator = () => {
  return [
    check('name')
      .optional()
      .isLength({ min: 1, max: 64 })
      .withMessage(locale.LENGTH_MAX_MIN_ERROR({ field: 'Name', min: 1, max: 64 })),
    check('description')
      .optional()
      .isLength({ min: 1, max: 128 })
      .withMessage(locale.LENGTH_MAX_MIN_ERROR({ field: 'Description', min: 1, max: 128 })),
  ];
};

const categoryUpdateStautsValidator = () => {
  return [check('status').notEmpty().isBoolean().withMessage(locale.REQUIRED_ERROR('status'))];
};

export { resultsValidator, categoryCreateValidator, categoryUpdateValidator, categoryUpdateStautsValidator };
