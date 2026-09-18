import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { getCandidatePerformance } from "@/lib/candidate-performance";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CandidateActions } from "./CandidateActions";
import { formatMoneyAmount, formatTargetValue, getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";

export default async function AdminCandidatesPage() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);

  const candidates = await prisma.candidateProfile.findMany({
    include: { user: true, coupon: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = await Promise.all(
    candidates.map(async (candidate) => ({
      candidate,
      performance: await getCandidatePerformance(candidate.id),
    }))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.admin.candidatesTitle}</h1>
          <p className="text-muted-foreground">{t.admin.candidatesDesc}</p>
        </div>
        <Link href="/admin/candidates/new">
          <Button variant="glow" size="lg">
            <Plus className="w-5 h-5 me-2" /> {t.admin.addCandidate}
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start min-w-[900px]">
            <thead className="bg-muted text-muted-foreground text-sm">
              <tr>
                <th className="px-6 py-4">{t.admin.colCandidate}</th>
                <th className="px-6 py-4">{t.admin.colCoupon}</th>
                <th className="px-6 py-4">{t.admin.colTarget}</th>
                <th className="px-6 py-4">{t.admin.colAchieved}</th>
                <th className="px-6 py-4">{t.admin.colProgress}</th>
                <th className="px-6 py-4">{t.admin.colRevenue}</th>
                <th className="px-6 py-4">{t.admin.colStatus}</th>
                <th className="px-6 py-4">{t.admin.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ candidate, performance }) => (
                <tr key={candidate.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="font-bold">{candidate.user.name}</div>
                    <div className="text-xs text-muted-foreground">{candidate.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-muted px-2 py-1 rounded text-accent">{candidate.coupon.code}</code>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatTargetValue(
                      performance?.targetValue ?? candidate.targetValue,
                      performance?.targetType ?? candidate.targetType,
                      locale
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {formatTargetValue(performance?.achievedValue ?? 0, performance?.targetType ?? candidate.targetType, locale)}
                  </td>
                  <td className="px-6 py-4 min-w-[160px]">
                    <div className="text-sm font-bold mb-1">{performance?.progressPercentage ?? 0}%</div>
                    <ProgressBar value={performance?.progressPercentage ?? 0} />
                  </td>
                  <td className="px-6 py-4 font-bold">{formatMoneyAmount(performance?.generatedRevenue ?? 0, locale)}</td>
                  <td className="px-6 py-4">
                    <span className={candidate.isActive ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                      {candidate.isActive ? t.admin.active : t.admin.inactive}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <CandidateActions id={candidate.id} isActive={candidate.isActive} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    {t.admin.noCandidates}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
