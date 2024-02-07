import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
}, {
  timestamps: true 
});

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
