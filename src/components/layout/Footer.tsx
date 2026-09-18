"use client";

import Link from "next/link";
import { useTranslation } from "@/components/TranslationProvider";
import { brandWord } from "@/lib/catalog-i18n";

export function Footer() {
  const { t, locale } = useTranslation();

  return (
    <footer className="bg-velvet text-pearl">
      <div className="px-6 md:px-10 py-16 grid md:grid-cols-3 gap-10 items-start border-t border-gold/20">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt={brandWord(locale)} className="h-14 w-auto object-contain" />
          <span className="font-display text-2xl">{brandWord(locale)}</span>
        </Link>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.2em] uppercase text-pearl/70">
          <Link href="/store" className="hover:text-gold">{t.footer.vault}</Link>
          <Link href="/track-order" className="hover:text-gold">{t.footer.track}</Link>
          <Link href="/faq" className="hover:text-gold">{t.footer.faq}</Link>
          <Link href="/contact" className="hover:text-gold">{t.footer.contact}</Link>
        </nav>
        <p className="text-sm text-pearl/60 md:text-end leading-relaxed">
          {t.footer.tagline}
          <br />
          © {new Date().getFullYear()} Ather · InstaPay
        </p>
      </div>
    </footer>
  );
}
