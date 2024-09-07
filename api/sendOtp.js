import { sendOTP } from "../src/utils/otpService";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email } = req.body;
    try {
      const adminOtp = await sendOTP(email);
      res.setHeader('x-otp', adminOtp);
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
