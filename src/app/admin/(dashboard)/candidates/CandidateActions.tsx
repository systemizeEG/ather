"use client";

import Link from "next/link";
import { toggleCandidate } from "@/app/actions/candidates";
import { useTranslation } from "@/components/TranslationProvider";

export function CandidateActions({ id, isActive }: { id: string; isActive: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <Link href={`/admin/candidates/${id}`} className="text-sm font-bold text-accent">
        {t.admin.view}
      </Link>
      <Link href={`/admin/candidates/${id}/edit`} className="text-sm font-bold text-foreground">
        {t.admin.edit}
      </Link>
      <button
        type="button"
        className="text-sm font-bold text-orange-500 cursor-pointer"
        onClick={() => toggleCandidate(id, !isActive)}
      >
        {isActive ? t.admin.disable : t.admin.enable}
      </button>
    </div>
  );
}
