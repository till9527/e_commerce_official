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
  let adminOtp;
  // If the array has 0 items, insert the OTP at index 0
  if (otpStoreAdmin.length === 0) {
    otpStoreAdmin.push(otp);
    adminOtp=0;
  }
  // If the array has 1 item, insert the new OTP at index 1
  else if (otpStoreAdmin.length === 1) {
    otpStoreAdmin.push(otp);
    adminOtp = otpStoreAdmin[0];
  }
  // If the array has 2 items, shift the first item out and insert the new OTP at index 1
  else if (otpStoreAdmin.length === 2) {
    otpStoreAdmin.shift(); // Remove the first OTP
    otpStoreAdmin.push(otp);
    adminOtp = otpStoreAdmin[0];
  }
  console.log(otpStoreAdmin);

  // Send email with the OTP
  console.log(`Admin otp is ${adminOtp}`);
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your OTP for Admin Verification',
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return new NextResponse(JSON.stringify({ success: true, message: 'OTP sent successfully' }), {
      status: 200,
      headers: { 'x-otp': adminOtp.toString() },
    });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return new NextResponse(JSON.stringify({ success: false, message: 'Failed to send OTP' }), {
      status: 500,
    });
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

