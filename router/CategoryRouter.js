import express from 'express';
import { createCategory,getCategoryList,findCategoryOnTheBasisOfSellerId } from '../controllers/categoryController.js';
import verifyAuthToken from '../middileware/JwtVerify.js';
const categoryRouter = express.Router();
categoryRouter.post("/",verifyAuthToken,createCategory)
categoryRouter.get("/get-category-list",verifyAuthToken,getCategoryList)
categoryRouter.get("/get-category-data",verifyAuthToken,findCategoryOnTheBasisOfSellerId)
export default categoryRouter;
