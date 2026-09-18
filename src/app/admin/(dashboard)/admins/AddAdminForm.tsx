"use client";

import { useState } from "react";
import { createAdminAccount } from "@/app/actions/admin-users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/components/TranslationProvider";
import { ADMIN_ROLES } from "@/lib/constants";

export function AddAdminForm({
  canCreateSuperadmin,
  onDone,
}: {
  canCreateSuperadmin: boolean;
  onDone?: () => void;
}) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const action = async (formData: FormData) => {
    setIsSubmitting(true);
    setError("");
    const res = await createAdminAccount(formData);
    setIsSubmitting(false);
    if (res.success) {
      onDone?.();
      return;
    }
    if (res.error) setError(res.error);
  };

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-2">{t.admin.adminUsername}</label>
        <Input name="username" required minLength={3} dir="ltr" className="text-start" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">{t.admin.adminEmail}</label>
        <Input name="email" type="email" required dir="ltr" className="text-start" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">{t.admin.adminPassword}</label>
        <Input name="password" type="password" required minLength={8} dir="ltr" />
        <p className="text-xs text-muted-foreground mt-1">{t.admin.adminPasswordHint}</p>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">{t.admin.adminRole}</label>
        <select
          name="role"
          defaultValue={ADMIN_ROLES.ADMIN}
          className="w-full h-11 rounded-xl border border-gold/30 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value={ADMIN_ROLES.ADMIN}>{t.admin.roleAdmin}</option>
          {canCreateSuperadmin && (
            <option value={ADMIN_ROLES.SUPERADMIN}>{t.admin.roleSuperadmin}</option>
          )}
        </select>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        {t.admin.adminCreateCta}
      </Button>
    </form>
  );
}
