import React from "react"
import { cn } from "@/lib/utils"

export interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "pink" | "cyan" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  pixelFont?: boolean
}

export const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant = "primary", size = "md", pixelFont = false, children, disabled, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2"

    const sizeStyles = {
      sm: "px-2.5 py-1 text-xs tracking-wider",
      md: "px-4 py-2 text-xs tracking-widest",
      lg: "px-6 py-3 text-sm tracking-widest",
    }

    const variantStyles = {
      primary: "bg-primary text-foreground border-2 border-[#D8B4FE] shadow-pixel-purple hover:bg-[#9333ea]",
      pink: "bg-arcade-pink text-foreground border-2 border-[#FBCFE8] shadow-pixel-pink hover:bg-[#ec4899]",
      cyan: "bg-cyber-cyan text-[#100B1D] font-bold border-2 border-[#A5F3FC] shadow-pixel-cyan hover:bg-[#06b6d4]",
      secondary: "bg-elevated text-foreground border-2 border-border shadow-pixel-md hover:border-[#A855F7]",
      ghost: "bg-transparent text-muted hover:text-foreground hover:bg-elevated/60 border border-transparent hover:border-border",
      danger: "bg-red-600 text-white border-2 border-red-400 shadow-pixel-md hover:bg-red-700",
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          pixelFont ? "font-pixel text-[10px]" : "font-sans",
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

