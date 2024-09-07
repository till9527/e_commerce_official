"use server"
const nodemailer = require("nodemailer");

// In-memory store for admin OTP
export let adminOTP = null;

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helper function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

// Send OTP to admin email
async function sendAdminOTP() {
  adminOTP = generateOTP();

  // Send email with the OTP
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "ecommercesitecs351@gmail.com",
    subject: "Your Admin OTP",
    text: `Your new admin OTP is: ${adminOTP}. It will expire in 1 hour.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin OTP sent to ecommercesitecs351@gmail.com`);
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
}

// Call sendAdminOTP every hour
setInterval(() => {
  sendAdminOTP();
}, 60 * 60 * 1000); // 1 hour

// Send OTP immediately when the server starts
sendAdminOTP();

