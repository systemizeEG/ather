import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminUser } from "@/lib/auth-guards";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";
import { AdminUsersManager } from "./AdminUsersManager";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const current = await getAdminUser();
  if (!current) redirect("/admin/login");

  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <AdminPageHeader title={t.admin.adminsTitle} description={t.admin.adminsDesc} />
      <AdminUsersManager
        currentUserId={current.id}
        currentRole={current.role || "ADMIN"}
        admins={admins.map((admin) => ({
          ...admin,
          createdAt: admin.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
