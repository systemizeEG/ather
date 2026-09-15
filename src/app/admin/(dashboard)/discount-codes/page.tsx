import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getCandidatePerformance } from "@/lib/candidate-performance";
import { DiscountCodeManager } from "./DiscountCodeManager";

export default async function DiscountCodesPage() {
  const discountCodes = await prisma.discountCode.findMany({
    include: {
      candidateProfile: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();
  const codes = await Promise.all(
    discountCodes.map(async (code) => {
      const performance = code.candidateProfile
        ? await getCandidatePerformance(code.candidateProfile.id)
        : null;
      const expired = Boolean(code.expiryDate && code.expiryDate.getTime() < now);
      const exhausted = code.maxUses != null && code.usedCount >= code.maxUses;
      const expiryLabel = code.expiryDate
        ? code.expiryDate.toISOString().slice(0, 10)
        : null;

      return {
        id: code.id,
        code: code.code,
        percentage: code.percentage,
        isActive: code.isActive,
        usedCount: code.usedCount,
        maxUses: code.maxUses,
        type: code.type,
        expired,
        exhausted,
        expiryLabel,
        candidateName: code.candidateProfile?.user.name ?? null,
        candidateId: code.candidateProfile?.id ?? null,
        targetType: performance?.targetType ?? null,
        targetValue: performance?.targetValue ?? null,
        achievedValue: performance?.achievedValue ?? null,
        progressPercentage: performance?.progressPercentage ?? null,
      };
    })
  );

  return (
    <div className="max-w-5xl mx-auto">
      <AdminPageHeader
        title="أكواد الخصم"
        description="أنشئ كوبونات عامة للمتجر. كوبونات المرشحين تُدار من صفحة المرشحين."
      />
      <DiscountCodeManager codes={codes} />
    </div>
  );
}
