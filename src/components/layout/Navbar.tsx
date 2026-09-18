"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, User, LogOut } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/components/TranslationProvider";
import { usePathname, useRouter } from "next/navigation";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { GoldRule } from "@/components/ui/Treasure";
import { brandWord } from "@/lib/catalog-i18n";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() === true;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const wasMenuOpen = useRef(false);

  const onHero = pathname === "/" && !isScrolled && !isMobileMenuOpen;
  const inverted = onHero || isMobileMenuOpen;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      wasMenuOpen.current = true;
      firstMobileLinkRef.current?.focus();
      return;
    }
    if (wasMenuOpen.current) {
      menuButtonRef.current?.focus();
      wasMenuOpen.current = false;
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isAccountOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAccountOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isAccountOpen]);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");
    router.push(`/store?q=${encodeURIComponent(q)}`);
    router.refresh();
  };

  const openSearch = () => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
    setIsSearchOpen(true);
  };

  const navLinks = [
    { name: t.navbar.home, href: "/" },
    { name: t.navbar.store, href: "/store" },
    { name: t.navbar.trackOrder, href: "/track-order" },
    { name: t.navbar.faq, href: "/faq" },
    { name: t.navbar.contact, href: "/contact" },
  ];

  const cartCount = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;
  const isCandidate = session?.user?.role === "CANDIDATE";
  const accountHref = isCandidate ? "/candidate" : "/orders";
  const accountLabel = isCandidate ? t.navbar.candidateDashboard : t.navbar.myOrders;
  const brand = brandWord(locale);

  const iconBtnClass = cn(
    "relative inline-flex items-center justify-center h-11 w-11 rounded-full transition-colors duration-200 touch-manipulation cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
    inverted
      ? "text-pearl/85 hover:text-gold hover:bg-pearl/10 focus-visible:ring-offset-transparent"
      : "text-truffle/75 hover:text-gold-deep hover:bg-gold/10 focus-visible:ring-offset-pearl"
  );

  const linkTone = inverted ? "text-pearl/75 hover:text-gold" : "text-truffle/70 hover:text-gold-deep";
  const activeTone = inverted ? "text-gold" : "text-gold-deep";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[80] focus:px-4 focus:py-2.5 focus:bg-gold focus:text-truffle focus:rounded-full focus:text-sm focus:font-medium"
      >
        {t.navbar.skipToContent}
      </a>

      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          isMobileMenuOpen
            ? "bg-velvet/95 backdrop-blur-md"
            : onHero
              ? "bg-gradient-to-b from-velvet/70 via-velvet/25 to-transparent"
              : "bg-pearl/92 backdrop-blur-md shadow-[0_10px_40px_-28px_rgba(75,47,36,0.45)]"
        )}
      >
        <div
          className={cn(
            "grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 lg:px-8 transition-[height] duration-300",
            isScrolled ? "h-16 md:h-[4.5rem]" : "h-[4.5rem] md:h-24"
          )}
        >
          <nav
            className={cn(
              "hidden lg:flex items-center",
              locale === "ar" ? "gap-5" : "gap-7",
              locale === "ar" ? "text-[13px] font-medium" : "text-[11px] tracking-[0.2em] uppercase"
            )}
            aria-label={brand}
          >
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative py-2 transition-colors duration-200",
                    active ? activeTone : linkTone
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.name}
                  <span
                    className={cn(
                      "absolute bottom-0 inset-x-1 h-px bg-gold transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          <button
            ref={menuButtonRef}
            type="button"
            className={cn("lg:hidden justify-self-start", iconBtnClass)}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? t.navbar.closeMenu : t.navbar.openMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="ather-mobile-nav"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href="/"
            className="justify-self-center flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            aria-label={brand}
          >
            <img
              src="/logo.png"
              alt=""
              className={cn(
                "w-auto object-contain transition-[height] duration-300",
                isScrolled ? "h-10 md:h-12" : "h-12 md:h-[4.25rem]",
                inverted && "drop-shadow-[0_8px_18px_rgba(201,166,107,0.35)]"
              )}
            />
          </Link>

          <div className="justify-self-end flex items-center gap-0.5 sm:gap-1">
            <div className="relative" ref={accountRef}>
              {session?.user ? (
                <>
                  <button
                    type="button"
                    className={iconBtnClass}
                    onClick={() => setIsAccountOpen((open) => !open)}
                    aria-label={t.navbar.account}
                    aria-expanded={isAccountOpen}
                    aria-haspopup="menu"
                  >
                    <User className="w-[18px] h-[18px]" />
                  </button>
                  <AnimatePresence>
                    {isAccountOpen && (
                      <motion.div
                        role="menu"
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute top-full end-0 mt-2 min-w-52 rounded-2xl border border-gold/30 bg-card p-2 shadow-[0_18px_40px_-24px_rgba(75,47,36,0.55)] z-50"
                      >
                        <Link
                          href={accountHref}
                          role="menuitem"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-truffle hover:bg-gold/10 hover:text-gold-deep transition-colors"
                        >
                          <User className="w-4 h-4" />
                          {accountLabel}
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => signOut()}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          {t.navbar.logout}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link href="/login" className={iconBtnClass} aria-label={t.navbar.login}>
                  <User className="w-[18px] h-[18px]" />
                </Link>
              )}
            </div>

            <button type="button" onClick={openSearch} className={iconBtnClass} aria-label={t.navbar.search}>
              <Search className="w-[18px] h-[18px]" />
            </button>

            <LanguageSwitcher inverted={inverted} />

            <Link href="/cart" className={iconBtnClass} aria-label={t.navbar.cart}>
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-1 end-1 min-w-4 h-4 px-1 rounded-full bg-gold text-truffle text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div
          className={cn(
            "h-px w-full bg-gradient-to-r from-transparent via-gold/45 to-transparent transition-opacity duration-300",
            inverted ? "opacity-30" : "opacity-100"
          )}
          aria-hidden
        />
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="ather-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={t.navbar.openMenu}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-0 bg-velvet/95 backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label={t.navbar.closeMenu}
            />
            <motion.nav
              initial={reduceMotion ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex h-full flex-col px-8 pt-28 pb-[max(2rem,env(safe-area-inset-bottom))] overflow-y-auto"
            >
              <GoldRule className="mb-8 max-w-xs mx-0" />
              <div className="flex flex-col gap-1">
                {navLinks.map((link, index) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      ref={index === 0 ? firstMobileLinkRef : undefined}
                      className={cn(
                        "font-display text-3xl py-3 transition-colors duration-200 focus-visible:outline-none focus-visible:text-gold",
                        active ? "text-gold" : "text-pearl hover:text-gold"
                      )}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-10 flex flex-col gap-3">
                <button
                  type="button"
                  className="flex items-center gap-3 text-pearl/80 hover:text-gold py-3 text-start transition-colors"
                  onClick={openSearch}
                >
                  <Search className="w-4 h-4" />
                  {t.navbar.search}
                </button>
                {session?.user ? (
                  <>
                    <Link
                      href={accountHref}
                      className="flex items-center gap-3 text-pearl/80 hover:text-gold py-3 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      {accountLabel}
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="flex items-center gap-3 text-red-300 hover:text-red-200 py-3 text-start cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.navbar.logout}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 text-pearl/80 hover:text-gold py-3 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {t.navbar.loginSignup}
                  </Link>
                )}
                <LanguageSwitcher inverted variant="full" className="mt-2 border border-gold/30 text-pearl" />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <SearchOverlay
            key="vault-search"
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSubmit={handleSearch}
            onClose={closeSearch}
          />
        )}
      </AnimatePresence>
    </>
  );
}
