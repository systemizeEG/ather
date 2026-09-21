import type { Metadata } from "next";
import { noIndexPage } from "@/lib/seo";

export const metadata: Metadata = noIndexPage("/login");

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
