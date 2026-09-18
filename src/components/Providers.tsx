"use client";

import { SessionProvider } from "next-auth/react";
import { TranslationProvider } from "@/components/TranslationProvider";
import type { Locale } from "@/lib/dictionaries";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <SessionProvider>
      <TranslationProvider initialLocale={locale}>{children}</TranslationProvider>
    </SessionProvider>
  );
}
