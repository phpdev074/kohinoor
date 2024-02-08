import Category from "../models/categorySchema.js";
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
    const {categoryName,seller,billNo} = req.body
    let images = req.files && req.files.images;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    let uploadedImageUrls = [];
      if (!images || (Array.isArray(images) && images.length === 0)) {
        const errorMessage = "Images are required for postingType: Images";
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
    const categoryCreate = await Category.create({categoryName,seller,images:uploadedImageUrls,billNo});
    if(categoryCreate)
    {
        handleSuccess(res,categoryCreate,"Category created successfully",statusCode?.OK)
    }
    else
    {
        handleFail(res,"Category created failed",statusCode?.BAD_REQUEST)
    }
  } catch (error) {
    console.log(error.message)
    handleError(res,error.message,statusCode?.INTERNAL_SERVER_ERROR)    
}
};
export const getCategoryList = async(req,res)=>{
    try {
            const getListOfCategory = await Category.find().sort({$natural:-1})
            if(getListOfCategory)
            {
                handleSuccess(res,getListOfCategory,"Category list fetched successfully",statusCode?.OK)
            }
            else
            {
                handleFail(res,"Category lsit fetch failes",statusCode?.BAD_REQUEST)
            }
    } catch (error) {
            console.log(error.message)
            handleError(res,error.message,statusCode?.INTERNAL_SERVER_ERROR)
    }
}
