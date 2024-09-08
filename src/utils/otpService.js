"use server";
const nodemailer = require('nodemailer');

// In-memory store for OTPs (using an array)
const otpStore = new Map(); 
let otpStoreAdmin = [];

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helper function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

// Function to send OTP to user's email and manage the OTP array
export async function sendOTP(email) {
  const otp = generateOTP();
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your OTP for Verification',
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    
  } catch (error) {
    console.error('Error sending OTP:', error);

  }
}

export async function sendAdminOTP(email) {
  const otp = generateOTP();
  let adminOtp;

  if (otpStoreAdmin.length === 100) {
    otpStoreAdmin.length=0;
    otpStoreAdmin.push(otp);
  }
  else{
    otpStoreAdmin.push(otp);
  }
  console.log(otpStoreAdmin);
  adminOtp = otpStoreAdmin[0];

  // Send email with the OTP
  console.log(`Admin otp is ${adminOtp}`);
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your OTP for Admin Verification',
    text: `Your OTP is: ${otp}.`,
  };

  try {
    if(otpStoreAdmin.length===1){
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    }
    return adminOtp;
    
  } catch (error) {
    console.error('Error sending OTP:', error);

  }
}


// Function to verify OTP
export async function verifyAdminOTP(email, otpInput,adminOtp) {

console.log(otpInput)
console.log(adminOtp)

  // Verify if the input OTP matches the stored OTP at the last index
  if (otpInput === adminOtp) {
    return true; // OTP is valid
  } else {
    throw new Error('Invalid OTP');
  }
}
export async function verifyOTP(email, otpInput) {
  const otpData = otpStore.get(email);

  if (!otpData) {
    throw new Error('No OTP found for this email');
  }

  const { otp, expiresAt } = otpData;

  // Check if OTP is expired
  if (Date.now() > expiresAt) {
    otpStore.delete(email); // Remove expired OTP
    throw new Error('OTP has expired');
  }

  // Verify if the input OTP matches the stored OTP
  if (otpInput === otp) {
    otpStore.delete(email); // Remove OTP after successful verification
    return true; // OTP is valid
  } else {
    throw new Error('Invalid OTP');
  }
}
