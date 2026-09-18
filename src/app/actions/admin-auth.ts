"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAdminAuthClient } from "@/lib/supabase/server";
import { signOutAdminSession } from "@/lib/supabase/admin-session";
import { ensureSupabaseAdminUser } from "@/lib/supabase/provision-admin";

async function findAdminAccount(identifier: string) {
  const value = identifier.trim();
  if (!value) return null;

  return prisma.adminUser.findFirst({
    where: {
      OR: [
        { username: value },
        { email: { equals: value, mode: "insensitive" } },
      ],
    },
  });
}

export async function adminSignIn(identifier: string, password: string) {
  try {
    const admin = await findAdminAccount(identifier);
    if (!admin) return { success: false as const };

    const supabase = await createAdminAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: admin.email,
      password,
    });

    if (data.user && !error) {
      return { success: true as const };
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) return { success: false as const };

    await ensureSupabaseAdminUser(admin.email, password, admin.role, admin.username);

    const retry = await supabase.auth.signInWithPassword({
      email: admin.email,
      password,
    });

    if (!retry.data.user || retry.error) {
      return { success: false as const };
    }

    return { success: true as const };
  } catch (error) {
    console.error("adminSignIn failed", error);
    return { success: false as const };
  }
}

export async function adminSignOut() {
  await signOutAdminSession();
}
