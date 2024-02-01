import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import adminSchema from "../models/adminSchema.js"
import bcrypt from "bcrypt";
export const adminRegistration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, phoneNumber, password } = req.body;
    const existingUser = await adminSchema.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ error: "Phone Number is already registered" });
    }
    const newUser = new adminSchema({ name, phoneNumber, password });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, { expiresIn: '24h' });

    // Remove password from the response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Send the token as part of the response
    res.status(200).json({ user: userResponse, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const adminLogin = async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      const user = await adminSchema.findOne({ phoneNumber });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, error: 'Invalid Phone Number or password' });
      }
      const token = jwt.sign({ userId: user._id, userEmail: user.email }, process.env.SECRET_KEY, { expiresIn: '24h' });
      res.status(200).json({ success: true, token, message: 'User login successful' });
    } catch (err) {
      console.error(err);
      res.status(400).json({ success: false, error: err.message });
    }
  };
  