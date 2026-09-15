"use client";

import { useRouter } from "next/navigation";
import { createCandidate } from "@/app/actions/candidates";
import { CandidateForm } from "../CandidateForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function NewCandidatePage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <h1 className="text-3xl font-bold">إضافة مرشح</h1>
        <Link href="/admin/candidates">
          <Button variant="outline">العودة <ArrowLeft className="w-4 h-4 ml-2" /></Button>
        </Link>
      </div>
      <CandidateForm
        action={async (formData) => {
          const result = await createCandidate(formData);
          if (result.success) router.push("/admin/candidates");
          return result;
        }}
      />
    </div>
  );
}
