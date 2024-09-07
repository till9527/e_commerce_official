import { NextRequest, NextResponse } from "next/server";
import { delay } from "./utils/delay"; // Adjust the path based on your file structure

export async function middleware(req: NextRequest) {

  if ((await isAuthenticated(req)) === false) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }
}

async function isAuthenticated(req: NextRequest) {
  const email = process.env.GMAIL_USER;
  
  // Send OTP
  await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sendOtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  // Wait for 5 seconds before verifying OTP
  
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader == null) return false;

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verifyOtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email, otpInput: password }),
  });

  const result = await response.json();
  return result.success;
}

export const config = {
  matcher: "/admin/:path*",
};
