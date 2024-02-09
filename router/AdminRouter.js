import express from 'express';
import { adminRegistration,adminLogin } from '../controllers/AdminController.js';
const AdminRoutes = express.Router();
AdminRoutes.post("/register", adminRegistration);
AdminRoutes.post("/login", adminLogin);

export default AdminRoutes;