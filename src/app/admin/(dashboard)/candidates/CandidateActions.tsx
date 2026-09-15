"use client";

import Link from "next/link";
import { toggleCandidate } from "@/app/actions/candidates";

export function CandidateActions({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Link href={`/admin/candidates/${id}`} className="text-sm font-bold text-accent">
        عرض
      </Link>
      <Link href={`/admin/candidates/${id}/edit`} className="text-sm font-bold text-foreground">
        تعديل
      </Link>
      <button
        className="text-sm font-bold text-orange-500"
        onClick={() => toggleCandidate(id, !isActive)}
      >
        {isActive ? "تعطيل" : "تفعيل"}
      </button>
    </div>
  );
}
