import { supabaseAdmin } from "@/lib/supabase";

export async function ensureSupabaseAdminUser(
  email: string,
  password: string,
  role: string,
  username: string
) {
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role, username, app: "ather-admin" },
    user_metadata: { username },
  });

  if (!error) return;

  const alreadyExists =
    error.message?.toLowerCase().includes("already") || error.status === 422;

  if (!alreadyExists) {
    throw error;
  }

  const existing = await findSupabaseUserByEmail(email);
  if (!existing) {
    throw new Error("SUPABASE_ADMIN_USER_MISSING");
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
    password,
    app_metadata: { role, username, app: "ather-admin" },
    user_metadata: { username },
  });
  if (updateError) throw updateError;
}

export async function findSupabaseUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function deleteSupabaseAdminUser(email: string) {
  const existing = await findSupabaseUserByEmail(email);
  if (!existing) return;
  const { error } = await supabaseAdmin.auth.admin.deleteUser(existing.id);
  if (error) throw error;
}
