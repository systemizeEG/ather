import { prisma } from "@/lib/prisma";
import { DollarSign, ShoppingCart, ShoppingBag, Clock, Plus, Tags, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getCandidatePerformance } from "@/lib/candidate-performance";
import { dateLocale, formatMoneyAmount, formatTargetValue, getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";

export default async function AdminDashboardPage() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const dateFmt = dateLocale(locale);

  const [
    totalOrders,
    totalRevenueResult,
    totalProducts,
    pendingCount,
    pendingOrders,
    categoryCount,
    candidates,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "COMPLETED" },
    }),
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.order.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.category.count(),
    prisma.candidateProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const totalRevenue = totalRevenueResult._sum.total || 0;
  const targetRows = await Promise.all(
    candidates.map(async (candidate) => ({
      candidate,
      performance: await getCandidatePerformance(candidate.id),
    }))
  );

  const stats = [
    { title: t.admin.pendingReview, value: pendingCount, href: "/admin/orders", icon: Clock, tone: "text-orange-600 bg-orange-500/10" },
    { title: t.admin.completedSales, value: formatMoneyAmount(totalRevenue, locale), href: "/admin/orders", icon: DollarSign, tone: "text-green-600 bg-green-500/10" },
    { title: t.admin.allOrders, value: totalOrders, href: "/admin/orders", icon: ShoppingCart, tone: "text-blue-600 bg-blue-500/10" },
    { title: t.admin.productsCount, value: totalProducts, href: "/admin/products", icon: ShoppingBag, tone: "text-gold-deep bg-gold/15" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <AdminPageHeader
        title={t.admin.welcome}
        description={t.admin.welcomeDesc}
        actions={
          <>
            <Link href="/admin/candidates">
              <Button variant="outline">
                <Users className="w-4 h-4 ms-0 me-1.5" /> {t.admin.viewCandidates}
              </Button>
            </Link>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="w-4 h-4 ms-0 me-1.5" /> {t.admin.newProduct}
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline">
                <Tags className="w-4 h-4 ms-0 me-1.5" /> {t.admin.categoriesCta}
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-card border border-gold/20 rounded-2xl p-4 sm:p-5 hover:border-gold/50 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.tone}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">{stat.title}</div>
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
          </Link>
        ))}
      </div>

      <AdminPanel>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">{t.admin.targetsTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.admin.targetsDesc}</p>
          </div>
          <Link href="/admin/candidates" className="text-sm font-medium text-gold-deep inline-flex items-center gap-1 shrink-0">
            {t.admin.viewAll} <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>

        {targetRows.length > 0 ? (
          <div className="divide-y divide-border">
            {targetRows.map(({ candidate, performance }) => (
              <Link
                key={candidate.id}
                href={`/admin/candidates/${candidate.id}`}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate">{candidate.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {performance?.couponCode ?? "—"} · {t.admin.colTarget}{" "}
                    {formatTargetValue(performance?.targetValue ?? candidate.targetValue, performance?.targetType ?? candidate.targetType, locale)}
                  </div>
                  <div className="mt-2 max-w-xs">
                    <ProgressBar value={performance?.progressPercentage ?? 0} />
                  </div>
                </div>
                <div className="text-end shrink-0">
                  <div className="font-bold text-gold-deep">{performance?.progressPercentage ?? 0}%</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTargetValue(performance?.achievedValue ?? 0, performance?.targetType ?? candidate.targetType, locale)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-muted-foreground">
            <p className="mb-4">{t.admin.noTargets}</p>
            <Link href="/admin/candidates/new">
              <Button variant="outline">{t.admin.addCandidate}</Button>
            </Link>
          </div>
        )}
      </AdminPanel>

      <AdminPanel>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold">{t.admin.pendingOrdersTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {pendingCount} {t.admin.pendingOrdersDesc}
            </p>
          </div>
          <Link href="/admin/orders" className="text-sm font-medium text-gold-deep inline-flex items-center gap-1">
            {t.admin.viewAll} <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>

        {pendingOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {pendingOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-bold truncate">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.orderId} · {new Date(order.createdAt).toLocaleDateString(dateFmt)}
                  </div>
                </div>
                <div className="text-end shrink-0">
                  <div className="font-bold">{formatMoneyAmount(order.total, locale)}</div>
                  <div className="text-xs text-orange-600 font-medium">{t.admin.review}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-muted-foreground">{t.admin.noPending}</div>
        )}
      </AdminPanel>

      <p className="text-sm text-muted-foreground text-center">
        {t.admin.categoryCount.replace("{count}", String(categoryCount))}
      </p>
    </div>
  );
}
