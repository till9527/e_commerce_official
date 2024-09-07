"use server"
const nodemailer = require('nodemailer');

// In-memory store for OTPs (replace with a database for production use)
const otpStore = new Map(); 

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

// Send OTP to user's email
export async function sendOTP(email) {
  const otp = generateOTP();

  // Store OTP with expiration time (5 minutes in this case)
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  // Send email with the OTP
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your OTP for Order Verification',
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

// Verify OTP
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
