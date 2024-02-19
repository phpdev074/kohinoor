import mongoose from "mongoose";
import Invoice from "../models/innvoiceSchema.js";
import fs from "fs";
import ejs from "ejs";
import puppeteer from "puppeteer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../Helpers/AwsConfig.js";
import { generateUniqueId } from "../utility/generatingUniqueValue.js";
import { v4 as uuidv4 } from "uuid";
import {
  handleSuccess,
  handleFail,
  handleError,
} from "../responseHandler/response.js";
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
    const productNameArray = productName ? productName.split(",") : [];
    const hsnCodeArray = hsnCode ? hsnCode.split(",") : [];
    const ratePerLengthArray = ratePerLength
      ? ratePerLength.split(",").map(Number)
      : [];
    const quantityArray = quantity ? quantity.split(",").map(Number) : [];
    const meterArray = meter ? meter.split(",").map(Number) : [];
    const uniqueId = generateUniqueId();
    const savedInvoice = await Invoice.create({
      name,
      phoneNumber,
      uniqueId,
      productName: productNameArray,
      hsnCode: hsnCodeArray,
      ratePerLength: ratePerLengthArray,
      quantity: quantityArray,
      meter: meterArray,
    });
    if (savedInvoice) {
      const getLastCreatedInnvoice = await Invoice.find({
        _id: savedInvoice?._id,
      });
      let name = "";
      let id = "";
      let productName = "";
      let hsnCode = "";
      let ratePerLength = "";
      let quantity = "";
      let meter = "";
      let createdAt = "";
      let formattedDate = "";
      let formattedTime = "";
      let uniqueId = "";
      let phoneNumber = "";
      if (getLastCreatedInnvoice.length > 0) {
        const lastInvoice = getLastCreatedInnvoice[0];
        name = lastInvoice.name;
        id = lastInvoice?._id;
        productName = lastInvoice.productName || "";
        hsnCode = lastInvoice.hsnCode || "";
        ratePerLength = lastInvoice.ratePerLength || "";
        quantity = lastInvoice.quantity || "";
        meter = lastInvoice.meter || "";
        uniqueId = lastInvoice.uniqueId || "";
        phoneNumber = lastInvoice.phoneNumber || "";
        createdAt = new Date(lastInvoice?.createdAt);
        formattedDate = createdAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        formattedTime = createdAt.toLocaleTimeString("en-IN", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      const template = await fs.promises.readFile("views/index.ejs", "utf8");
      const INVOICE = `#KOHINOOR_${uniqueId}`;
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const compiledHtml = ejs.render(template, {
        title: "Invoice",
        name,
        productName,
        hsnCode,
        ratePerLength,
        quantity,
        meter,
        id,
        formattedDate,
        formattedTime,
        INVOICE,
        uniqueId,
        phoneNumber,
      });
      function pixelsToMillimeters(pixels) {
        const inches = pixels / 100;
        const millimeters = inches * 50;
        return millimeters;
      }
      await page.setContent(compiledHtml);
      const htmlHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });
      const millimeters = pixelsToMillimeters(htmlHeight);
      const pdfFileName = `${uuidv4()}_invoice.pdf`;
      await page.pdf({
        path: pdfFileName,
        width: "95mm",
        height: `${millimeters}`,
      });
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      const bucketParams = {
        Bucket: bucketName,
        Key: pdfFileName,
        Body: await fs.promises.readFile(pdfFileName),
        ContentType: "application/pdf",
      };
      await browser.close();
      const uploadCommand = new PutObjectCommand(bucketParams);
      await s3Client.send(uploadCommand);
      const accessibleUrl = `https://${bucketParams.Bucket}.s3.${process.env.REGION}.amazonaws.com/${pdfFileName}`;
      await fs.promises.unlink(pdfFileName);
      await Invoice.findOneAndUpdate({_id:savedInvoice._id},{ file: accessibleUrl });
      savedInvoice.file = accessibleUrl
      handleSuccess(
        res,
        savedInvoice,
        "Invoice created successfully",
        statusCode.OK
      );
    } else {
      handleFail(res, "Invoice creation failed", statusCode.BAD_REQUEST);
    }
  } catch (error) {
    console.error(error.message);
    handleFail(res, error.message, statusCode.INTERNAL_SERVER_ERROR);
  }
};
export const getAllInvoice = async (req, res) => {
  try {
    let { month, year, page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    let query = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    const totalCount = await Invoice.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    handleSuccess(
      res,
      { invoices, totalPages, currentPage: page, totalCount },
      "Invoice list fetched successfully",
      statusCode?.OK
    );
  } catch (error) {
    console.log(error.message);
    handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
  }
};
export const getInnvoice = async (req, res) => {
  try {
    const invoiceId = req.query.id;
    const invoiceObjectId = new mongoose.Types.ObjectId(invoiceId);
    const getLastCreatedInnvoice = await Invoice.find({
      _id: invoiceObjectId,
    }).limit(1);
    console.log(getLastCreatedInnvoice);
    let name = "";
    let id = "";
    let productName = "";
    let hsnCode = "";
    let ratePerLength = "";
    let quantity = "";
    let meter = "";
    let createdAt = "";
    let formattedDate = "";
    let formattedTime = "";
    let uniqueId = "";
    let phoneNumber = "";
    if (getLastCreatedInnvoice.length > 0) {
      const lastInvoice = getLastCreatedInnvoice[0];
      name = lastInvoice.name;
      id = lastInvoice?._id;
      productName = lastInvoice.productName || "";
      hsnCode = lastInvoice.hsnCode || "";
      ratePerLength = lastInvoice.ratePerLength || "";
      quantity = lastInvoice.quantity || "";
      meter = lastInvoice.meter || "";
      uniqueId = lastInvoice.uniqueId || "";
      phoneNumber = lastInvoice.phoneNumber || "";
      createdAt = new Date(lastInvoice?.createdAt);
      formattedDate = createdAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      formattedTime = createdAt.toLocaleTimeString("en-IN", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const template = await fs.promises.readFile("views/index.ejs", "utf8");
    const INVOICE = `#KOHINOOR_${uniqueId}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const compiledHtml = ejs.render(template, {
      title: "Invoice",
      name,
      productName,
      hsnCode,
      ratePerLength,
      quantity,
      meter,
      id,
      formattedDate,
      formattedTime,
      INVOICE,
      uniqueId,
      phoneNumber,
    });
    function pixelsToMillimeters(pixels) {
      const inches = pixels / 100;
      const millimeters = inches * 50;
      return millimeters;
    }
    await page.setContent(compiledHtml);
    const htmlHeight = await page.evaluate(() => {
      return document.body.scrollHeight;
    });
    const millimeters = pixelsToMillimeters(htmlHeight);
    const pdfFileName = `${uuidv4()}_invoice.pdf`;
    await page.pdf({
      path: pdfFileName,
      width: "95mm",
      height: `${millimeters}`,
    });
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const bucketParams = {
      Bucket: bucketName,
      Key: pdfFileName,
      Body: await fs.promises.readFile(pdfFileName),
      ContentType: "application/pdf",
    };
    await browser.close();
    const uploadCommand = new PutObjectCommand(bucketParams);
    await s3Client.send(uploadCommand);
    const accessibleUrl = `https://${bucketParams.Bucket}.s3.${process.env.REGION}.amazonaws.com/${pdfFileName}`;
    await fs.promises.unlink(pdfFileName);
    await Invoice.findOneAndUpdate({_id: invoiceObjectId},{ file: accessibleUrl });
    handleSuccess(
      res,
      accessibleUrl,
      "Pdf Generated successfully",
      statusCode?.OK
    );
  } catch (error) {
    console.log(error.message);
  }
};
export const createSeller = async (req, res) => {
  try {
    const { name } = req.body;
    const createSeller = await Seller.create({ name });
    handleSuccess(
      res,
      createSeller,
      "Seller is created Successfully",
      statusCode?.OK
    );
  } catch (error) {
    console.log(error.message);
    handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
  }
};
export const getAllSeller = async (req, res) => {
  try {
    const getAllSeller = await Seller.find().sort({ $natural: -1 });
    if (getAllSeller) {
      handleSuccess(
        res,
        getAllSeller,
        "Seller list fetch successfully",
        statusCode?.OK
      );
    } else {
      handleFail(res, "Seller list fetch fail", statusCode?.BAD_REQUEST);
    }
  } catch (error) {
    console.log(error.message);
    handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
  }
};
export const updateSeller = async (req, res) => {
  try {
    const { id } = req.query;
    const { name } = req.body;
    const updatedSeller = await Seller.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (updatedSeller) {
      handleSuccess(
        res,
        updatedSeller,
        "Seller updated successfully",
        statusCode?.OK
      );
    } else {
      handleFail(res, "Seller not exist", statusCode?.NOT_FOUND);
    }
  } catch (error) {
    console.log(error.message);
    handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
  }
};
export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.query;
    const deletedSeller = await Seller.findByIdAndDelete({ _id: id });
    if (deletedSeller) {
      handleSuccess(res, null, "Seller deleted successfully", statusCode?.OK);
    } else {
      handleFail(res, "Seller not found", statusCode?.NOT_FOUND);
    }
  } catch (error) {
    console.log(error.message);
    handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
  }
};
