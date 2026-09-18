"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Search, User } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/components/TranslationProvider";
import { useRouter } from "next/navigation";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

export function Navbar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setIsSearchOpen(true);
  };

  const navLinks = [
    { name: t.navbar.home, href: "/" },
    { name: t.navbar.store, href: "/store" },
    { name: t.navbar.trackOrder, href: "/track-order" },
    { name: t.navbar.faq, href: "/faq" },
  ];

  const cartCount = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
          isScrolled ? "bg-pearl/95 backdrop-blur-md border-b border-gold/25" : "bg-pearl/80 backdrop-blur-sm"
        }`}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[4.5rem] md:h-24 px-4 md:px-8">
          <nav className="hidden md:flex items-center gap-7 text-[11px] tracking-[0.22em] uppercase text-truffle/70">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gold-deep transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          <button
            className="md:hidden justify-self-start p-2 text-truffle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? t.navbar.closeMenu : t.navbar.openMenu}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="justify-self-center flex flex-col items-center">
            <img src="/logo.png" alt="أثر | Ather" className="h-12 md:h-[4.25rem] w-auto object-contain" />
          </Link>

          <div className="justify-self-end flex items-center gap-2 md:gap-3">
            {session?.user ? (
              session.user.role === "CANDIDATE" ? (
                <Link href="/candidate" className="hidden sm:inline text-[11px] tracking-[0.18em] uppercase hover:text-gold-deep">
                  {t.navbar.candidateDashboard}
                </Link>
              ) : (
                <Link href="/orders" className="hidden sm:inline text-[11px] tracking-[0.18em] uppercase hover:text-gold-deep">
                  {t.navbar.myOrders}
                </Link>
              )
            ) : (
              <Link href="/login" className="hidden sm:inline text-[11px] tracking-[0.18em] uppercase hover:text-gold-deep" aria-label={t.navbar.login}>
                <User className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={openSearch}
              className="p-2 text-truffle/70 hover:text-truffle"
              aria-label={t.navbar.search}
            >
              <Search className="w-4 h-4" />
            </button>

            <LanguageSwitcher />

            <Link
              href="/cart"
              className="relative p-2 text-truffle"
              aria-label={t.navbar.cart}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 end-0 min-w-4 h-4 px-1 rounded-full bg-gold text-truffle text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-pearl border-t border-gold/20 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-6 gap-4">
                <button
                  type="button"
                  className="font-display text-xl text-start"
                  onClick={openSearch}
                >
                  {t.navbar.search}
                </button>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-display text-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {session?.user ? (
                  <>
                    {session.user.role === "CANDIDATE" ? (
                      <Link href="/candidate" className="font-display text-xl" onClick={() => setIsMobileMenuOpen(false)}>
                        {t.navbar.candidateDashboard}
                      </Link>
                    ) : (
                      <Link href="/orders" className="font-display text-xl" onClick={() => setIsMobileMenuOpen(false)}>
                        {t.navbar.myOrders}
                      </Link>
                    )}
                    <button onClick={() => signOut()} className="text-red-700 text-start">
                      {t.navbar.logout}
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    {t.navbar.loginSignup}
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

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
