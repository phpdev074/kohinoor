import { body } from "express-validator";
export const validationTaskMiddleware = [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('status').trim().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  ];