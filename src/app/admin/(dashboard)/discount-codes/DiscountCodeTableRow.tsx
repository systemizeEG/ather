"use client";

import { deleteDiscountCode, toggleDiscountCode } from "@/app/actions/admin";

interface DiscountCode {
  id: string;
  code: string;
  percentage: number;
  isActive: boolean;
  usedCount: number;
  maxUses: number | null;
}

export function DiscountCodeTableRow({ code }: { code: DiscountCode }) {
  return (
    <tr key={code.id} className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4 font-bold text-foreground">
        <code className="bg-muted px-2 py-1 rounded text-accent">{code.code}</code>
      </td>
      <td className="px-6 py-4">
        <span className="text-accent font-bold text-lg">{code.percentage}%</span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-4 ${
          code.isActive 
            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {code.isActive ? 'مفعل' : 'معطل'}
        </span>
      </td>
      <td className="px-6 py-4 text-muted-foreground text-sm font-medium">
        <span className="text-foreground">{code.usedCount}</span>
        {code.maxUses ? (
          <> <span className="text-muted-foreground/50">/</span> {code.maxUses}</>
        ) : (
          <span className="text-muted-foreground/30 mr-1 text-xs">∞</span>
        )}
      </td>
      <td className="px-6 py-4 text-left space-x-reverse space-x-3">
        <button 
          onClick={() => toggleDiscountCode(code.id, !code.isActive)}
          className={`text-sm font-bold transition-colors ${
            code.isActive 
              ? "text-orange-500 hover:text-orange-600" 
              : "text-blue-500 hover:text-blue-600"
          }`}
        >
          {code.isActive ? 'تعطيل' : 'تفعيل'}
        </button>
        <button 
          onClick={async () => {
             if(confirm('هل أنت متأكد من حذف هذا الكود؟')) {
                 await deleteDiscountCode(code.id);
             }
          }}
          className="text-red-500 hover:text-red-600 text-sm font-bold transition-colors"
        >
          حذف
        </button>
      </td>
    </tr>
  );
}
