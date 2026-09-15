import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditCandidateForm } from "./EditCandidateForm";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id },
    include: { user: true, coupon: true },
  });
  if (!candidate) notFound();
  return <EditCandidateForm candidate={candidate} />;
}
