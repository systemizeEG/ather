"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { updateCandidate } from "@/app/actions/candidates";
import { CandidateForm } from "../../CandidateForm";

export function EditCandidateForm({ candidate }: { candidate: {
  id: string;
  user: { name: string; email: string; phone: string | null };
  coupon: { code: string; percentage: number; maxUses: number | null; expiryDate: Date | null };
  targetType: string;
  targetValue: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
} }) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <h1 className="text-3xl font-bold">تعديل المرشح</h1>
        <Link href={`/admin/candidates/${candidate.id}`}>
          <Button variant="outline">العودة <ArrowLeft className="w-4 h-4 ml-2" /></Button>
        </Link>
      </div>
      <CandidateForm
        candidate={candidate}
        action={async (formData) => {
          const result = await updateCandidate(candidate.id, formData);
          if (result.success) router.push(`/admin/candidates/${candidate.id}`);
          return result;
        }}
      />
    </div>
  );
}
