import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-guards";
import { AdminChrome } from "@/components/admin/AdminChrome";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  if (!isAdminRole(session.user?.role)) {
    redirect("/");
  }

  return <AdminChrome>{children}</AdminChrome>;
}
