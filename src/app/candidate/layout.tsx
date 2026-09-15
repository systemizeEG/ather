import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== USER_ROLES.CANDIDATE) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <div className="hidden lg:block w-64 shrink-0 relative">
        <CandidateSidebar name={session.user.name || "مرشح"} />
      </div>
      <main className="flex-1 flex flex-col min-w-0 pb-12">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-8 lg:hidden">
          <h2 className="font-bold text-lg">لوحة المرشح — أثر</h2>
        </header>
        <div className="p-6 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
