"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/TranslationProvider";

export function LanguageSwitcher() {
  const { locale, t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="hidden sm:inline text-[11px] tracking-[0.18em] uppercase text-truffle/70 hover:text-gold-deep px-2 min-h-11 cursor-pointer"
      suppressHydrationWarning
    >
      {locale === "ar" ? t.navbar.english : t.navbar.arabic}
    </button>
  );
}
