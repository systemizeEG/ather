import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">{title}</h1>
        {description && <p className="text-muted-foreground text-sm md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-card border border-gold/20 rounded-2xl overflow-hidden", className)}>
      {children}
    </div>
  );
}
