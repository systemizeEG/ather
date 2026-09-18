"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { createAdminAuthClient } from "@/lib/supabase/server";
import { signOutAdminSession } from "@/lib/supabase/admin-session";

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

async function ensureSupabaseAdminUser(email: string, password: string, role: string, username: string) {
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role, username, app: "ather-admin" },
  });

  if (!error) return;

  const alreadyExists =
    error.message?.toLowerCase().includes("already") ||
    error.status === 422;

  if (!alreadyExists) {
    throw error;
  }

  const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw listError;

  const existing = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    throw new Error("SUPABASE_ADMIN_USER_MISSING");
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
    password,
    app_metadata: { role, username, app: "ather-admin" },
  });
  if (updateError) throw updateError;
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
