import React, { useState } from 'react'
import { Minus, Square, X, Activity } from 'lucide-react'

export const WindowFrame: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.()
  }

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow?.()
    setIsMaximized(!isMaximized)
  }

  const handleClose = () => {
    window.electronAPI?.closeWindow?.()
  }

  return (
    <div className="h-9 bg-background/95 border-b border-border flex items-center justify-between select-none px-3 z-50 relative app-drag-region backdrop-blur-md">
      <div className="flex items-center space-x-2.5 no-drag">
        <div className="w-6 h-6 bg-card border border-neon-cyan/50 flex items-center justify-center shadow-[0_0_8px_rgba(34,211,238,0.25)] p-0.5">
          <img
            src="/logo.png"
            alt="LIFE OS"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-pixel text-[10px] text-foreground tracking-wider flex items-center gap-1.5">
          LIFE <span className="text-neon-cyan">OS</span> <span className="text-primary font-mono">//</span> <span className="text-muted-foreground font-mono text-[9px]">v0.1.0</span>
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neon-green/10 border border-neon-green/40 text-neon-green text-[9px] font-mono tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_6px_#a3e635] animate-pulse" />
          <span>STATUS: ONLINE</span>
        </div>
      </div>

      <div className="flex items-center space-x-1 no-drag">
        <button
          onClick={handleMinimize}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-colors cursor-pointer"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-colors cursor-pointer"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-destructive transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <style>{`
        .app-drag-region {
          -webkit-app-region: drag;
        }
        .no-drag {
          -webkit-app-region: no-drag;
        }
      `}</style>
    </div>
  )
}
