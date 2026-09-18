"use client";

import { useRouter } from "next/navigation";
import { createCandidate } from "@/app/actions/candidates";
import { CandidateForm } from "../CandidateForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/components/TranslationProvider";

export default function NewCandidatePage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <h1 className="text-3xl font-bold">{t.admin.addCandidate}</h1>
        <Link href="/admin/candidates">
          <Button variant="outline">
            {t.admin.back} <ArrowLeft className="w-4 h-4 ms-2 rtl:rotate-0 ltr:rotate-180" />
          </Button>
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
