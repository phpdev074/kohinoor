import express from 'express';
import { createInvoice } from '../controllers/InvoiceController.js';
import {validationMiddleware} from '../middileware/userValidation.js';
import verifyAuthToken from '../middileware/JwtVerify.js';
const invoiceRouter = express.Router();
invoiceRouter.post("/",verifyAuthToken,validationMiddleware,createInvoice)
export default invoiceRouter;