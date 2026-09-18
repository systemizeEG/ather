"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Globe,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/components/TranslationProvider";
import { brandWord } from "@/lib/catalog-i18n";
import { adminSignOut } from "@/app/actions/admin-auth";

export function AdminSidebar({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useTranslation();

  const groups = [
    {
      label: t.admin.groupOverview,
      items: [{ name: t.admin.navHome, href: "/admin/dashboard", icon: LayoutDashboard }],
    },
    {
      label: t.admin.groupStore,
      items: [
        { name: t.admin.navProducts, href: "/admin/products", icon: ShoppingBag },
        { name: t.admin.navCategories, href: "/admin/categories", icon: Tags },
      ],
    },
    {
      label: t.admin.groupSales,
      items: [
        { name: t.admin.navOrders, href: "/admin/orders", icon: ShoppingCart },
        { name: t.admin.navDiscounts, href: "/admin/discount-codes", icon: TicketPercent },
        { name: t.admin.navCandidates, href: "/admin/candidates", icon: Users },
      ],
    },
    {
      label: t.admin.groupSystem,
      items: [{ name: t.admin.navSettings, href: "/admin/settings", icon: Settings }],
    },
  ];

  const handleLogout = async () => {
    await adminSignOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <aside className="h-full w-72 bg-card border-e border-gold/20 flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-gold/15 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt={brandWord(locale)} className="w-9 h-9 object-contain" />
          <div>
            <h2 className="font-display font-bold leading-tight">{brandWord(locale)}</h2>
            <p className="text-xs text-muted-foreground">{t.admin.panel}</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label={t.admin.closeMenu}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 min-h-0 py-3 px-3 space-y-3 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[11px] font-semibold text-muted-foreground tracking-wide">
              {group.label}
            </p>
            <div className="space-y-0.5">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                      isActive
                        ? "bg-gold/15 text-gold-deep font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                    }`}
                  >
                    <item.icon className="w-4.5 h-4.5 w-[18px] h-[18px] shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-2 shrink-0 bg-card">
        <div className="px-1">
          <p className="px-2 mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground tracking-wide">
            <Globe className="w-3.5 h-3.5" />
            {t.admin.language}
          </p>
          <LanguageSwitcher variant="segmented" />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          {t.admin.logout}
        </button>
      </div>
    </aside>
  );
}
