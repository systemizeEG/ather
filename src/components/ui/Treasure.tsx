import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Gem } from "lucide-react";

export function CornerMarks({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      <span className="absolute top-2 start-2 h-3 w-3 border-t border-s border-gold" />
      <span className="absolute top-2 end-2 h-3 w-3 border-t border-e border-gold" />
      <span className="absolute bottom-2 start-2 h-3 w-3 border-b border-s border-gold" />
      <span className="absolute bottom-2 end-2 h-3 w-3 border-b border-e border-gold" />
    </div>
  );
}

export function GoldRule({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 w-full max-w-md mx-auto", className)} aria-hidden={!label}>
      <span className="h-px flex-1 bg-gradient-to-l from-gold to-transparent" />
      <Gem className="w-3.5 h-3.5 text-gold shrink-0" />
      {label ? (
        <span className="text-[11px] tracking-[0.28em] uppercase text-gold font-medium whitespace-nowrap">
          {label}
        </span>
      ) : null}
      <span className="h-px flex-1 bg-gradient-to-r from-gold to-transparent" />
    </div>
  );
}

export function TreasureFrame({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={cn("treasure-frame rounded-3xl overflow-hidden", padded && "p-6 sm:p-8", className)}>
      <CornerMarks />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Medallion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full p-[3px] bg-gradient-to-b from-gold via-[#ead7a4] to-gold-deep shadow-[0_8px_24px_rgba(201,166,107,0.35)]",
        className
      )}
    >
      <span className="rounded-full bg-pearl overflow-hidden flex items-center justify-center w-full h-full">
        {children}
      </span>
    </span>
  );
}
