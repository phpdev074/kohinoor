import Category from "../models/categorySchema.js";
import Seller from "../models/sellerSchema.js";
import mongoose from "mongoose";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../Helpers/AwsConfig.js";
import {
  handleSuccess,
  handleFail,
  handleError,
} from "../responseHandler/response.js";
import statusCode from "../constants/statusCode.js";
import { v4 as uuidv4 } from "uuid";

export const createCategory = async (req, res) => {
  try {
    const { categoryName, seller, billNo,date } = req.body;
    console.log(date)
    const convertedDate = new Date(date)
    let images = req.files && req.files.images;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    let uploadedImageUrls = [];
    if (!images || (Array.isArray(images) && images.length === 0)) {
      const errorMessage = "Images are Required";
      return handleFail(res, errorMessage, 400);
    }

    if (!Array.isArray(images)) {
      images = [images];
    }

    for (const image of images) {
      const imageName = `${uuidv4()}_${image.name}`;
      const bucketParams = {
        Bucket: bucketName,
        Key: imageName,
        Body: image.data,
        ContentType: image.mimetype,
      };
      const uploadCommand = new PutObjectCommand(bucketParams);
      await s3Client.send(uploadCommand);
      const accessibleUrl = `https://${bucketParams.Bucket}.s3.${process.env.REGION}.amazonaws.com/${imageName}`;
      uploadedImageUrls.push(accessibleUrl);
    }
    const categoryCreate = await Category.create({
      categoryName,
      seller,
      date:convertedDate,
      images: uploadedImageUrls,
      billNo,
    });
    if (categoryCreate) {
      handleSuccess(
        res,
        categoryCreate,
        "Stock created successfully",
        statusCode?.OK
      );
    } else {
      handleFail(res, "Stock created failed", statusCode?.BAD_REQUEST);
    }
  } catch (error) {
    console.log(error.message);
    handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
  }
};
export const getCategoryList = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1); 
    const endDate = new Date(year, month, 0); 
    const getListOfCategory = await Category.find({
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ $natural: -1 })
      .populate("seller", "name");
    if (getListOfCategory) {
      handleSuccess(
        res,
        getListOfCategory,
        "Stock list fetched successfully",
        statusCode?.OK
      );
    } else {
      handleFail(res, "Stock lsit fetch failes", statusCode?.BAD_REQUEST);
    }
  } catch (error) {
    console.log(error.message);
    handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
  }
};

export const findCategoryOnTheBasisOfSellerId = async (req, res) => {
  try {
    const sellerId = req.query.sellerId;
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId)
    const checkSellerExist = await Seller.findOne({ _id: sellerObjectId });
    if (!checkSellerExist) {
      handleFail(res, "This seller is not exist", statusCode.BAD_REQUEST);
    } else {
      const getCategory = await Category.find({ seller: sellerObjectId }).populate(
        "seller",
        "name"
      );
      if (getCategory) {
        handleSuccess(
          res,
          getCategory,
          "Stock Data fetched successfully",
          statusCode?.OK
        );
      } else {
        handleFail(
          res,
          "No data Found on this sellerId",
          statusCode?.PRECONDITION_FAILED
        );
      }
    }
  } catch (error) {
    console.log(error.message);
    handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
  }
};
