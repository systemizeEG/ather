import type { Metadata } from "next";
import { noIndexPage } from "@/lib/seo";

export const metadata: Metadata = noIndexPage("/candidate");

export default function CandidateRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
