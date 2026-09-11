"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Settings, LogOut, TicketPercent } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingCart },
    { name: "المنتجات", href: "/admin/products", icon: ShoppingBag },
    { name: "أكواد الخصم", href: "/admin/discount-codes", icon: TicketPercent },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="fixed right-0 top-0 w-64 h-screen bg-card border-l border-gold/25 flex flex-col z-50">
      <div className="p-6 pb-2 border-b border-gold/20">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="أثر" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">لوحة الإدارة</h2>
            <p className="text-xs text-muted-foreground">أثر | Ather</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">القائمة الرئيسية</p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gold/15 text-gold-deep font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
