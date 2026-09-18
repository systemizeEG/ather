"use client";

import { X } from "lucide-react";
import { useTranslation } from "@/components/TranslationProvider";

export function AdminModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-truffle/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t.admin.closeMenu}
      />
      <div className="relative w-full max-w-lg bg-pearl border border-gold/25 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-pearl/95 backdrop-blur flex items-center justify-between px-6 py-4 border-b border-gold/20 z-10">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gold/15 flex items-center justify-center"
            aria-label={t.admin.closeMenu}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
