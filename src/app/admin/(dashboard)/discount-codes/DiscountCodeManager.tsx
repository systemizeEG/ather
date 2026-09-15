"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteDiscountCode, toggleDiscountCode } from "@/app/actions/admin";
import { AddDiscountForm } from "./AddDiscountForm";
import { Button } from "@/components/ui/Button";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPanel } from "@/components/admin/AdminPageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Plus, Power, Trash2, UserRound } from "lucide-react";

export type DiscountCodeItem = {
  id: string;
  code: string;
  percentage: number;
  isActive: boolean;
  usedCount: number;
  maxUses: number | null;
  type: string;
  expired: boolean;
  exhausted: boolean;
  expiryLabel: string | null;
  candidateName: string | null;
  candidateId: string | null;
  targetType: string | null;
  targetValue: number | null;
  achievedValue: number | null;
  progressPercentage: number | null;
};

function statusLabel(code: DiscountCodeItem) {
  if (code.expired) return { text: "منتهي", className: "bg-red-500/10 text-red-600" };
  if (code.exhausted) return { text: "اكتمل الاستخدام", className: "bg-orange-500/10 text-orange-600" };
  if (code.isActive) return { text: "مفعل", className: "bg-green-500/10 text-green-600" };
  return { text: "معطل", className: "bg-muted text-muted-foreground" };
}

function usageLabel(code: DiscountCodeItem) {
  if (code.maxUses) return `استُخدم ${code.usedCount} من ${code.maxUses}`;
  return `استُخدم ${code.usedCount} مرة`;
}

function targetLabel(code: DiscountCodeItem) {
  if (code.targetType === "REVENUE") {
    return `${code.achievedValue ?? 0} من ${code.targetValue ?? 0} ج.م`;
  }
  return `${code.achievedValue ?? 0} من ${code.targetValue ?? 0} طلبات`;
}

export function DiscountCodeManager({ codes }: { codes: DiscountCodeItem[] }) {
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "GENERAL" | "CANDIDATE">("all");

  const visible = useMemo(
    () => (filter === "all" ? codes : codes.filter((code) => code.type === filter)),
    [codes, filter]
  );

  const chip = (id: typeof filter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(id)}
      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
        filter === id
          ? "bg-gold text-truffle border-gold"
          : "bg-card text-muted-foreground border-gold/25 hover:border-gold/50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {chip("all", `الكل (${codes.length})`)}
          {chip("GENERAL", `عامة (${codes.filter((c) => c.type !== "CANDIDATE").length})`)}
          {chip("CANDIDATE", `مرشحون (${codes.filter((c) => c.type === "CANDIDATE").length})`)}
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 ml-1.5" /> إضافة كود
        </Button>
      </div>

      <AdminPanel>
        {visible.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted-foreground">
            لا توجد أكواد في هذا التبويب.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((code) => {
              const status = statusLabel(code);
              const candidate = code.type === "CANDIDATE";

              return (
                <div key={code.id} className="px-5 py-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="font-bold tracking-wide bg-gold/10 text-gold-deep px-2.5 py-1 rounded-lg">
                          {code.code}
                        </code>
                        <span className="font-bold">{code.percentage}%</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.className}`}>
                          {status.text}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {candidate ? "مرشح" : "عام"}
                        </span>
                      </div>

                      {candidate ? (
                        <p className="text-sm text-muted-foreground">
                          {code.candidateName || "مرشح"}
                          <span className="mx-2 text-border">·</span>
                          {targetLabel(code)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {usageLabel(code)}
                          {code.expiryLabel && (
                            <>
                              <span className="mx-2 text-border">·</span>
                              {code.expired ? "انتهى" : "ينتهي"} {code.expiryLabel}
                            </>
                          )}
                        </p>
                      )}

                      {candidate && (
                        <div className="max-w-xs pt-1">
                          <ProgressBar value={code.progressPercentage ?? 0} />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {code.candidateId && (
                        <Link
                          href={`/admin/candidates/${code.candidateId}`}
                          className="inline-flex items-center justify-center h-9 rounded-full px-3 text-sm font-medium border border-gold/70 hover:bg-gold/15"
                        >
                          <UserRound className="w-4 h-4 ml-1" /> الملف
                        </Link>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleDiscountCode(code.id, !code.isActive)}
                      >
                        <Power className="w-4 h-4 ml-1" />
                        {code.isActive ? "تعطيل" : "تفعيل"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10"
                        onClick={async () => {
                          if (!confirm("حذف هذا الكود؟")) return;
                          const result = await deleteDiscountCode(code.id);
                          if (result.error) alert(result.error);
                        }}
                      >
                        <Trash2 className="w-4 h-4 ml-1" /> حذف
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminPanel>

      <AdminModal open={creating} title="إضافة كود خصم" onClose={() => setCreating(false)}>
        <AddDiscountForm onDone={() => setCreating(false)} />
      </AdminModal>
    </div>
  );
}
