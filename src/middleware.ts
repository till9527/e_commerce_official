import { NextRequest, NextResponse } from "next/server";


const authCache = new Map(); // Simple cache to store timestamps

export async function middleware(req: NextRequest) {
  const email = process.env.GMAIL_USER;
  const cacheKey = `auth_${email}`;

  if (authCache.has(cacheKey)) {
    const lastAuthTime = authCache.get(cacheKey);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (now - lastAuthTime < fiveMinutes) {
      // Within the 5-minute window, skip authentication
      return NextResponse.next();
    }
  }

  if ((await isAuthenticated(req)) === false) {
    console.log(`its false`);
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  // Update the cache with the current time after successful authentication
  authCache.set(cacheKey, Date.now());
  return NextResponse.next();
}

async function isAuthenticated(req: NextRequest) {
  const email = process.env.GMAIL_USER;

  // Send OTP
  const response1 = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sendOtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const result1 = await response1.json();
  const adminOtp = response1.headers.get('x-otp');
  console.log(`Got admin otp as ${adminOtp}`);


  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader == null) return false;

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verifyOtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email, otpInput: password, adminOtp: adminOtp }),
  });

  const result = await response.json();
  return result.success;
}

export const config = {
  matcher: "/admin/:path*",
};

