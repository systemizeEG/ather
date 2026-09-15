import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES, USER_ROLES } from "@/lib/constants";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as SessionUser;
  if (!user.id) return null;
  return user;
}

export function isAdminRole(role?: string | null) {
  return role === ADMIN_ROLES.ADMIN || role === ADMIN_ROLES.SUPERADMIN;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !isAdminRole(user.role)) {
    throw new Error("UNAUTHORIZED_ADMIN");
  }
  return user;
}

export async function requireCandidate() {
  const user = await getSessionUser();
  if (!user || user.role !== USER_ROLES.CANDIDATE) {
    throw new Error("UNAUTHORIZED_CANDIDATE");
  }
  return user;
}

export async function requireCustomer() {
  const user = await getSessionUser();
  if (!user || user.role !== USER_ROLES.CUSTOMER) {
    throw new Error("UNAUTHORIZED_CUSTOMER");
  }
  return user;
}
