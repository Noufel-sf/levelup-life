import React from 'react'
import {
  Play,
  Pause,
  Maximize2,
  Check,
} from 'lucide-react'
import { useFocus, MODE_CONFIGS } from '@/context/FocusContext'
import { soundEngine } from '@/lib/sound'

export const DesktopFloatingWidget: React.FC = () => {
  const {
    mode,
    timeFormatted,
    isRunning,
    progressPercent,
    toggleTimer,
    exitMiniMode,
    conquerSprint,
    selectedTask,
    customGoal,
  } = useFocus()

  const objectiveName = selectedTask
    ? selectedTask.title
    : customGoal || (MODE_CONFIGS[mode].isBreak ? 'Cyber Recharge' : 'Deep Work Focus')

  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className="app-drag-region h-screen w-screen bg-[#100c1e] border-2 border-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.4)] select-none overflow-hidden flex items-center justify-between px-3 py-1.5 relative font-mono text-xs cursor-move "
    >
      {/* DEV SCOPE Scanlines */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-20 rounded-none" />

      {/* Top-Right Neon Pink Sharp Pixel Dot */}
      <span className="absolute top-0 right-0 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899] pointer-events-none rounded-none" />

      {/* LEFT ACTION BUTTONS (no-drag so clicking works) */}
      <div
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        className="flex items-center space-x-1.5"
      >
        {/* Play / Pause Sprint Button */}
        <button
          type="button"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => {
            soundEngine.playClick()
            toggleTimer()
          }}
          className={`no-drag px-3 py-1.5 flex items-center gap-1.5 font-pixel text-[10px] font-bold border rounded-none transition-all cursor-pointer ${
            isRunning
              ? 'bg-secondary text-neon-cyan border-neon-cyan/50 hover:bg-secondary/80'
              : 'bg-neon-cyan text-black border-neon-cyan hover:bg-neon-cyan/90 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
          }`}
          title={isRunning ? 'Pause Sprint' : 'Start Sprint'}
        >
          {isRunning ? (
            <>
              <Pause className="w-3 h-3 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
            </>
          )}
        </button>

        {/* Quick Conquer (+XP) */}
        <button
          type="button"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => {
            soundEngine.playClick()
            conquerSprint()
          }}
          className="no-drag w-7 h-7 flex items-center justify-center bg-neon-green/15 border border-neon-green/50 hover:bg-neon-green/30 text-neon-green cursor-pointer transition-colors rounded-none"
          title="Conquer sprint early & claim XP"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Expand / Restore Full Application */}
        <button
          type="button"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => {
            soundEngine.playClick()
            exitMiniMode()
          }}
          className="no-drag w-7 h-7 flex items-center justify-center bg-secondary/80 border border-border hover:border-neon-cyan text-muted-foreground hover:text-white transition-colors cursor-pointer rounded-none"
          title="Expand back to full LIFE OS"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RIGHT METRICS: Objective Title + Large Bold Timer (pointer-events-none makes whole right side 100% draggable!) */}
      <div className="flex flex-col items-end text-right pl-3 overflow-hidden flex-1 min-w-0 pointer-events-none select-none">
        {/* Objective title with pulsing dot */}
        <div className="flex items-center space-x-1.5 max-w-full overflow-hidden text-muted-foreground">
          <span className="text-[10px] font-mono truncate text-foreground/90 font-bold" title={objectiveName}>
            {objectiveName}
          </span>
          <span
            className={`w-1.5 h-1.5 shrink-0 rounded-none ${
              isRunning ? 'bg-neon-green shadow-[0_0_6px_#a3e635] animate-pulse' : 'bg-neon-pink'
            }`}
          />
        </div>

        {/* Bold Digital Countdown */}
        <div className="font-pixel text-2xl font-bold tracking-wider text-neon-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] leading-tight mt-0.5">
          {timeFormatted}
        </div>
      </div>

      {/* Bottom Thin Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary overflow-hidden pointer-events-none rounded-none">
        <div
          className={`h-full transition-all duration-300 rounded-none ${
            MODE_CONFIGS[mode].isBreak ? 'bg-neon-green shadow-[0_0_6px_#a3e635]' : 'bg-neon-pink shadow-[0_0_6px_#ec4899]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
