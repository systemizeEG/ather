import type { Metadata } from "next";
import { noIndexPage } from "@/lib/seo";

export const metadata: Metadata = noIndexPage("/orders");

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
