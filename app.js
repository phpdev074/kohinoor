import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './config/dbConfig.js';
import fileUpload from 'express-fileupload';
import AdminRoutes from './router/AdminRouter.js';
const app = express();
app.use(fileUpload());
app.use(bodyParser.json());
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});
app.use(cors());
app.use("/api/admin", AdminRoutes);
app.use((err,res) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
