import { createAdminAuthClient } from "@/lib/supabase/server";

export async function signOutAdminSession() {
  const supabase = await createAdminAuthClient();
  await supabase.auth.signOut();
}
