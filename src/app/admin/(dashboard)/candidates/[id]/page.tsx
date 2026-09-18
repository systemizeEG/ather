import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { getCandidatePerformance } from "@/lib/candidate-performance";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { dateLocale, formatMoneyAmount, formatTargetValue, getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";

export default async function CandidateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const dateFmt = dateLocale(locale);

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

  const targetType = performance?.targetType ?? candidate.targetType;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{candidate.user.name}</h1>
          <p className="text-muted-foreground">{candidate.user.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/candidates/${candidate.id}/edit`}>
            <Button>{t.admin.edit}</Button>
          </Link>
          <Link href="/admin/candidates">
            <Button variant="outline">
              {t.admin.back} <ArrowLeft className="w-4 h-4 ms-2 rtl:rotate-0 ltr:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">{t.admin.colCoupon}</div>
          <div className="text-2xl font-bold">{candidate.coupon.code}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">{t.admin.colAchieved}</div>
          <div className="text-2xl font-bold">
            {formatTargetValue(performance?.achievedValue ?? 0, targetType, locale)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">{t.admin.remaining}</div>
          <div className="text-2xl font-bold">
            {formatTargetValue(performance?.remainingValue ?? 0, targetType, locale)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">{t.admin.qualifyingRevenue}</div>
          <div className="text-2xl font-bold">{formatMoneyAmount(performance?.generatedRevenue ?? 0, locale)}</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <div className="flex justify-between">
          <span className="font-bold">{t.admin.progress}</span>
          <span>{performance?.progressPercentage ?? 0}%</span>
        </div>
        <ProgressBar value={performance?.progressPercentage ?? 0} />
        <p className="text-sm text-muted-foreground">
          {t.admin.from} {performance?.startDate.toLocaleDateString(dateFmt)}
          {performance?.endDate
            ? ` ${t.admin.until} ${performance.endDate.toLocaleDateString(dateFmt)}`
            : ` ${t.admin.noEndDate}`}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-bold">{t.admin.couponOrders}</div>
        <table className="w-full text-start">
          <thead className="bg-muted/40 text-sm text-muted-foreground">
            <tr>
              <th className="px-6 py-3">{t.admin.orderId}</th>
              <th className="px-6 py-3">{t.admin.date}</th>
              <th className="px-6 py-3">{t.admin.customer}</th>
              <th className="px-6 py-3">{t.admin.total}</th>
              <th className="px-6 py-3">{t.admin.discount}</th>
              <th className="px-6 py-3">{t.admin.statusLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-3 font-mono">
                  <Link href={`/admin/orders/${order.id}`} className="hover:text-accent">{order.orderId}</Link>
                </td>
                <td className="px-6 py-3">{order.createdAt.toLocaleDateString(dateFmt)}</td>
                <td className="px-6 py-3">{order.customerName}</td>
                <td className="px-6 py-3">{formatMoneyAmount(order.total, locale)}</td>
                <td className="px-6 py-3">{formatMoneyAmount(order.discountAmount || 0, locale)}</td>
                <td className="px-6 py-3">
                  {t.status[order.status as keyof typeof t.status] ?? order.status}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">{t.admin.noOrders}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
