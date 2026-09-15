import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { ADMIN_ROLES, USER_ROLES } from "@/lib/constants";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    if (!token || (token.role !== ADMIN_ROLES.ADMIN && token.role !== ADMIN_ROLES.SUPERADMIN)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith("/candidate")) {
    if (!token || token.role !== USER_ROLES.CANDIDATE) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/((?!login).*)", "/candidate/:path*"],
};
