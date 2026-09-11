import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 shrink-0 relative">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pb-12">
        {/* Top Header Placeholder (Mobile Menu toggle can go here later) */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-8 lg:hidden">
          <h2 className="font-bold text-lg">لوحة الإدارة — أثر</h2>
        </header>
        
        <div className="p-6 md:p-8 flex-1 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
