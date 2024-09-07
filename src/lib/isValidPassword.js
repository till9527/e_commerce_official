// isValidPassword.js
const { adminOTP } = require("./otpGeneration");


async function isValidPassword(password: string) {
  return password === adminOTP;
}
module.exports = { isValidPassword };
