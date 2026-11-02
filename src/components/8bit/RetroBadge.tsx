import React from "react"
import { cn } from "@/lib/utils"

export interface RetroBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "pink" | "cyan" | "green" | "gold" | "muted"
  pixelFont?: boolean
  glow?: boolean
}

export const RetroBadge: React.FC<RetroBadgeProps> = ({
  className,
  variant = "primary",
  pixelFont = false,
  glow = true,
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-primary/15 text-primary border-primary/60 hover:border-primary",
    pink: "bg-neon-pink/15 text-neon-pink border-neon-pink/60 hover:border-neon-pink",
    cyan: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/60 hover:border-neon-cyan",
    green: "bg-neon-green/15 text-neon-green border-neon-green/60 hover:border-neon-green",
    gold: "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/60 hover:border-neon-yellow",
    muted: "bg-secondary text-muted-foreground border-border",
  }

  const glowStyles = {
    primary: "shadow-[0_0_10px_rgba(168,85,247,0.25)]",
    pink: "shadow-[0_0_10px_rgba(236,72,153,0.25)]",
    cyan: "shadow-[0_0_10px_rgba(34,211,238,0.25)]",
    green: "shadow-[0_0_10px_rgba(163,230,53,0.25)]",
    gold: "shadow-[0_0_10px_rgba(250,204,21,0.25)]",
    muted: "",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border transition-all duration-200 select-none",
        variantStyles[variant],
        glow && glowStyles[variant],
        pixelFont ? "font-pixel text-[8px]" : "font-mono font-bold",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
