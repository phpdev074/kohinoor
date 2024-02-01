import { body, check } from "express-validator";

export const validationMiddleware = [
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
  body("phoneNumber")
    .optional()
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid phone number")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits"),
  body("phoneNumber")
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Phone Number is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("passwordConfirmation")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

