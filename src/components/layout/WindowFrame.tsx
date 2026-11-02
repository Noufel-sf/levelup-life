import React, { useState } from 'react'
import { Minus, Square, X, Terminal } from 'lucide-react'

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
    <div className="h-8 bg-[#100B1D] border-b-2 border-border flex items-center justify-between select-none px-3 z-50 relative app-drag-region">
      <div className="flex items-center space-x-2 no-drag">
        <img
          src="/logo.png"
          alt="LIFE OS"
          className="w-4 h-4 object-contain shadow-pixel-sm rounded-sm"
        />
        <span className="font-pixel text-[10px] text-foreground tracking-wider">
          LIFE OS <span className="text-arcade-pink">//</span> v0.1.0
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-terminal-green/20 text-terminal-green border border-terminal-green/40">
          SYS:ONLINE
        </span>
      </div>

      <div className="flex items-center space-x-1 no-drag">
        <button
          onClick={handleMinimize}
          className="w-6 h-6 flex items-center justify-center text-muted hover:text-foreground hover:bg-elevated transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-6 h-6 flex items-center justify-center text-muted hover:text-foreground hover:bg-elevated transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="w-6 h-6 flex items-center justify-center text-muted hover:text-white hover:bg-red-600 transition-colors"
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

