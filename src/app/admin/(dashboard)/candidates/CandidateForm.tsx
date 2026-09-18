"use client";

import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/components/TranslationProvider";

type CandidateFormValues = {
  user: { name: string; email: string; phone: string | null };
  coupon: { code: string; percentage: number; maxUses: number | null; expiryDate: Date | null };
  targetType: string;
  targetValue: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
};

export function CandidateForm({
  candidate,
  action,
}: {
  candidate?: CandidateFormValues;
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}) {
  const { t } = useTranslation();
  const toDate = (value?: Date | null) =>
    value ? new Date(value).toISOString().slice(0, 10) : "";

  return (
    <form
      action={async (formData) => {
        const result = await action(formData);
        if (result?.error) alert(result.error);
      }}
      className="space-y-8"
    >
      <div className="bg-card border border-border p-6 rounded-2xl space-y-5">
        <h2 className="text-xl font-bold">{t.admin.formAccount}</h2>
        <p className="text-sm text-muted-foreground">{t.admin.formLoginHint}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formName}</label>
            <Input name="name" required defaultValue={candidate?.user.name || ""} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formEmail}</label>
            <Input name="email" type="email" required defaultValue={candidate?.user.email || ""} dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formPhoneOptional}</label>
            <Input name="phone" defaultValue={candidate?.user.phone || ""} dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {candidate ? t.admin.formNewPassword : t.admin.formPassword}
            </label>
            <Input name="password" type="password" required={!candidate} minLength={candidate ? undefined : 6} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl space-y-5">
        <h2 className="text-xl font-bold">{t.admin.formCoupon}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formCouponCode}</label>
            <Input name="couponCode" required defaultValue={candidate?.coupon.code || ""} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formPercent}</label>
            <Input name="percentage" type="number" min="0" max="100" step="0.01" required defaultValue={candidate?.coupon.percentage ?? 10} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formMaxUses}</label>
            <Input name="maxUses" type="number" min="1" defaultValue={candidate?.coupon.maxUses ?? ""} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formCouponExpiry}</label>
            <Input name="expiryDate" type="date" defaultValue={toDate(candidate?.coupon.expiryDate)} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl space-y-5">
        <h2 className="text-xl font-bold">{t.admin.formTarget}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formTargetType}</label>
            <select
              name="targetType"
              defaultValue={candidate?.targetType || "ORDERS"}
              className="w-full bg-background border border-border rounded-xl p-3"
            >
              <option value="ORDERS">{t.admin.formTargetOrders}</option>
              <option value="REVENUE">{t.admin.formTargetRevenue}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formTargetValue}</label>
            <Input name="targetValue" type="number" min="0" step="0.01" required defaultValue={candidate?.targetValue ?? 100} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formStartDate}</label>
            <Input name="startDate" type="date" required defaultValue={toDate(candidate?.startDate) || toDate(new Date())} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.formEndDate}</label>
            <Input name="endDate" type="date" defaultValue={toDate(candidate?.endDate)} />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={candidate ? candidate.isActive : true} className="w-5 h-5 accent-accent" />
          <span>{t.admin.formActive}</span>
        </label>
      </div>

      <button type="submit" className="w-full bg-accent text-accent-foreground font-bold py-4 rounded-xl">
        {candidate ? t.admin.formSave : t.admin.formCreate}
      </button>
    </form>
  );
}
