import type { Metadata } from "next";
import { noIndexPage } from "@/lib/seo";

export const metadata: Metadata = noIndexPage("/checkout");

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
