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
    purple: "bg-primary border-r-2 border-[#D8B4FE]",
    pink: "bg-arcade-pink border-r-2 border-[#FBCFE8]",
    cyan: "bg-cyber-cyan border-r-2 border-[#A5F3FC]",
    green: "bg-terminal-green border-r-2 border-[#BBF7D0]",
    gold: "bg-caution-amber border-r-2 border-[#FEF08A]",
  }

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-[11px] font-medium text-muted">
          <span>{label}</span>
          <span className="font-pixel text-[9px] text-foreground">
            {Math.round(value)}/{max} ({Math.round(percentage)}%)
          </span>
        </div>
      )}
      <div className="relative h-4 w-full bg-[#100B1D] border-2 border-border p-0.5 overflow-hidden shadow-pixel-sm">
        <div
          className={cn("h-full transition-all duration-300 relative", fillColors[variant])}
          style={{ width: `${percentage}%` }}
        >
          {showSegments && (
            <div
              className="absolute inset-0 w-full h-full opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.8) 4px, rgba(0,0,0,0.8) 6px)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

