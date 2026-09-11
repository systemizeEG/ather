"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionaries, Locale, getTranslation } from "@/lib/dictionaries";

type TranslationContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof dictionaries.ar;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t: getTranslation(locale) }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
