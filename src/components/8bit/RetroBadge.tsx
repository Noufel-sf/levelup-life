import React from "react"
import { cn } from "@/lib/utils"

export interface RetroBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "pink" | "cyan" | "green" | "gold" | "muted"
  pixelFont?: boolean
}

export const RetroBadge: React.FC<RetroBadgeProps> = ({
  className,
  variant = "primary",
  pixelFont = false,
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-primary/20 text-[#D8B4FE] border-primary/60",
    pink: "bg-arcade-pink/20 text-[#FBCFE8] border-arcade-pink/60",
    cyan: "bg-cyber-cyan/20 text-[#A5F3FC] border-cyber-cyan/60",
    green: "bg-terminal-green/20 text-[#BBF7D0] border-terminal-green/60",
    gold: "bg-caution-amber/20 text-[#FEF08A] border-caution-amber/60",
    muted: "bg-elevated text-muted border-border",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border shadow-pixel-sm",
        variantStyles[variant],
        pixelFont ? "font-pixel text-[8px]" : "font-sans",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

