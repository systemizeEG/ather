"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Locale } from "@/lib/dictionaries";

type HeroCopy = {
  badge: string;
  title1: string;
  highlight: string;
  title2: string;
  description: string;
  browse: string;
  how: string;
};

export function HeroSection({ locale, copy }: { locale: Locale; copy: HeroCopy }) {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 velvet-well" />

      <div
        aria-hidden
        className="absolute -left-1/4 top-[-20%] h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(201,166,107,0.28),transparent_62%)] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-[20%] bottom-[-25%] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(142,167,193,0.18),transparent_64%)] blur-3xl"
      />
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden>
        <div className="h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(201,166,107,0.38),transparent_70%)]" />
      </div>

      <div className="hero-grid-static absolute inset-0 opacity-[0.14]" aria-hidden />

      <div className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <img
          src="/logo.png"
          alt=""
          className="h-[56vh] w-auto max-w-none object-contain opacity-[0.08]"
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pt-32 pb-28 text-center">
        <div className="relative mx-auto mb-6 h-52 w-52 md:h-64 md:w-64">
          <img
            src="/logo.png"
            alt={locale === "en" ? "Athar" : "أثر"}
            className="relative z-10 h-full w-full object-contain drop-shadow-[0_16px_48px_rgba(201,166,107,0.45)]"
          />
        </div>

        <p className="text-gold tracking-[0.45em] text-[11px] uppercase mb-5">{copy.badge}</p>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-pearl leading-[1.15] mb-6">
          {copy.title1 ? <>{copy.title1} </> : null}
          {copy.highlight ? <span className="gold-text">{copy.highlight}</span> : null}
          {copy.title2 ? (
            <>
              <br />
              {copy.title2}
            </>
          ) : null}
        </h1>

        <p className="text-pearl/75 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10">
          {copy.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="#categories">
            <Button size="lg" variant="glow" className="h-14 px-10 text-base">
              {copy.browse}
              <ArrowLeft className={`mr-2 w-5 h-5 ${locale === "en" ? "rotate-180" : ""}`} />
            </Button>
          </Link>
          <Link href="/faq">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 text-base border-gold/50 text-pearl hover:bg-gold hover:text-truffle"
            >
              {copy.how}
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <a
          href="#lookbook"
          className="flex flex-col items-center gap-2 text-gold/70 hover:text-gold transition-colors"
          aria-label={locale === "en" ? "Scroll to treasures" : "انتقل إلى الكنوز"}
        >
          <span className="h-10 w-px bg-gradient-to-b from-transparent via-gold to-transparent" />
          <ChevronDown className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
