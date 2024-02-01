import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID ;
const authToken = process.env.TWILIO_AUTH_TOKEN ;
const twilioClient = twilio(accountSid, authToken);
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
export { twilioClient, generateOTP };