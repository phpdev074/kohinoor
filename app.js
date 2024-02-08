import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import ejs from "ejs";
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';
import db from './config/dbConfig.js';
import fileUpload from 'express-fileupload';
import AdminRoutes from './router/AdminRouter.js';
import invoiceRouter from './router/InnvoiceRouter.js';
import categoryRouter from "./router/CategoryRouter.js"
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(fileUpload());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});
app.use(cors());
app.use("/api/admin", AdminRoutes);
app.use("/api/invoice", invoiceRouter);
app.use("/api/stockist", categoryRouter);
app.use((err,res) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
