import { redirect } from "next/navigation";
import { getAdminUser, isAdminRole } from "@/lib/auth-guards";
import { signOutAdminSession } from "@/lib/supabase/admin-session";
import { AdminChrome } from "@/components/admin/AdminChrome";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin || !isAdminRole(admin.role)) {
    await signOutAdminSession();
    redirect("/admin/login");
  }

  return <AdminChrome>{children}</AdminChrome>;
}
