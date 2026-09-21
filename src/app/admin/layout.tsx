import type { Metadata } from "next";
import { noIndexPage } from "@/lib/seo";

export const metadata: Metadata = noIndexPage("/admin");

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
