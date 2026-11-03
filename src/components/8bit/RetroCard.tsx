import React from "react"
import { cn } from "@/lib/utils"

export interface RetroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "accent-purple" | "accent-pink" | "accent-cyan" | "accent-green" | "accent-yellow"
  topStripe?: boolean
  glow?: boolean
}

export const RetroCard = React.forwardRef<HTMLDivElement, RetroCardProps>(
  ({ className, variant = "default", topStripe = false, glow = false, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-card border-border hover:border-border/90",
      elevated: "bg-secondary border-border/80",
      "accent-purple": "bg-card border-primary/50 hover:border-primary shadow-[0_0_15px_rgba(168,85,247,0.15)]",
      "accent-pink": "bg-card border-neon-pink/50 hover:border-neon-pink shadow-[0_0_15px_rgba(236,72,153,0.15)]",
      "accent-cyan": "bg-card border-neon-cyan/50 hover:border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)]",
      "accent-green": "bg-card border-neon-green/50 hover:border-neon-green shadow-[0_0_15px_rgba(163,230,53,0.15)]",
      "accent-yellow": "bg-card border-neon-yellow/50 hover:border-neon-yellow shadow-[0_0_15px_rgba(250,204,21,0.15)]",
    }

    const topStripeStyles = {
      default: "border-t-2 border-t-primary/70",
      elevated: "border-t-2 border-t-neon-cyan/70",
      "accent-purple": "border-t-2 border-t-primary",
      "accent-pink": "border-t-2 border-t-neon-pink",
      "accent-cyan": "border-t-2 border-t-neon-cyan",
      "accent-green": "border-t-2 border-t-neon-green",
      "accent-yellow": "border-t-2 border-t-neon-yellow",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative p-4 text-foreground transition-all duration-200 border",
          variantStyles[variant],
          topStripe && topStripeStyles[variant],
          glow && "shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]",
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
  <div className={cn("flex items-center justify-between pb-3 border-b border-border/70 mb-3", className)} {...props}>
    {children}
  </div>
)

export const RetroCardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement> & { pixelFont?: boolean }> = ({
  className,
  pixelFont = true,
  children,
  ...props
}) => (
  <h3
    className={cn(
      "tracking-wider text-foreground flex items-center gap-2",
      pixelFont ? "font-pixel text-xs" : "font-mono font-bold text-sm",
      className
    )}
    {...props}
  >
    {children}
  </h3>
)

export const RetroCardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("text-xs text-muted-foreground", className)} {...props}>
    {children}
  </div>
)
