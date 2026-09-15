"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function CandidateSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const navItems = [
    { name: "لوحة المتابعة", href: "/candidate", icon: LayoutDashboard },
    { name: "الطلبات", href: "/candidate/orders", icon: ShoppingCart },
  ];

  return (
    <aside className="fixed right-0 top-0 w-64 h-screen bg-card border-l border-gold/25 flex flex-col z-50">
      <div className="p-6 pb-2 border-b border-gold/20">
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo.png" alt="أثر" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">لوحة المرشح</h2>
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/candidate" ? pathname === "/candidate" : pathname.startsWith(item.href);
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
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
