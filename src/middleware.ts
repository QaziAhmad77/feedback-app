import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

// config.matcher specifies the routes that this middleware should apply to. In this case, it covers:
// /dashboard/:path* - All dashboard-related routes.
// /sign-in and /sign-up - Authentication pages.
// / - The home page.
// /verify/:path* - Email verification-related routes.
// This middleware will run for these routes.

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/", "/verify/:path*"],
};

// middleware is the function that gets executed on every request to the matched routes.

export async function middleware(request: NextRequest) {
  // getToken(Middleware / Server - Side);
  // Where It’s Used: In middleware functions or API routes on the server.
  // Purpose: Checks for an active session token directly on the server before any page or API data is sent to the client. This is ideal for protecting routes or handling redirects without relying on a client-side check.
  // How It Works: getToken extracts the session token from the request headers or cookies on the server side, enabling you to determine user authentication without involving the client.
  // When to Use: In cases like this middleware, where you want to handle redirects or control access to routes server-side. This ensures unauthorized users don’t even reach the client-side components of protected pages.
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}
