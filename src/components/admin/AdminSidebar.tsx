"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Settings,
  LogOut,
  TicketPercent,
  Tags,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const groups = [
  {
    label: "نظرة عامة",
    items: [{ name: "الرئيسية", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "المتجر",
    items: [
      { name: "المنتجات", href: "/admin/products", icon: ShoppingBag },
      { name: "الأقسام", href: "/admin/categories", icon: Tags },
    ],
  },
  {
    label: "المبيعات",
    items: [
      { name: "الطلبات", href: "/admin/orders", icon: ShoppingCart },
      { name: "أكواد الخصم", href: "/admin/discount-codes", icon: TicketPercent },
      { name: "المرشحون", href: "/admin/candidates", icon: Users },
    ],
  },
  {
    label: "النظام",
    items: [{ name: "الإعدادات", href: "/admin/settings", icon: Settings }],
  },
];

export function AdminSidebar({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="h-full w-72 bg-card border-l border-gold/20 flex flex-col overflow-hidden">
      <div className="px-5 pt-6 pb-4 border-b border-gold/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="أثر" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="font-display font-bold leading-tight">أثر</h2>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground tracking-wide">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? "bg-gold/15 text-gold-deep font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          خروج
        </button>
      </div>
    </aside>
  );
}
