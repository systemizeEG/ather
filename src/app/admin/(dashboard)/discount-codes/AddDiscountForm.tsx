"use client";

import { createDiscountCode } from "@/app/actions/admin";
import { useState } from "react";
import { ExpiryDatePicker } from "./ExpiryDatePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AddDiscountForm({ onDone }: { onDone?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const action = async (formData: FormData) => {
    setIsSubmitting(true);
    const res = await createDiscountCode(formData);
    setIsSubmitting(false);
    if (res.success) {
      onDone?.();
    } else if (res.error) {
      alert(res.error);
    }
  };

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-2">كود الخصم</label>
        <Input name="code" placeholder="مثال: SAVE10" required dir="ltr" className="uppercase" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-2">نسبة الخصم %</label>
          <Input name="percentage" type="number" step="0.01" min="0" max="100" placeholder="10" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">حد الاستخدام</label>
          <Input name="maxUses" type="number" min="1" placeholder="بدون حد" />
        </div>
      </div>
      <ExpiryDatePicker />
      <p className="text-xs text-muted-foreground">كوبونات المرشحين تُنشأ من صفحة المرشحين مع حسابهم.</p>
      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        إنشاء الكود
      </Button>
    </form>
  );
}
