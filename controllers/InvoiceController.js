import Invoice from "../models/innvoiceSchema.js";
import { handleSuccess,handleFail,handleError } from "../responseHandler/response.js";
import Seller from "../models/sellerSchema.js";
import statusCode from "../constants/statusCode.js";
export const createInvoice = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      productName,
      hsnCode,
      ratePerLength,
      quantity,
      meter,
    } = req.body;
    const newInvoice = new Invoice({
      name,
      phoneNumber,
      productName,
      hsnCode,
      ratePerLength,
      quantity,
      meter,
    });
    const savedInvoice = await newInvoice.save();
    if(savedInvoice)
    {
        handleSuccess(res,savedInvoice,"Invoice created successfully",statusCode?.OK)
    }
    else
    {
        handleFail(res,"Invoice Created fail",statusCode?.BAD_REQUEST)
    }
  } catch (error) {
    console.error(error.message);
    handleFail(res,error.message,statusCode?.INTERNAL_SERVER_ERROR)
  }
};
export const createSeller = async(req,res)=>{
     try {
                const {name} = req.body
                const createSeller = await Seller.create({name})
                handleSuccess(res,createSeller,"Seller is created Successfully",statusCode?.OK)
     } catch (error) {
        
     }
}
export const getAllSeller = async(req,res)=>{
    try {
      const getAllSeller = await Seller.find().sort({$natural:-1})
                if(getAllSeller)
                {
                    handleSuccess(res,getAllSeller,'Seller list fetch successfully',statusCode?.OK) 
                }
                else
                {
                    handleFail(res,'Seller list fetch fail',statusCode?.BAD_REQUEST)
                }
    } catch (error) {
        console.log(error.message)
        handleError(res,error.message,statusCode?.INTERNAL_SERVER_ERROR)
    }
}