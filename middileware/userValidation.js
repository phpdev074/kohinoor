import { body } from "express-validator";
export const validationMiddleware = [
  body('name').notEmpty(),
  body('phoneNumber').notEmpty().custom(value => phoneNumberValidator),
  body('productName').notEmpty(),
  body('hsnCode').notEmpty(),
  body('ratePerLength').isNumeric(),
  body('quantity').isNumeric(),
  body('meter').isNumeric(),
  body('phoneNumber').isMobilePhone('any')
];