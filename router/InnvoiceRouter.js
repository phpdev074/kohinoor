import express from 'express';
import { createInvoice,createSeller,getAllSeller,getInnvoice,getAllInvoice } from '../controllers/InvoiceController.js';
import {validationMiddleware} from '../middileware/userValidation.js';
import verifyAuthToken from '../middileware/JwtVerify.js';
const invoiceRouter = express.Router();
invoiceRouter.post("/",verifyAuthToken,validationMiddleware,createInvoice)
invoiceRouter.post("/seller",verifyAuthToken,createSeller)
invoiceRouter.get("/get-invoice",verifyAuthToken,getInnvoice)
invoiceRouter.get("/get-seller-list",verifyAuthToken,getAllSeller)
invoiceRouter.get("/get-invoice-list",verifyAuthToken,getAllInvoice)
export default invoiceRouter;   