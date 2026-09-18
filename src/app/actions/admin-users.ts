"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { ADMIN_ROLES } from "@/lib/constants";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";
import { deleteSupabaseAdminUser, ensureSupabaseAdminUser } from "@/lib/supabase/provision-admin";

function normalizeUsername(value: string) {
  return value.trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function createAdminAccount(formData: FormData) {
  const actor = await requireAdmin();
  const t = getTranslation(await getRequestLocale());

  const username = normalizeUsername(String(formData.get("username") || ""));
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const requestedRole = String(formData.get("role") || ADMIN_ROLES.ADMIN);
  const role =
    requestedRole === ADMIN_ROLES.SUPERADMIN && actor.role === ADMIN_ROLES.SUPERADMIN
      ? ADMIN_ROLES.SUPERADMIN
      : ADMIN_ROLES.ADMIN;

  if (username.length < 3) return { error: t.admin.adminUsernameInvalid };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: t.admin.adminEmailInvalid };
  if (password.length < 8) return { error: t.admin.adminPasswordInvalid };

  const duplicate = await prisma.adminUser.findFirst({
    where: {
      OR: [{ username }, { email: { equals: email, mode: "insensitive" } }],
    },
  });
  if (duplicate) {
    return {
      error:
        duplicate.username === username ? t.admin.adminUsernameTaken : t.admin.adminEmailTaken,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.adminUser.create({
      data: { username, email, passwordHash, role },
    });
  } catch (error: any) {
    if (error?.code === "P2002") return { error: t.admin.adminUsernameTaken };
    console.error("createAdminAccount prisma failed", error);
    return { error: t.admin.adminCreateFailed };
  }

  try {
    await ensureSupabaseAdminUser(email, password, role, username);
  } catch (error) {
    console.error("createAdminAccount supabase failed", error);
    await prisma.adminUser.deleteMany({ where: { email } });
    return { error: t.admin.adminCreateFailed };
  }

  revalidatePath("/admin/admins");
  return { success: true as const };
}

export async function deleteAdminAccount(id: string) {
  const actor = await requireAdmin();
  const t = getTranslation(await getRequestLocale());

  if (actor.id === id) return { error: t.admin.adminCannotDeleteSelf };

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return { error: t.admin.adminNotFound };

  if (target.role === ADMIN_ROLES.SUPERADMIN && actor.role !== ADMIN_ROLES.SUPERADMIN) {
    return { error: t.admin.adminCannotDeleteSuper };
  }

  if (target.role === ADMIN_ROLES.SUPERADMIN) {
    const superCount = await prisma.adminUser.count({ where: { role: ADMIN_ROLES.SUPERADMIN } });
    if (superCount <= 1) return { error: t.admin.adminCannotDeleteLastSuper };
  }

  try {
    await deleteSupabaseAdminUser(target.email);
    await prisma.adminUser.delete({ where: { id } });
  } catch (error) {
    console.error("deleteAdminAccount failed", error);
    return { error: t.admin.adminDeleteFailed };
  }

  revalidatePath("/admin/admins");
  return { success: true as const };
}
