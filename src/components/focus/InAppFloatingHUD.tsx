import React from 'react'
import {
  Play,
  Pause,
  Layers,
  ChevronRight,
  Flame,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { useFocus, MODE_CONFIGS } from '@/context/FocusContext'
import { NavTab } from '@/components/layout/Sidebar'

interface InAppFloatingHUDProps {
  currentTab: NavTab
  onNavigateToFocus: () => void
}

export const InAppFloatingHUD: React.FC<InAppFloatingHUDProps> = ({
  currentTab,
  onNavigateToFocus,
}) => {
  const {
    mode,
    timeFormatted,
    isRunning,
    progressPercent,
    toggleTimer,
    enterMiniMode,
    secondsRemaining,
    currentTotalSeconds,
    selectedTask,
    customGoal,
  } = useFocus()

  // Only show if not on focus tab AND timer has elapsed or is running
  const isTimerActive = isRunning || secondsRemaining < currentTotalSeconds
  if (currentTab === 'focus' || !isTimerActive) return null

  const objectiveName = selectedTask ? selectedTask.title : customGoal || MODE_CONFIGS[mode].label

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#121020]/95 border-2 border-neon-pink shadow-[0_0_25px_rgba(236,72,153,0.4)] p-3 backdrop-blur-md flex items-center space-x-3.5 relative font-mono text-xs">
        {/* Neon corner accents */}
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899]" />
        <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />

        {/* Pulse indicator icon */}
        <div
          onClick={onNavigateToFocus}
          className="w-8 h-8 bg-neon-pink/20 border border-neon-pink flex items-center justify-center text-neon-pink shrink-0 cursor-pointer hover:scale-105 transition-transform"
          title="Open Focus Deck"
        >
          <Flame className={`w-4 h-4 ${isRunning ? 'animate-bounce' : ''}`} />
        </div>

        {/* Time & Objective info */}
        <div className="cursor-pointer" onClick={onNavigateToFocus}>
          <div className="flex items-center space-x-1.5">
            <span className="font-pixel text-sm text-foreground tracking-wider font-bold">
              {timeFormatted}
            </span>
            <span className="text-[8px] text-neon-pink uppercase px-1 py-0 border border-neon-pink/50 bg-neon-pink/10">
              {MODE_CONFIGS[mode].label}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={objectiveName}>
            {objectiveName}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 pl-2 border-l border-border">
          <button
            onClick={toggleTimer}
            className={`w-7 h-7 flex items-center justify-center border cursor-pointer transition-all ${
              isRunning
                ? 'bg-secondary border-border text-foreground hover:border-foreground'
                : 'bg-neon-pink text-black border-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.5)]'
            }`}
            title={isRunning ? 'Pause Timer' : 'Resume Sprint'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Float Above Screens Button */}
          <button
            onClick={enterMiniMode}
            className="px-2 py-1 bg-neon-cyan/15 hover:bg-neon-cyan/30 border border-neon-cyan/50 text-neon-cyan text-[9px] font-pixel cursor-pointer transition-all flex items-center gap-1 shadow-[0_0_8px_rgba(34,211,238,0.2)]"
            title="Float above all screens (Always-On-Top Mini Widget)"
          >
            <ExternalLink className="w-3 h-3 text-neon-cyan" />
            <span className="hidden sm:inline">FLOAT</span>
          </button>
        </div>
      </div>
    </div>
  )
}

