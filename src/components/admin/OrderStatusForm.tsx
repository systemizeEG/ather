"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateOrderStatus } from "@/app/actions/admin";
import { CheckCircle2, RotateCw } from "lucide-react";
import { useTranslation } from "@/components/TranslationProvider";

export function OrderStatusForm({ order }: { order: any }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(order.status);
  const [adminNote, setAdminNote] = useState(order.adminNote || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSuccess(false);

    try {
      const res = await updateOrderStatus(order.id, status, adminNote);
      if (res.success) {
        setIsSuccess(true);
        router.refresh();
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        alert(t.admin.saveFailed);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t.admin.updateStatus}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="PENDING_REVIEW">{t.admin.statusPendingOption}</option>
            <option value="PROCESSING">{t.admin.statusProcessingOption}</option>
            <option value="COMPLETED">{t.admin.statusCompletedOption}</option>
            <option value="CANCELLED">{t.admin.statusCancelledOption}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t.admin.customerNote}</label>
          <input
            type="text"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder={t.admin.customerNotePlaceholder}
            className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          size="lg"
          variant={isSuccess ? "outline" : "glow"}
          className={`min-w-[150px] ${isSuccess ? "text-green-500 border-green-500 hover:bg-green-500/10" : ""}`}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RotateCw className="w-5 h-5 ms-0 me-2 animate-spin" /> {t.admin.saving}
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 ms-0 me-2" /> {t.admin.saved}
            </>
          ) : (
            t.admin.formSave
          )}
        </Button>
      </div>
    </form>
  );
}
