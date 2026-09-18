import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { ADMIN_ROLES, USER_ROLES } from "@/lib/constants";
import { getAuthSecret, useSecureAuthCookies } from "@/lib/auth-secret";

async function readAccessToken(req: NextRequest) {
  const secret = getAuthSecret();
  const preferred = await getToken({
    req,
    secret,
    secureCookie: useSecureAuthCookies(),
  });
  if (preferred) return preferred;
  return getToken({ req, secret, secureCookie: !useSecureAuthCookies() });
}

export async function middleware(req: NextRequest) {
  const token = await readAccessToken(req);
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const isAdmin =
      token?.role === ADMIN_ROLES.ADMIN || token?.role === ADMIN_ROLES.SUPERADMIN;
    if (!token || !isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith("/candidate")) {
    if (!token || token.role !== USER_ROLES.CANDIDATE) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/((?!login).*)", "/candidate/:path*"],
};
