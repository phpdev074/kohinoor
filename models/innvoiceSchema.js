import mongoose from 'mongoose';
const invoiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique:true
  },
  productName: [{
    type: String,
    required: true,
  }],
  hsnCode: [{
    type: String,
    required: true,
  }],
  ratePerLength:[ {
    type: Number,
    required: true,
  }],
  quantity: [{
    type: Number,
    required: true,
  }],
  meter: [{
    type: Number,
    required: true,
  }],
  file: {
    type: String, 
  },
});
const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
