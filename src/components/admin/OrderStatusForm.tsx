"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateOrderStatus } from "@/app/actions/admin";
import { CheckCircle2, RotateCw } from "lucide-react";

export function OrderStatusForm({ order }: { order: any }) {
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
        alert("فشل التحديث");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">تحديث حالة الطلب</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="PENDING_REVIEW">مراجعة الدفع (Pending)</option>
            <option value="PROCESSING">قيد التجهيز (Processing)</option>
            <option value="COMPLETED">مكتمل ومسلم (Completed)</option>
            <option value="CANCELLED">ملغي أو مرفوض (Cancelled)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">ملاحظة للعميل (تظهر في التتبع)</label>
          <input 
            type="text"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="مثال: تم التأكد من الدفع، جاري إرسال البيانات..."
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
            <><RotateCw className="w-5 h-5 ml-2 animate-spin" /> جاري الحفظ...</>
          ) : isSuccess ? (
            <><CheckCircle2 className="w-5 h-5 ml-2" /> تم الحفظ</>
          ) : (
            "حفظ التغييرات"
          )}
        </Button>
      </div>
    </form>
  );
}
