// isValidPassword.js
const { adminOTP } = require("./otpGeneration");


export async function isValidPassword(password: string) {
  return password === adminOTP;
}
