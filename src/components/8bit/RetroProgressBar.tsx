import React from "react"
import { cn } from "@/lib/utils"

export interface RetroProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
  max?: number
  variant?: "purple" | "pink" | "cyan" | "green" | "gold"
  showSegments?: boolean
  showLabel?: boolean
  label?: string
}

export const RetroProgressBar: React.FC<RetroProgressBarProps> = ({
  value,
  max = 100,
  variant = "purple",
  showSegments = true,
  showLabel = false,
  label,
  className,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const fillColors = {
    purple: "bg-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]",
    pink: "bg-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.5)]",
    cyan: "bg-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]",
    green: "bg-neon-green shadow-[0_0_10px_rgba(163,230,53,0.5)]",
    gold: "bg-neon-yellow shadow-[0_0_10px_rgba(250,204,21,0.5)]",
  }

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-[11px] font-mono font-medium text-muted-foreground">
          <span>{label}</span>
          <span className="font-mono text-neon-cyan">
            {Math.round(value)}/{max} ({Math.round(percentage)}%)
          </span>
        </div>
      )}
      <div className="relative h-3 w-full bg-background border border-border p-0.5 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300 relative", fillColors[variant])}
          style={{ width: `${percentage}%` }}
        >
          {showSegments && (
            <div
              className="absolute inset-0 w-full h-full opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.9) 3px, rgba(0,0,0,0.9) 5px)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
