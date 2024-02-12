import Invoice from "../models/innvoiceSchema.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    const ratePerLengthArray = ratePerLength
      ? ratePerLength.split(",").map(Number)
      : [];
    const quantityArray = quantity ? quantity.split(",").map(Number) : [];
    const meterArray = meter ? meter.split(",").map(Number) : [];

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
      const getLastCreatedInnvoice = await Invoice.find()
        .sort({ $natural: -1 })
        .limit(1);
      console.log(getLastCreatedInnvoice);
      const headers = [
        "HSN Code",
        "Product Name",
        "Rate per length",
        "Quantity",
        "Meter",
      ];
  
      // Extracting data from the last invoice
      const tableData = getLastCreatedInnvoice.map((item) => ({
        productName: item.productName,
        hsnCode: item.hsnCode,
        ratePerLength: item.ratePerLength,
        quantity: item.quantity,
        meter: item.meter,
      }));
  
      const tableTop = 500;
      const rowHeight = 30;
      const colWidth = 100;
      const tableLeft = 30;
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
        .text("SCO-71-72-73 SECTOR-17C", { align: "center" })
        .moveDown(0.5);
      doc
        .fontSize(15)
        .font("Helvetica")
        .text("CHANDIGARH(UT) India", { align: "center" })
        .moveDown(0.5);
      doc
        .fontSize(15)
        .font("Helvetica")
        .text("Phone N0.: 0172-2714545", { align: "center" })
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
      doc
        .fontSize(15)
        .font("Helvetica")
        .text("M/S:", { align: "left" })
        .moveDown(0.5);
      doc
        .fontSize(15)
        .font("Helvetica")
        .text("NEAR SEN. SEC. SCHOOL RINGROAD RAJPURA RANI(pkl)", {
          align: "left",
        })
        .moveDown();
      doc
        .fontSize(15)
        .font("Helvetica")
        .text("GST No. ", { align: "left" })
        .moveDown();
      doc.fontSize(11).font("Helvetica-Bold");
        headers.forEach((header, i) => {
        const xPos = tableLeft + i * colWidth;
        const yPos = tableTop;
        const cellWidth = colWidth;
        const cellHeight = rowHeight;
        doc.rect(xPos, yPos, cellWidth, cellHeight).stroke();
        doc.text(header, xPos + 5, yPos + 5);
      });
      doc.fontSize(11).font("Helvetica");
        tableData.forEach((row, rowIndex) => {
        Object.entries(row).forEach(([key, value], colIndex) => {
          const xPos = tableLeft + colIndex * colWidth;
          const yPos = tableTop + (rowIndex + 1) * rowHeight;
          const cellWidth = colWidth;
          const cellHeight = rowHeight;
          const lines = Array.isArray(value) ? value : [value]; 
          lines.forEach((line, index) => {
            doc.text(String(line), xPos + 5, yPos + index * rowHeight, { width: cellWidth });
          });
        });
      });
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
      doc.pipe(res);
      doc.end();
      console.log(getLastCreatedInnvoice);
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
export const updateSeller = async (req, res) => {
    try {
      const { id } = req.query; 
      const { name } = req.body; 
      const updatedSeller = await Seller.findByIdAndUpdate(id, { name }, { new: true });
        if (updatedSeller) {
        handleSuccess(res, updatedSeller, "Seller updated successfully", statusCode?.OK);
      } else {
        handleFail(res, "Seller not found", statusCode?.NOT_FOUND);
      }
    } catch (error) {
      console.log(error.message);
      handleError(res, error.message, statusCode?.INTERNAL_SERVER_ERROR);
    }
  };
export const deleteSeller = async (req, res) => {
    try {
      const { id } = req.query; 
      const deletedSeller = await Seller.findByIdAndDelete({_id:id});
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
  
