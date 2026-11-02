import React from "react"
import { cn } from "@/lib/utils"

export interface RetroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "accent-purple" | "accent-pink" | "accent-cyan"
  pixelBorder?: boolean
  glow?: boolean
}

export const RetroCard = React.forwardRef<HTMLDivElement, RetroCardProps>(
  ({ className, variant = "default", pixelBorder = true, glow = false, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-card border-border",
      elevated: "bg-elevated border-border",
      "accent-purple": "bg-card border-primary/50",
      "accent-pink": "bg-card border-arcade-pink/50",
      "accent-cyan": "bg-card border-cyber-cyan/50",
    }

    const glowStyles = {
      default: "",
      elevated: "",
      "accent-purple": "hover:shadow-glow-purple",
      "accent-pink": "hover:shadow-glow-pink",
      "accent-cyan": "hover:shadow-glow-cyan",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative p-4 text-foreground transition-all duration-200 border-2",
          variantStyles[variant],
          pixelBorder && "shadow-pixel-md",
          glow && glowStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
RetroCard.displayName = "RetroCard"

export const RetroCardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("flex items-center justify-between pb-3 border-b border-border/80 mb-3", className)} {...props}>
    {children}
  </div>
)

export const RetroCardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement> & { pixelFont?: boolean }> = ({
  className,
  pixelFont = false,
  children,
  ...props
}) => (
  <h3
    className={cn(
      "font-bold text-foreground tracking-wide",
      pixelFont ? "font-pixel text-xs text-primary" : "text-base",
      className
    )}
    {...props}
  >
    {children}
  </h3>
)

