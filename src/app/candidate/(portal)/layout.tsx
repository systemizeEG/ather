import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { CandidateChrome } from "@/components/candidate/CandidateChrome";

export default async function CandidatePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== USER_ROLES.CANDIDATE) {
    redirect("/candidate/login");
  }

  return <CandidateChrome name={session.user.name || "Candidate"}>{children}</CandidateChrome>;
}
