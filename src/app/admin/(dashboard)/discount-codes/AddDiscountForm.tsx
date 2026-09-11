"use client";

import { createDiscountCode } from "@/app/actions/admin";
import { useState } from "react";
import { ExpiryDatePicker } from "./ExpiryDatePicker";

export function AddDiscountForm() {
  const [formKey, setFormKey] = useState(0);

  const action = async (formData: FormData) => {
    const res = await createDiscountCode(formData);
    if (res.success) {
      setFormKey((key) => key + 1);
    } else if (res.error) {
      alert(res.error);
    }
  };

  return (
    <div className="bg-card p-8 rounded-2xl border border-border shadow-lg shadow-black/5">
      <h2 className="text-xl font-bold mb-6 text-foreground">إنشاء كود جديد</h2>
      <form key={formKey} action={action} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">كود الخصم</label>
          <input
            name="code"
            type="text"
            placeholder="مثال: SAVE10"
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">نسبة الخصم (%)</label>
          <input
            name="percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="مثال: 10"
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">أقصى عدد استخدام (اختياري)</label>
          <input
            name="maxUses"
            type="number"
            placeholder="اتركه فارغاً للاستخدام غير المحدود"
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>
        <ExpiryDatePicker />
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-[0.98]"
        >
          إنشاء كود الخصم
        </button>
      </form>
    </div>
  );
}
