import React from 'react'
import {
  Play,
  Pause,
  Maximize2,
  X,
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
  const durationLabel = `(${String(MODE_CONFIGS[mode].durationMin).padStart(2, '0')}:00)`

  return (
    <div className="h-screen w-screen bg-[#06100d] border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.45)] select-none overflow-hidden flex items-center justify-between px-3 py-2 relative font-mono text-xs app-drag-region cursor-move">
      {/* Top-Right Neon Bracket Accent (exactly matching reference design) */}
      <span className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />

      {/* LEFT CONTROLS (Close, Expand, Action button) */}
      <div className="flex items-center space-x-1.5 no-drag">
        {/* Close Button */}
        <button
          onClick={exitMiniMode}
          className="w-7 h-7 flex items-center justify-center bg-[#10241e] border border-emerald-500/40 hover:border-emerald-400 text-emerald-400/80 hover:text-white transition-colors cursor-pointer"
          title="Close Floating Widget (Restore Window)"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Expand Button */}
        <button
          onClick={exitMiniMode}
          className="w-7 h-7 flex items-center justify-center bg-[#10241e] border border-emerald-500/40 hover:border-emerald-400 text-emerald-400/80 hover:text-white transition-colors cursor-pointer"
          title="Expand to Full Application"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Green Action Button */}
        <button
          onClick={() => {
            soundEngine.playClick()
            toggleTimer()
          }}
          className={`px-3 py-1.5 flex items-center gap-1 font-pixel text-[10px] font-bold border transition-all cursor-pointer ${
            isRunning
              ? 'bg-[#122e26] text-emerald-300 border-emerald-500/60 hover:bg-[#193d32]'
              : 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
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
              <span>START</span>
            </>
          )}
        </button>

        {/* Quick Done/Conquer (+XP) */}
        <button
          onClick={() => {
            soundEngine.playClick()
            conquerSprint()
          }}
          className="w-7 h-7 flex items-center justify-center bg-emerald-500/20 border border-emerald-500/60 hover:bg-emerald-500/40 text-emerald-400 cursor-pointer transition-colors"
          title="Conquer sprint early & claim XP"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>

      {/* RIGHT METRICS (Title with square dot, and Big Bold Countdown with remaining subtitle) */}
      <div className="flex flex-col items-end text-right pl-2 overflow-hidden flex-1 min-w-0">
        {/* Header row: [Title] (Duration) ■ */}
        <div className="flex items-center space-x-1.5 max-w-full overflow-hidden text-emerald-300 font-bold">
          <span className="text-[10px] text-emerald-400/80 truncate font-mono">
            {durationLabel}
          </span>
          <span className="text-[11px] truncate font-pixel text-emerald-300" title={objectiveName}>
            {objectiveName}
          </span>
          <span className="w-2 h-2 bg-emerald-400 shrink-0 shadow-[0_0_6px_#34d399]" />
        </div>

        {/* Big Countdown Row: 18:31 + remaining */}
        <div className="flex items-baseline space-x-1.5 mt-0.5">
          <span className="text-[9px] text-emerald-400/70 font-mono tracking-wider">
            REMAINING
          </span>
          <span className="text-2xl font-bold font-mono tracking-wider text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]">
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Bottom Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-950/60 overflow-hidden">
        <div
          className="h-full bg-emerald-400 shadow-[0_0_6px_#34d399] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
