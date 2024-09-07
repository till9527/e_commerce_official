import { isValidPassword } from "../../lib/isValidPassword";

export default async function handler(req, res) {
  const authHeader =
    req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");

  const isAuthenticated =
    username === process.env.ADMIN_USERNAME &&
    (await isValidPassword(password));

  if (isAuthenticated) {
    return res.status(200).json({ message: "Authorized" });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
