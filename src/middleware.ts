import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { USER_ROLES } from "@/lib/constants";
import { getAuthSecret, useSecureAuthCookies } from "@/lib/auth-secret";
import { getAdminAuthUser } from "@/lib/supabase/middleware";

async function readStoreToken(req: NextRequest) {
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
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    const { user, supabaseResponse } = await getAdminAuthUser(req);

    if (!path.startsWith("/admin/login") && !user) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      const redirect = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirect.cookies.set(cookie.name, cookie.value);
      });
      return redirect;
    }

    return supabaseResponse;
  }

  if (path.startsWith("/candidate") && path !== "/candidate/login") {
    const token = await readStoreToken(req);
    if (!token || token.role !== USER_ROLES.CANDIDATE) {
      const url = req.nextUrl.clone();
      url.pathname = "/candidate/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/candidate", "/candidate/((?!login).*)"],
};
