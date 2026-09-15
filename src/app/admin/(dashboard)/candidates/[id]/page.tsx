import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { getCandidatePerformance } from "@/lib/candidate-performance";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function CandidateDetailsPage({
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

  const performance = await getCandidatePerformance(candidate.id);
  const orders = await prisma.order.findMany({
    where: { discountCode: { equals: candidate.coupon.code, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderId: true,
      createdAt: true,
      total: true,
      discountAmount: true,
      status: true,
      customerName: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{candidate.user.name}</h1>
          <p className="text-muted-foreground">{candidate.user.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/candidates/${candidate.id}/edit`}>
            <Button>تعديل</Button>
          </Link>
          <Link href="/admin/candidates">
            <Button variant="outline">العودة <ArrowLeft className="w-4 h-4 ml-2" /></Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">الكوبون</div>
          <div className="text-2xl font-bold">{candidate.coupon.code}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">المحقق</div>
          <div className="text-2xl font-bold">
            {performance?.targetType === "REVENUE"
              ? `${performance.achievedValue} ج.م`
              : `${performance?.achievedValue ?? 0} طلب`}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">المتبقي</div>
          <div className="text-2xl font-bold">{performance?.remainingValue ?? 0}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">الإيرادات المؤهلة</div>
          <div className="text-2xl font-bold">{performance?.generatedRevenue ?? 0} ج.م</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <div className="flex justify-between">
          <span className="font-bold">التقدم</span>
          <span>{performance?.progressPercentage ?? 0}%</span>
        </div>
        <ProgressBar value={performance?.progressPercentage ?? 0} />
        <p className="text-sm text-muted-foreground">
          من {performance?.startDate.toLocaleDateString("ar-EG")}
          {performance?.endDate ? ` حتى ${performance.endDate.toLocaleDateString("ar-EG")}` : " بدون تاريخ نهاية"}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-bold">الطلبات عبر الكوبون</div>
        <table className="w-full text-right">
          <thead className="bg-muted/40 text-sm text-muted-foreground">
            <tr>
              <th className="px-6 py-3">رقم الطلب</th>
              <th className="px-6 py-3">التاريخ</th>
              <th className="px-6 py-3">العميل</th>
              <th className="px-6 py-3">الإجمالي</th>
              <th className="px-6 py-3">الخصم</th>
              <th className="px-6 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-3 font-mono">
                  <Link href={`/admin/orders/${order.id}`} className="hover:text-accent">{order.orderId}</Link>
                </td>
                <td className="px-6 py-3">{order.createdAt.toLocaleDateString("ar-EG")}</td>
                <td className="px-6 py-3">{order.customerName}</td>
                <td className="px-6 py-3">{order.total} ج.م</td>
                <td className="px-6 py-3">{order.discountAmount || 0} ج.م</td>
                <td className="px-6 py-3">{order.status}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">لا توجد طلبات بعد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
