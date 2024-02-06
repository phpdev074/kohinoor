import Invoice from "../models/innvoiceSchema.js";
import { handleSuccess,handleFail,handleError } from "../responseHandler/response.js";
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
