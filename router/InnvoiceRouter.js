import express from 'express';
import { createInvoice,createSeller,getAllSeller } from '../controllers/InvoiceController.js';
import {validationMiddleware} from '../middileware/userValidation.js';
import verifyAuthToken from '../middileware/JwtVerify.js';
const invoiceRouter = express.Router();
invoiceRouter.post("/",verifyAuthToken,validationMiddleware,createInvoice)
invoiceRouter.post("/seller",createSeller)
invoiceRouter.get("/get-seller-list",verifyAuthToken,getAllSeller)
export default invoiceRouter;