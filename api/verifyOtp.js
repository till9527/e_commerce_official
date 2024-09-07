import { verifyAdminOTP } from "../src/utils/otpService";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, otpInput } = req.body;
    try {
      const isValid = await verifyAdminOTP(email, otpInput);
      if (isValid) {
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false, message: 'Invalid OTP' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
