"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/components/TranslationProvider";
import type { Locale } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  inverted?: boolean;
  variant?: "compact" | "full" | "segmented";
};

function persistLocale(next: Locale) {
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = next;
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  window.location.reload();
}

export function LanguageSwitcher({
  className,
  inverted = false,
  variant = "compact",
}: LanguageSwitcherProps) {
  const { locale, t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchTo = (next: Locale) => {
    if (!mounted || next === locale) return;
    persistLocale(next);
  };

  if (variant === "segmented") {
    return (
      <div
        className={cn("grid grid-cols-2 gap-1 rounded-xl border border-gold/25 p-1 bg-pearl/70", className)}
        role="group"
        aria-label={t.admin.language}
      >
        <LocaleOption
          active={locale === "en"}
          disabled={!mounted}
          label="EN"
          onClick={() => switchTo("en")}
        />
        <LocaleOption
          active={locale === "ar"}
          disabled={!mounted}
          label="ع"
          onClick={() => switchTo("ar")}
        />
      </div>
    );
  }

  const label = locale === "ar" ? t.navbar.english : t.navbar.arabic;
  const shortLabel = locale === "ar" ? "EN" : "ع";

  return (
    <button
      type="button"
      onClick={() => switchTo(locale === "ar" ? "en" : "ar")}
      disabled={!mounted}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center min-h-11 px-2.5 rounded-full text-[11px] font-medium tracking-[0.16em] uppercase transition-colors duration-200 cursor-pointer touch-manipulation",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        inverted
          ? "text-pearl/80 hover:text-gold hover:bg-pearl/10 focus-visible:ring-offset-transparent"
          : "text-truffle/70 hover:text-gold-deep hover:bg-gold/10 focus-visible:ring-offset-pearl",
        variant === "full" && "w-full justify-between px-4 tracking-[0.12em] text-sm",
        className
      )}
      suppressHydrationWarning
    >
      {variant === "full" ? label : shortLabel}
    </button>
  );
}

function LocaleOption({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "min-h-10 rounded-lg text-sm font-bold tracking-[0.12em] uppercase transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        active ? "bg-gold/20 text-gold-deep" : "text-truffle/70 hover:bg-gold/10"
      )}
    >
      {label}
    </button>
  );
}
