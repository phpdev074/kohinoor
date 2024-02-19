import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import adminSchema from "../models/adminSchema.js"
import bcrypt from "bcrypt";
import {
  handleSuccess,
  handleFail,
  handleError,
} from "../responseHandler/response.js";
import statusCode from "../constants/statusCode.js";
export const adminRegistration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, phoneNumber, password,status } = req.body;
    const existingUser = await adminSchema.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ error: "Phone Number is already registered" });
    }
    const newUser = new adminSchema({ name, phoneNumber, password,status });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY);
    const userResponse = newUser.toObject();
    delete userResponse.password;
    handleSuccess(res,{ user: userResponse, token },"Admin Created successfully",statusCode?.OK)
  } catch (err) {
   handleError(res,err?.message,statusCode?.INTERNAL_SERVER_ERROR)
  }
};
export const adminLogin = async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      const user = await adminSchema.findOne({ phoneNumber });
      console.log(user)
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, error: 'Invalid Phone Number or password' });
      }
      const token = jwt.sign({ userId: user._id, userEmail: user.email,userStatus:user?.status }, process.env.SECRET_KEY);
      handleSuccess(res,{token,isSuperAdmin:user?.status},'User login successful',statusCode?.OK)
    } catch (err) {
      console.error(err);
      handleError(res,err.message,statusCode?.INTERNAL_SERVER_ERROR)
    }
  };
  