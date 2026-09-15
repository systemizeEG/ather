"use client";

import { Input } from "@/components/ui/Input";

export function CandidateForm({
  candidate,
  action,
}: {
  candidate?: {
    user: { name: string; email: string; phone: string | null };
    coupon: { code: string; percentage: number; maxUses: number | null; expiryDate: Date | null };
    targetType: string;
    targetValue: number;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
  };
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}) {
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
        <h2 className="text-xl font-bold">بيانات الحساب</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">الاسم</label>
            <Input name="name" required defaultValue={candidate?.user.name || ""} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">البريد الإلكتروني</label>
            <Input name="email" type="email" required defaultValue={candidate?.user.email || ""} dir="ltr" className="text-right" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">الهاتف (اختياري)</label>
            <Input name="phone" defaultValue={candidate?.user.phone || ""} dir="ltr" className="text-right" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {candidate ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}
            </label>
            <Input name="password" type="password" required={!candidate} minLength={candidate ? undefined : 6} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl space-y-5">
        <h2 className="text-xl font-bold">كود الخصم الخاص بالمرشح</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">كود الخصم</label>
            <Input name="couponCode" required defaultValue={candidate?.coupon.code || ""} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">نسبة الخصم (%)</label>
            <Input name="percentage" type="number" min="0" max="100" step="0.01" required defaultValue={candidate?.coupon.percentage ?? 10} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">أقصى عدد استخدام (اختياري)</label>
            <Input name="maxUses" type="number" min="1" defaultValue={candidate?.coupon.maxUses ?? ""} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">تاريخ انتهاء الكود (اختياري)</label>
            <Input name="expiryDate" type="date" defaultValue={toDate(candidate?.coupon.expiryDate)} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl space-y-5">
        <h2 className="text-xl font-bold">الهدف</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">نوع الهدف</label>
            <select
              name="targetType"
              defaultValue={candidate?.targetType || "ORDERS"}
              className="w-full bg-background border border-border rounded-xl p-3"
            >
              <option value="ORDERS">عدد الطلبات المكتملة</option>
              <option value="REVENUE">إيرادات المبيعات (ج.م)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">قيمة الهدف</label>
            <Input name="targetValue" type="number" min="0" step="0.01" required defaultValue={candidate?.targetValue ?? 100} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">تاريخ البداية</label>
            <Input name="startDate" type="date" required defaultValue={toDate(candidate?.startDate) || toDate(new Date())} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">تاريخ النهاية (اختياري)</label>
            <Input name="endDate" type="date" defaultValue={toDate(candidate?.endDate)} />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={candidate ? candidate.isActive : true} className="w-5 h-5 accent-accent" />
          <span>حساب المرشح مفعل</span>
        </label>
      </div>

      <button type="submit" className="w-full bg-accent text-accent-foreground font-bold py-4 rounded-xl">
        {candidate ? "حفظ التعديلات" : "إنشاء المرشح"}
      </button>
    </form>
  );
}
