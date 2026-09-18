"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, LogOut, X, Globe } from "lucide-react";
import { signOut } from "next-auth/react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/components/TranslationProvider";
import { brandWord } from "@/lib/catalog-i18n";

export function CandidateSidebar({
  name,
  onNavigate,
  onClose,
}: {
  name: string;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const navItems = [
    { name: t.candidateDash.overview, href: "/candidate", icon: LayoutDashboard },
    { name: t.candidateDash.orders, href: "/candidate/orders", icon: ShoppingCart },
  ];

  return (
    <aside className="fixed inset-y-0 start-0 w-64 h-screen bg-card border-e border-gold/25 flex flex-col z-50">
      <div className="p-6 pb-2 border-b border-gold/20">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt={brandWord(locale)} className="w-10 h-10 object-contain" />
            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg leading-tight">{t.candidateDash.title}</h2>
              <p className="text-xs text-muted-foreground truncate">{name}</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center shrink-0"
              aria-label={t.admin.closeMenu}
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
                onClick={onNavigate}
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
      <div className="p-4 border-t border-border mt-auto space-y-2">
        <div>
          <p className="px-2 mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground tracking-wide">
            <Globe className="w-3.5 h-3.5" />
            {t.admin.language}
          </p>
          <LanguageSwitcher variant="segmented" />
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/candidate/login" })}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          {t.candidateDash.logout}
        </button>
      </div>
    </aside>
  );
}
