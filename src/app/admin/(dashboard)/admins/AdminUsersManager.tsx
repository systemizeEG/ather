"use client";

import { useState } from "react";
import { deleteAdminAccount } from "@/app/actions/admin-users";
import { AddAdminForm } from "./AddAdminForm";
import { Button } from "@/components/ui/Button";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPanel } from "@/components/admin/AdminPageHeader";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/components/TranslationProvider";
import { ADMIN_ROLES } from "@/lib/constants";

export type AdminRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
};

export function AdminUsersManager({
  admins,
  currentUserId,
  currentRole,
}: {
  admins: AdminRow[];
  currentUserId: string;
  currentRole: string;
}) {
  const { t, locale } = useTranslation();
  const [creating, setCreating] = useState(false);
  const canCreateSuperadmin = currentRole === ADMIN_ROLES.SUPERADMIN;
  const dateFmt = locale === "ar" ? "ar-EG" : "en-GB";

  const roleLabel = (role: string) =>
    role === ADMIN_ROLES.SUPERADMIN ? t.admin.roleSuperadmin : t.admin.roleAdmin;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 ms-0 me-1.5" /> {t.admin.addAdmin}
        </Button>
      </div>

      <AdminPanel>
        {admins.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted-foreground">{t.admin.noAdmins}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-muted/40 text-muted-foreground text-sm">
                <tr>
                  <th className="px-6 py-3">{t.admin.colUsername}</th>
                  <th className="px-6 py-3">{t.admin.colEmail}</th>
                  <th className="px-6 py-3">{t.admin.colRole}</th>
                  <th className="px-6 py-3">{t.admin.colCreated}</th>
                  <th className="px-6 py-3 text-center">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admins.map((admin) => {
                  const isYou = admin.id === currentUserId;
                  return (
                    <tr key={admin.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="font-bold flex items-center gap-2">
                          {admin.username}
                          {isYou && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold-deep">
                              {t.admin.youBadge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4" dir="ltr">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4">{roleLabel(admin.role)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(admin.createdAt).toLocaleDateString(dateFmt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-500/10"
                          disabled={isYou}
                          onClick={async () => {
                            if (!confirm(t.admin.confirmDeleteAdmin)) return;
                            const result = await deleteAdminAccount(admin.id);
                            if (result.error) alert(result.error);
                          }}
                        >
                          <Trash2 className="w-4 h-4 ms-0 me-1" /> {t.admin.delete}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <AdminModal open={creating} title={t.admin.addAdminTitle} onClose={() => setCreating(false)}>
        <AddAdminForm canCreateSuperadmin={canCreateSuperadmin} onDone={() => setCreating(false)} />
      </AdminModal>
    </div>
  );
}
