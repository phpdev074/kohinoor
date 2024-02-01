import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const Salt = 10
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8, // Enforce strong passwords
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});


adminSchema.virtual('passwordConfirmation').set(function(passwordConfirmation) {
  if (passwordConfirmation !== this.password) {
    throw new Error('Passwords do not match');
  }
});


adminSchema.pre('save', async function(next) {
  try {
    this.password = await bcrypt.hash(this.password, Salt); 
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);
