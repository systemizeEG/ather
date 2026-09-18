"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, getTranslation, type Locale } from "@/lib/dictionaries";

type TranslationContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof dictionaries.ar;
};

function bundle(locale: Locale): TranslationContextType {
  return {
    locale,
    setLocale: () => {},
    t: getTranslation(locale),
  };
}

const TranslationContext = createContext<TranslationContextType>(bundle("ar"));

export function TranslationProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t: getTranslation(locale) }),
    [locale]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  return useContext(TranslationContext);
}
