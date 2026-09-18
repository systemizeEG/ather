"use client";

import Link from "next/link";
import { useMemo, useRef, type MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
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

const DUST = [
  { l: 8, t: 18, d: 18, delay: 0, s: 2 },
  { l: 16, t: 72, d: 22, delay: 3, s: 1.5 },
  { l: 24, t: 40, d: 16, delay: 7, s: 2.5 },
  { l: 33, t: 12, d: 24, delay: 1.5, s: 1 },
  { l: 41, t: 88, d: 19, delay: 5, s: 2 },
  { l: 48, t: 28, d: 21, delay: 9, s: 1.5 },
  { l: 57, t: 64, d: 17, delay: 2, s: 2 },
  { l: 66, t: 8, d: 23, delay: 6, s: 1 },
  { l: 73, t: 52, d: 20, delay: 4, s: 2.5 },
  { l: 81, t: 36, d: 15, delay: 8, s: 1.5 },
  { l: 88, t: 78, d: 25, delay: 1, s: 2 },
  { l: 12, t: 55, d: 26, delay: 11, s: 1 },
  { l: 29, t: 91, d: 18, delay: 13, s: 2 },
  { l: 62, t: 22, d: 21, delay: 10, s: 1.5 },
  { l: 91, t: 48, d: 19, delay: 12, s: 2 },
  { l: 5, t: 82, d: 27, delay: 14, s: 1 },
  { l: 38, t: 6, d: 16, delay: 6.5, s: 2 },
  { l: 70, t: 94, d: 22, delay: 3.5, s: 1.5 },
  { l: 84, t: 14, d: 18, delay: 15, s: 2 },
  { l: 51, t: 46, d: 24, delay: 8.5, s: 1 },
];

export function HeroSection({ locale, copy }: { locale: Locale; copy: HeroCopy }) {
  const reduce = useReducedMotion() === true;
  const sectionRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 36, damping: 22, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 36, damping: 22, mass: 0.8 });
  const ringX = useTransform(sx, [-0.5, 0.5], [-28, 28]);
  const ringY = useTransform(sy, [-0.5, 0.5], [-18, 18]);
  const ghostX = useTransform(sx, [-0.5, 0.5], [24, -24]);
  const ghostY = useTransform(sy, [-0.5, 0.5], [16, -16]);

  const ease = useMemo(() => [0.22, 1, 0.36, 1] as const, []);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 velvet-well" />

      <motion.div
        aria-hidden
        className="absolute -left-1/4 top-[-20%] h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(201,166,107,0.28),transparent_62%)] blur-3xl"
        animate={reduce ? undefined : { x: [0, 80, -40, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-[20%] bottom-[-25%] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(142,167,193,0.18),transparent_64%)] blur-3xl"
        animate={reduce ? undefined : { x: [0, -60, 30, 0], y: [0, -50, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden>
        <motion.div
          className="h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(201,166,107,0.38),transparent_70%)]"
          animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="hero-grid absolute inset-0 opacity-[0.14]" aria-hidden />
      <div className="hero-sweep absolute inset-0 pointer-events-none" aria-hidden />

      {DUST.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="hero-dust pointer-events-none absolute rounded-full bg-gold"
          style={{
            left: `${p.l}%`,
            top: `${p.t}%`,
            width: p.s,
            height: p.s,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: "0 0 8px rgba(201,166,107,0.7)",
          }}
        />
      ))}

      <div className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <motion.img
          src="/logo.png"
          alt=""
          className="h-[56vh] w-auto max-w-none object-contain opacity-[0.08]"
          style={{ x: ghostX, y: ghostY }}
          animate={reduce ? undefined : { rotate: [0, 8, -6, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pt-32 pb-28 text-center">
        <motion.div style={{ x: ringX, y: ringY }} className="relative mx-auto mb-6 h-52 w-52 md:h-64 md:w-64">
          <HeroOrbits reduce={!!reduce} />
          <motion.div
            className="relative z-10 h-full w-full"
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          >
            <motion.img
              src="/logo.png"
              alt={locale === "en" ? "Ather" : "أثر"}
              className="h-full w-full object-contain drop-shadow-[0_16px_48px_rgba(201,166,107,0.45)]"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.15, ease }}
            />
          </motion.div>
        </motion.div>

        <motion.p
          className="text-gold tracking-[0.45em] text-[11px] uppercase mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease }}
        >
          {copy.badge}
        </motion.p>

        <motion.h1
          className="font-display text-4xl md:text-6xl lg:text-7xl text-pearl leading-[1.15] mb-6"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
        >
          {copy.title1}{" "}
          <span className="gold-text gold-text-shine">{copy.highlight}</span>
          <br />
          {copy.title2}
        </motion.h1>

        <motion.p
          className="text-pearl/75 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.72, ease }}
        >
          {copy.description}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.92, ease }}
        >
          <Link href="/store">
            <Button size="lg" variant="glow" className="h-14 px-10 text-base hero-cta-pulse">
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
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <motion.a
          href="#lookbook"
          className="flex flex-col items-center gap-2 text-gold/70 hover:text-gold transition-colors"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, 8, 0] }}
          transition={
            reduce
              ? { delay: 1.2 }
              : { opacity: { delay: 1.4, duration: 0.6 }, y: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.6 } }
          }
          aria-label={locale === "en" ? "Scroll to treasures" : "انتقل إلى الكنوز"}
        >
          <span className="h-10 w-px bg-gradient-to-b from-transparent via-gold to-transparent" />
          <ChevronDown className="w-4 h-4" />
        </motion.a>
      </div>
    </section>
  );
}

function HeroOrbits({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-[-38%] z-0" aria-hidden>
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id="atherOrbit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A66B" stopOpacity="0" />
            <stop offset="45%" stopColor="#EAD7A4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A7843F" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="118" fill="none" stroke="url(#atherOrbit)" strokeWidth="1.1" strokeDasharray="70 200" />
        <circle cx="200" cy="200" r="148" fill="none" stroke="url(#atherOrbit)" strokeWidth="0.8" strokeDasharray="28 16 8 90" />
        <circle cx="200" cy="200" r="178" fill="none" stroke="url(#atherOrbit)" strokeWidth="1.25" strokeDasharray="110 260" />
      </motion.svg>
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="200"
          cy="200"
          r="132"
          fill="none"
          stroke="rgba(201,166,107,0.35)"
          strokeWidth="0.7"
          strokeDasharray="12 48 6 80"
        />
        <circle
          cx="200"
          cy="200"
          r="164"
          fill="none"
          stroke="rgba(234,215,164,0.28)"
          strokeWidth="0.9"
          strokeDasharray="50 140"
        />
      </motion.svg>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 16 + i * 8, repeat: Infinity, ease: "linear" }}
        >
          <span
            className="absolute left-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(201,166,107,0.9)]"
            style={{
              top: `${10 + i * 7}%`,
              width: 5 + i,
              height: 5 + i,
              marginLeft: -3,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
