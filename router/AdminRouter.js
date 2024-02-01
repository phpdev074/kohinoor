import express from 'express';
import { adminRegistration,adminLogin } from '../controllers/AdminController.js';
import {validationMiddleware} from '../middileware/userValidation.js';
const AdminRoutes = express.Router();
AdminRoutes.post("/register", validationMiddleware, adminRegistration);
AdminRoutes.post("/login", adminLogin);

export default AdminRoutes;