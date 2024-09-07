// isValidPassword.js
const { adminOTP } = require("./otpGeneration");


async function isValidPassword(password) {
  return password === adminOTP;
}
module.exports = { isValidPassword };
