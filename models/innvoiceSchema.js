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
    type: String,
    required: true,
  }],
  quantity: [{
    type: String,
    required: true,
  }],
  meter: [{
    type: String,
    required: true,
  }],
  file: {
    type: String, 
  },
},{
  timestamps: true 
});
const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
