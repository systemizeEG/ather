import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-accent text-accent-foreground shadow hover:bg-accent/80",
    secondary: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
    destructive: "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
    success: "border-transparent bg-green-500/10 text-green-500 border border-green-500/20",
    warning: "border-transparent bg-orange-500/10 text-orange-500 border border-orange-500/20",
    outline: "text-foreground",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
