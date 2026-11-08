import React from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Minimize2,
  Crosshair,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useFocus, TimerMode, MODE_CONFIGS } from '@/context/FocusContext'
import { RetroButton } from '@/components/8bit/RetroButton'
import { soundEngine } from '@/lib/sound'

interface DashboardPomodoroCardProps {
  onNavigateTab?: (tab: any) => void
}

export const DashboardPomodoroCard: React.FC<DashboardPomodoroCardProps> = ({
  onNavigateTab,
}) => {
  const {
    mode,
    timeFormatted,
    isRunning,
    progressPercent,
    toggleTimer,
    resetTimer,
    conquerSprint,
    enterMiniMode,
    setMode,
    selectedTask,
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    stats,
  } = useFocus()

  const activeModeConfig = MODE_CONFIGS[mode]

  const handleModeChange = (newMode: TimerMode) => {
    soundEngine.playClick()
    setMode(newMode)
  }

  return (
    <div className="bg-card border-2 border-neon-pink shadow-[0_0_25px_rgba(236,72,153,0.25)] p-4 relative font-mono overflow-hidden">
      {/* Corner retro accents */}
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />
      <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neon-pink/40 mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-neon-pink/20 border border-neon-pink flex items-center justify-center text-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.4)]">
            <Crosshair className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="font-pixel text-xs text-neon-pink tracking-wider flex items-center gap-1.5">
              NEURAL POMODORO
              <span
                className={`w-2 h-2 rounded-none inline-block ${
                  isRunning
                    ? 'bg-neon-green shadow-[0_0_8px_#a3e635] animate-pulse'
                    : 'bg-muted-foreground'
                }`}
              />
            </h3>
            <p className="text-[9px] text-muted-foreground font-mono">
              Quick Focus Runner & XP Sprints
            </p>
          </div>
        </div>

        {/* Float HUD Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            enterMiniMode()
          }}
          className="flex items-center gap-1 text-[9px] font-pixel text-neon-cyan hover:text-white bg-neon-cyan/10 hover:bg-neon-cyan/25 border border-neon-cyan/50 px-2 py-1 transition-all cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.2)]"
          title="Pop out Always-On-Top floating mini HUD"
        >
          <Minimize2 className="w-3 h-3" />
          <span>FLOAT</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {[
          { id: 'FOCUS_25' as TimerMode, label: '25m Sprint' },
          { id: 'FOCUS_45' as TimerMode, label: '45m Deep' },
          { id: 'BREAK_5' as TimerMode, label: '5m Break' },
        ].map((m) => {
          const isActive = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={`py-1.5 px-1 text-[9px] font-pixel uppercase font-bold border transition-all cursor-pointer text-center truncate ${
                isActive
                  ? 'bg-neon-pink text-black border-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                  : 'bg-secondary/70 text-muted-foreground border-border hover:border-neon-pink/50 hover:text-foreground'
              }`}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Digital Timer Centerpiece */}
      <div className="p-4 bg-secondary/80 border-2 border-border/80 text-center relative overflow-hidden mb-3.5 shadow-inner">
        {/* Background Scanline */}
        <div className="scanlines absolute inset-0 pointer-events-none opacity-20" />

        {/* Active Objective Tag */}
        <div className="text-[10px] text-muted-foreground mb-1 truncate px-2 font-mono">
          {selectedTask ? (
            <span className="text-neon-cyan font-bold">
              QUEST: {selectedTask.title}
            </span>
          ) : (
            <span>TARGET: {activeModeConfig.isBreak ? 'Neural Recharge' : 'Deep Focus Flow'}</span>
          )}
        </div>

        {/* Large Digital Countdown */}
        <div className="font-pixel text-3xl sm:text-4xl font-bold tracking-wider text-neon-pink drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] my-1">
          {timeFormatted}
        </div>

        {/* Thin Progress Bar */}
        <div className="w-full bg-[#100c1e] h-1.5 mt-2 overflow-hidden border border-border/50">
          <div
            className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Task Selection Dropdown */}
      <div className="mb-3.5">
        <label className="text-[9px] text-muted-foreground uppercase font-bold block mb-1">
          Channel Focus Into Mission:
        </label>
        <select
          value={selectedTaskId}
          onChange={(e) => {
            soundEngine.playClick()
            setSelectedTaskId(e.target.value)
          }}
          className="w-full bg-secondary border border-border px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-neon-pink cursor-pointer font-mono truncate"
        >
          <option value="">-- General Focus Session (+Focus XP) --</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              [{t.priority}] {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Action Controls Bar */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {/* Play / Pause Sprint */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            toggleTimer()
          }}
          className={`col-span-2 py-2 px-3 flex items-center justify-center gap-1.5 font-pixel text-[10px] font-bold border transition-all cursor-pointer ${
            isRunning
              ? 'bg-secondary text-neon-pink border-neon-pink/60 hover:bg-secondary/80'
              : 'bg-neon-pink text-black border-neon-pink hover:bg-neon-pink/90 shadow-[0_0_15px_rgba(236,72,153,0.5)]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START SPRINT</span>
            </>
          )}
        </button>

        {/* Conquer Early (+XP) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            conquerSprint()
          }}
          className="py-2 px-1 flex items-center justify-center gap-1 font-pixel text-[9px] font-bold bg-neon-green/15 text-neon-green border border-neon-green/50 hover:bg-neon-green/30 transition-all cursor-pointer shadow-[0_0_10px_rgba(163,230,53,0.3)]"
          title="Conquer sprint early & claim XP"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>CLAIM</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            resetTimer()
          }}
          className="py-2 px-1 flex items-center justify-center font-pixel text-[9px] bg-secondary/70 text-muted-foreground border border-border hover:border-foreground transition-all cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Telemetry Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border text-[9px] text-muted-foreground">
        <div className="flex items-center space-x-1.5">
          <Flame className="w-3 h-3 text-neon-yellow" />
          <span>
            Today: <strong className="text-neon-cyan font-bold">{stats.todayCount}</strong> sprints
          </span>
          <span>•</span>
          <span className="text-neon-green font-bold">+{stats.todayXp} XP</span>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick()
              onNavigateTab('focus')
            }}
            className="text-neon-pink hover:text-white flex items-center gap-1 font-bold cursor-pointer transition-colors"
          >
            <span>FULL DECK</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  )
}

