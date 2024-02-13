import express from 'express';
import { createInvoice,createSeller,getAllSeller,getInnvoice,getAllInvoice,updateSeller,deleteSeller } from '../controllers/InvoiceController.js';
import {validationMiddleware} from '../middileware/userValidation.js';
import verifyAuthToken from '../middileware/JwtVerify.js';
import Invoice from '../models/innvoiceSchema.js';
const invoiceRouter = express.Router();
invoiceRouter.post("/",verifyAuthToken,validationMiddleware,createInvoice)
invoiceRouter.post("/seller",verifyAuthToken,createSeller)
invoiceRouter.get("/get-invoice",getInnvoice)
invoiceRouter.get("/get-seller-list",verifyAuthToken,getAllSeller)
invoiceRouter.get("/get-invoice-list",verifyAuthToken,getAllInvoice)
invoiceRouter.put("/update-seller",verifyAuthToken,updateSeller)
invoiceRouter.delete("/delete-seller",verifyAuthToken,deleteSeller)
export default invoiceRouter;   