import type { Metadata } from "next";
import { noIndexPage } from "@/lib/seo";

export const metadata: Metadata = noIndexPage("/register");

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
