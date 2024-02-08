import mongoose from 'mongoose';
const { Schema } = mongoose;
const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    billNo:{
      type:String,
      required:true
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    images: {
      type: [String], 
      required: true,
    },
  },
  { timestamps: true } 
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
