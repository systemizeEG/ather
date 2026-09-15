"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-pearl flex" dir="rtl">
      <div className="hidden lg:block w-72 shrink-0">
        <div className="fixed right-0 top-0 h-screen z-40">
          <AdminSidebar />
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-truffle/40"
            onClick={() => setMenuOpen(false)}
            aria-label="إغلاق القائمة"
          />
          <div className="absolute right-0 top-0 h-full shadow-2xl">
            <AdminSidebar onNavigate={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 border-b border-gold/20 bg-card/90 backdrop-blur flex items-center px-4 gap-3 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-display font-bold">لوحة أثر</h2>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
