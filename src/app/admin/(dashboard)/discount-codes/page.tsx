import { prisma } from "@/lib/prisma";
import { AddDiscountForm } from "./AddDiscountForm";
import { DiscountCodeTableRow } from "./DiscountCodeTableRow";

export default async function DiscountCodesPage() {
  const discountCodes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-2 md:p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">أكواد الخصم</h1>
          <p className="text-muted-foreground mt-1">قم بإدارة أكواد الخصم الخاصة بمتجرك وتتبع استخدامها.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Code Form */}
        <div className="lg:col-span-1 sticky top-24">
          <AddDiscountForm />
        </div>

        {/* List of Codes */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-right border-collapse min-w-[600px]">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الكود</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الخصم</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الاستخدام</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-left">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {discountCodes.map((code) => (
                    <DiscountCodeTableRow key={code.id} code={code} />
                  ))}
                  {discountCodes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        لا يوجد أكواد خصم حالياً. قم بإنشاء أول كود!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
