import express from 'express';
import { createCategory,getCategoryList } from '../controllers/categoryController.js';
import verifyAuthToken from '../middileware/JwtVerify.js';
const categoryRouter = express.Router();
categoryRouter.post("/",verifyAuthToken,createCategory)
categoryRouter.get("/get-stockist-list",verifyAuthToken,getCategoryList)
export default categoryRouter;
