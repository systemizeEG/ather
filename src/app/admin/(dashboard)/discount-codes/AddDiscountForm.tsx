"use client";

import { createDiscountCode } from "@/app/actions/admin";
import { useState } from "react";
import { ExpiryDatePicker } from "./ExpiryDatePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/components/TranslationProvider";

export function AddDiscountForm({ onDone }: { onDone?: () => void }) {
  const { t } = useTranslation();
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
        <label className="block text-sm font-semibold mb-2">{t.admin.discountCode}</label>
        <Input name="code" placeholder="SAVE10" required dir="ltr" className="uppercase" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-2">{t.admin.discountPercent}</label>
          <Input name="percentage" type="number" step="0.01" min="0" max="100" placeholder="10" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{t.admin.usageLimit}</label>
          <Input name="maxUses" type="number" min="1" placeholder={t.admin.unlimited} />
        </div>
      </div>
      <ExpiryDatePicker />
      <p className="text-xs text-muted-foreground">{t.admin.candidateCouponsHint}</p>
      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        {t.admin.createCode}
      </Button>
    </form>
  );
}
