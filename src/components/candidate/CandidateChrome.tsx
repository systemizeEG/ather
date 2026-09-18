"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/components/TranslationProvider";

export function CandidateChrome({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, locale } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="hidden lg:block w-64 shrink-0 relative">
        <CandidateSidebar name={name} />
      </div>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-truffle/40"
            onClick={() => setMenuOpen(false)}
            aria-label={t.admin.closeMenu}
          />
          <div className="absolute start-0 top-0 h-full shadow-2xl">
            <CandidateSidebar
              name={name}
              onNavigate={() => setMenuOpen(false)}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 pb-12">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-4 gap-3 lg:hidden sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label={t.admin.openMenu}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg flex-1">{t.candidateDash.title}</h2>
          <LanguageSwitcher />
        </header>
        <div className="p-6 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
