import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  // Call the API route to check authentication
  const authResponse = await fetch(`${req.nextUrl.origin}/api/authenticate`, {
    headers: { authorization: authHeader },
  });

  if (authResponse.status === 200) {
    return NextResponse.next();
  } else {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }
}

export const config = {
  matcher: "/admin/:path*",
};
