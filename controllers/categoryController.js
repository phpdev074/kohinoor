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
      let { month, year, page, limit, sellerId } = req.query;
      page = parseInt(page) || 1; 
      limit = parseInt(limit) || 20; 
      if (sellerId) {
        const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
          const seller = await Seller.findById(sellerObjectId);
        if (!seller) {
          return handleFail(res, "Seller not found", statusCode?.NOT_FOUND);
        }
        const skip = (page - 1) * limit; 
        const getListOfCategory = await Category.find({ seller: sellerObjectId })
          .sort({ createdAt: -1 })
          .skip(skip) 
          .limit(limit) 
          .populate("seller", "name");
  
        // Get total count based on seller query
        const totalCount = await Category.countDocuments({ seller: sellerObjectId });
  
        if (getListOfCategory) {
          const response = { getListOfCategory, count: getListOfCategory.length, currentPage: page, totalCount };
          handleSuccess(
            res,
            response,
            "Stock list fetched successfully",
            statusCode?.OK
          );
        } else {
          handleFail(res, "Stock list fetch failed", statusCode?.BAD_REQUEST);
        }
      } else {
        let query = {};
        if (month && year) {
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);
          query.date = { $gte: startDate, $lte: endDate };
        }
        else if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }
        const totalCount = await Category.countDocuments(query); 
        const totalPages = Math.ceil(totalCount / limit); 
        const skip = (page - 1) * limit; 
        const getListOfCategory = await Category.find(query)
          .sort({ createdAt: -1 })
          .skip(skip) 
          .limit(limit) 
          .populate("seller", "name");
  
        if (getListOfCategory) {
          const response = { getListOfCategory, count: getListOfCategory.length, totalPages, currentPage: page, totalCount };
          handleSuccess(
            res,
            response,
            "Stock list fetched successfully",
            statusCode?.OK
          );
        } else {
          handleFail(res, "Stock list fetch failed", statusCode?.BAD_REQUEST);
        }
      }
    } catch (error) {
      console.log(error.message);
      handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
    }
  };
  
