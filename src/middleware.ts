import { NextRequest, NextResponse } from "next/server"
import { isValidPassword } from "./lib/isValidPassword"
import {sendOTP, verifyOTP} from "@/utils/otpService"

export async function middleware(req: NextRequest) {
  sendOTP(process.env.GMAIL_USER);
  if ((await isAuthenticated(req)) === false) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    })
  }
}

async function isAuthenticated(req: NextRequest) {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization")

  if (authHeader == null) return false

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":")

  return (
    username === process.env.ADMIN_USERNAME &&
    (await verifyOTP(process.env.GMAIL_USER,password))
  )
}

export const config = {
  matcher: "/admin/:path*",
}
