// isValidPassword.js
import { adminOTP } from "./otpGeneration";

export async function isValidPassword(password: string) {
  return password === adminOTP;
}
