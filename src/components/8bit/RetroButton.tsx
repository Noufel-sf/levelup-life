import React from "react"
import { cn } from "@/lib/utils"

export interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "pink" | "cyan" | "green" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  pixelFont?: boolean
}

export const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant = "primary", size = "md", pixelFont = false, children, disabled, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-mono font-medium transition-all duration-150 active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none select-none outline-none focus-visible:ring-1 focus-visible:ring-neon-cyan cursor-pointer"

    const sizeStyles = {
      sm: "px-2.5 py-1 text-xs tracking-wider gap-1.5",
      md: "px-4 py-2 text-xs tracking-widest gap-2",
      lg: "px-6 py-2.5 text-sm tracking-widest gap-2.5",
    }

    const variantStyles = {
      primary: "bg-primary text-white border border-primary/80 shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:bg-primary/90",
      pink: "bg-neon-pink text-white border border-neon-pink shadow-[0_0_15px_rgba(236,72,153,0.35)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:bg-neon-pink/90",
      cyan: "bg-neon-cyan text-black font-bold border border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.35)] hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:bg-neon-cyan/90",
      green: "bg-neon-green text-black font-bold border border-neon-green shadow-[0_0_15px_rgba(163,230,53,0.35)] hover:shadow-[0_0_20px_rgba(163,230,53,0.6)] hover:bg-neon-green/90",
      secondary: "bg-card text-foreground border border-border hover:border-neon-cyan hover:text-neon-cyan hover:bg-secondary transition-colors",
      ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-colors",
      danger: "bg-destructive text-white border border-destructive shadow-[0_0_15px_rgba(239,68,68,0.35)] hover:bg-destructive/90",
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          pixelFont ? "font-pixel text-[9px]" : "font-mono font-semibold",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
RetroButton.displayName = "RetroButton"
