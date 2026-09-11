import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    
    const variants = {
      default:
        "bg-gradient-to-b from-gold to-gold-deep text-truffle hover:from-[#d4b67a] hover:to-gold shadow-[0_8px_22px_rgba(201,166,107,0.32)]",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline:
        "border border-gold/70 bg-transparent text-truffle hover:bg-gold/15",
      secondary: "bg-powder/20 text-truffle hover:bg-powder/30",
      ghost: "hover:bg-gold/10 text-truffle",
      link: "text-gold-deep underline-offset-4 hover:underline",
      glow:
        "bg-gradient-to-b from-gold to-gold-deep text-truffle hover:from-[#d4b67a] hover:to-gold shadow-[0_10px_32px_rgba(201,166,107,0.45)] hover:shadow-[0_14px_40px_rgba(201,166,107,0.55)]",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-full px-3",
      lg: "h-12 rounded-full px-8 text-base font-semibold",
      icon: "h-11 w-11",
    }

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
