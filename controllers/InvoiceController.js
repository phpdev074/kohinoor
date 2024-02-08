import Invoice from "../models/innvoiceSchema.js";
import pdfDocument from "pdfkit";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import fs from "fs";
import {
  handleSuccess,
  handleFail,
  handleError,
} from "../responseHandler/response.js";
import Seller from "../models/sellerSchema.js";
import statusCode from "../constants/statusCode.js";
import pdfkit from "pdfkit";

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
    const ratePerLengthArray = ratePerLength ? ratePerLength.split(",") : [];
    const quantityArray = quantity ? quantity.split(",") : [];
    const meterArray = meter ? meter.split(",") : [];
    const savedInvoice = await Invoice.create({
      name,
      phoneNumber,
      productName: productNameArray,
      hsnCode: hsnCodeArray,
      ratePerLength: ratePerLengthArray,
      quantity: quantityArray,
      meter: meterArray,
    });

    if (savedInvoice) {
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
export const getInnvoice = async (req, res) => {
  try {
    const getLastCreatedInnvoice = await Invoice.find()
      .sort({ $natural: -1 })
      .limit(1);
    const doc = new pdfkit();
    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .text("Raymond", { align: "center" })
      .moveDown();
    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .text("GST No. 04AUYPS3449PIZI", { align: "left" })
      .moveUp(1)
      .font("Helvetica-Bold")
      .text("Retail", { align: "center" })
      .moveUp(1)
      .font("Helvetica-Bold")
      .text("Time", { align: "right" })
      .moveDown();
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Kohinoor Selections", { align: "center" })
      .moveDown();
      doc
      .fontSize(15)
      .font("Helvetica")
      .text(
        "SCO-71-72-73 SECTOR-17C",
        { align: "center" }
      )
      .moveDown(0.5);
      doc
      .fontSize(15)
      .font("Helvetica")
      .text(
        "CHANDIGARH(UT) India",
        { align: "center" }
      )
      .moveDown(0.5);
      doc
      .fontSize(15)
      .font("Helvetica")
      .text(
        "Phone N0.: 0172-2714545",
        { align: "center" }
      )
      .moveDown();
    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .text(
        "..................................................................................",
        { align: "center" }
      )
      .moveDown();
    doc
      .fontSize(15)
      .font("Helvetica")
      .text("INVOICE:", { align: "left" })
      .moveUp(1)
      .text("Date:", { align: "right" })
      .moveDown();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
    doc.pipe(res);
    doc.end();
    console.log(getLastCreatedInnvoice);
    res.render(path.join(__dirname, "views", "index"), {
      invoices: getLastCreatedInnvoice,
    });
  } catch (error) {
    const message = error.message;
    handleError(res, message, statusCode?.INTERNAL_SERVER_ERROR);
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
