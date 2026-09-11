import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-velvet text-pearl">
      <div className="px-6 md:px-10 py-16 grid md:grid-cols-3 gap-10 items-start border-t border-gold/20">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="أثر" className="h-14 w-auto object-contain" />
          <span className="font-display text-2xl">أثر</span>
        </Link>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.2em] uppercase text-pearl/70">
          <Link href="/store" className="hover:text-gold">الخزينة</Link>
          <Link href="/track-order" className="hover:text-gold">تتبع الطلب</Link>
          <Link href="/faq" className="hover:text-gold">الأسئلة</Link>
          <Link href="/contact" className="hover:text-gold">تواصل</Link>
        </nav>
        <p className="text-sm text-pearl/60 md:text-end leading-relaxed">
          خزينة إكسسوارات — قطع تُختار كما تُختار النفائس.
          <br />
          © {new Date().getFullYear()} Ather · InstaPay
        </p>
      </div>
    </footer>
  );
}
