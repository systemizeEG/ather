import { getMyCandidateOrders } from "@/app/actions/candidates";
import { dateLocale, formatMoneyAmount, getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";

export default async function CandidateOrdersPage() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const dateFmt = dateLocale(locale);
  const orders = await getMyCandidateOrders();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t.candidateDash.ordersTitle}</h1>
        <p className="text-muted-foreground">{t.candidateDash.ordersDesc}</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-muted/40 text-sm text-muted-foreground">
              <tr>
                <th className="px-6 py-4">{t.admin.orderId}</th>
                <th className="px-6 py-4">{t.admin.date}</th>
                <th className="px-6 py-4">{t.admin.total}</th>
                <th className="px-6 py-4">{t.admin.discount}</th>
                <th className="px-6 py-4">{t.admin.statusLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-mono font-bold">{order.orderId}</td>
                  <td className="px-6 py-4">{order.createdAt.toLocaleDateString(dateFmt)}</td>
                  <td className="px-6 py-4 font-bold">{formatMoneyAmount(order.total, locale)}</td>
                  <td className="px-6 py-4">{formatMoneyAmount(order.discountAmount || 0, locale)}</td>
                  <td className="px-6 py-4">{t.status[order.status as keyof typeof t.status] ?? order.status}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {t.admin.noOrders}
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
