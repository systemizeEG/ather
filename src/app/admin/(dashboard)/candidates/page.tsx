import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { getCandidatePerformance } from "@/lib/candidate-performance";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CandidateActions } from "./CandidateActions";

export default async function AdminCandidatesPage() {
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
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">المرشحون</h1>
          <p className="text-muted-foreground">حسابات المرشحين وكوبوناتهم وأهداف المبيعات.</p>
        </div>
        <Link href="/admin/candidates/new">
          <Button variant="glow" size="lg">
            <Plus className="w-5 h-5 ml-2" /> إضافة مرشح
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]">
            <thead className="bg-muted text-muted-foreground text-sm">
              <tr>
                <th className="px-6 py-4">المرشح</th>
                <th className="px-6 py-4">الكوبون</th>
                <th className="px-6 py-4">الهدف</th>
                <th className="px-6 py-4">المحقق</th>
                <th className="px-6 py-4">التقدم</th>
                <th className="px-6 py-4">الإيرادات</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">إجراءات</th>
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
                    {performance?.targetType === "REVENUE"
                      ? `${performance.targetValue} ج.م`
                      : `${performance?.targetValue ?? candidate.targetValue} طلب`}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {performance?.targetType === "REVENUE"
                      ? `${performance.achievedValue} ج.م`
                      : performance?.achievedValue ?? 0}
                  </td>
                  <td className="px-6 py-4 min-w-[160px]">
                    <div className="text-sm font-bold mb-1">{performance?.progressPercentage ?? 0}%</div>
                    <ProgressBar value={performance?.progressPercentage ?? 0} />
                  </td>
                  <td className="px-6 py-4 font-bold">{performance?.generatedRevenue ?? 0} ج.م</td>
                  <td className="px-6 py-4">
                    <span className={candidate.isActive ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                      {candidate.isActive ? "نشط" : "معطل"}
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
                    لا يوجد مرشحون حتى الآن.
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
