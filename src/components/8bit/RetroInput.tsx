import React from "react"
import { cn } from "@/lib/utils"

export interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  pixelFont?: boolean
}

export const RetroInput = React.forwardRef<HTMLInputElement, RetroInputProps>(
  ({ className, pixelFont = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan disabled:opacity-50 font-mono",
          pixelFont && "font-pixel text-xs tracking-wider",
          className
        )}
        {...props}
      />
    )
  }
)
RetroInput.displayName = "RetroInput"
