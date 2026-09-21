import type { Metadata } from "next";
import { noIndexPage } from "@/lib/seo";

export const metadata: Metadata = noIndexPage("/cart");

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
