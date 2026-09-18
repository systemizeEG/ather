"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoldRule, TreasureFrame } from "@/components/ui/Treasure";
import { useTranslation } from "@/components/TranslationProvider";

export interface SearchOverlayProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
}

export function SearchOverlay({
  query,
  onQueryChange,
  onSubmit,
  onClose,
}: SearchOverlayProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const shortcuts = [
    { href: "/store", label: t.navbar.store },
    { href: "/category/jewelry", label: t.navbar.searchJewelry },
    { href: "/category/bags", label: t.navbar.searchBags },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-16 sm:py-20 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ather-search-title"
    >
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-velvet/90 backdrop-blur-md"
        onClick={onClose}
        aria-label={t.navbar.searchClose}
      />

      <motion.div
        initial={{ y: 18, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 12, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="relative w-full max-w-xl my-auto"
      >
        <TreasureFrame className="bg-card">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 end-0 z-20 p-1 text-truffle/55 hover:text-truffle transition-colors"
            aria-label={t.navbar.searchClose}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            <img src="/logo.png" alt="أثر | Ather" className="h-10 w-auto object-contain mb-4" />
            <GoldRule className="mb-4" />
            <h2 id="ather-search-title" className="font-display text-2xl sm:text-3xl text-truffle">
              {t.navbar.searchTitle}
            </h2>
          </div>

          <form onSubmit={onSubmit} className="relative">
            <label htmlFor="ather-search-input" className="sr-only">
              {t.navbar.search}
            </label>
            <div className="velvet-well relative rounded-2xl border border-gold/35 overflow-hidden">
              <Search className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
              <input
                id="ather-search-input"
                autoFocus
                type="search"
                name="q"
                autoComplete="off"
                enterKeyHint="search"
                placeholder={t.navbar.searchPlaceholder}
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                className="w-full h-14 bg-transparent ps-11 pe-4 text-base sm:text-lg outline-none text-pearl placeholder:text-pearl/45"
              />
            </div>
            <Button type="submit" variant="glow" size="lg" className="w-full mt-4 h-12">
              {t.navbar.search}
            </Button>
            <p className="mt-3 text-xs tracking-[0.12em] text-muted-foreground">
              {t.navbar.searchHint}
            </p>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="px-4 py-2 rounded-full text-[11px] tracking-[0.18em] uppercase border border-gold/40 text-truffle/80 hover:border-gold hover:text-gold-deep transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </TreasureFrame>
      </motion.div>
    </motion.div>
  );
}
