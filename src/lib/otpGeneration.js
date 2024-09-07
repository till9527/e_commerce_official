// otpGeneration.js
export let adminOTP = null;

function setAdminOTP(newOtp) {
  adminOTP = newOtp;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendAdminOTP() {
  const otp = generateOTP();
  setAdminOTP(otp);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "ecommercesitecs351@gmail.com",
    subject: "Your Admin OTP",
    text: `Your new admin OTP is: ${otp}. It will expire in 1 hour.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin OTP sent to ecommercesitecs351@gmail.com`);
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
}

setInterval(() => {
  sendAdminOTP();
}, 60 * 60 * 1000);

sendAdminOTP();
