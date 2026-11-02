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
          "w-full bg-[#100B1D] border-2 border-border px-3 py-2 text-sm text-foreground placeholder:text-muted/60 transition-colors shadow-pixel-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50",
          pixelFont ? "font-pixel text-xs tracking-wider" : "font-sans",
          className
        )}
        {...props}
      />
    )
  }
)
RetroInput.displayName = "RetroInput"

