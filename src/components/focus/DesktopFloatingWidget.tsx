import React from 'react'
import {
  Play,
  Pause,
  Maximize2,
  CheckCircle2,
  Flame,
  Volume2,
  VolumeX,
  Crosshair,
  GripHorizontal,
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

  const [isMuted, setIsMuted] = React.useState(soundEngine.isMuted())

  React.useEffect(() => {
    return soundEngine.subscribe((muted) => setIsMuted(muted))
  }, [])

  const objectiveName = selectedTask ? selectedTask.title : customGoal || MODE_CONFIGS[mode].label

  return (
    <div className="h-screen w-screen bg-[#0e0c18] border-2 border-neon-cyan shadow-[0_0_25px_rgba(34,211,238,0.5)] select-none overflow-hidden flex flex-col justify-between p-2 relative font-mono text-xs">
      {/* DEV SCOPE Scanlines */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-25" />

      {/* Top Drag Handle Bar (Draggable across all screens) */}
      <div className="app-drag-region flex items-center justify-between pb-1 border-b border-border/70 cursor-move">
        <div className="flex items-center space-x-1.5 no-drag">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_6px_#a3e635] animate-pulse" />
          <span className="font-pixel text-[8px] text-neon-cyan tracking-wider">
            FOCUS // HUD
          </span>
          <span className="text-[8px] text-muted-foreground truncate max-w-[130px]" title={objectiveName}>
            • {objectiveName}
          </span>
        </div>

        <div className="flex items-center space-x-1 no-drag">
          <button
            onClick={() => soundEngine.toggleMute()}
            className="p-1 text-muted-foreground hover:text-neon-cyan cursor-pointer transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-neon-cyan" />}
          </button>
          <button
            onClick={exitMiniMode}
            className="p-1 text-muted-foreground hover:text-white hover:bg-secondary cursor-pointer transition-colors"
            title="Expand to Full Application"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Countdown & Control Row */}
      <div className="flex items-center justify-between px-1 pt-1">
        {/* Time & Mode readout */}
        <div className="flex items-baseline space-x-2">
          <span className="font-pixel text-2xl text-foreground tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
            {timeFormatted}
          </span>
          <span className="text-[8px] font-mono text-neon-pink uppercase tracking-widest">
            {MODE_CONFIGS[mode].isBreak ? '[RECHARGE]' : '[SPRINT]'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={toggleTimer}
            className={`px-2.5 py-1 text-[10px] font-pixel border cursor-pointer transition-all flex items-center gap-1 ${
              isRunning
                ? 'bg-secondary text-foreground border-border hover:border-foreground'
                : 'bg-neon-pink text-black border-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.5)]'
            }`}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isRunning ? 'PAUSE' : 'START'}</span>
          </button>

          <button
            onClick={conquerSprint}
            className="px-2 py-1 bg-neon-cyan/20 border border-neon-cyan hover:bg-neon-cyan/40 text-neon-cyan text-[10px] font-pixel cursor-pointer transition-all"
            title="Conquer sprint & award XP"
          >
            <CheckCircle2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Mini Progress Bar */}
      <div className="w-full bg-secondary h-1 overflow-hidden mt-1">
        <div
          className={`h-full transition-all duration-300 ${
            MODE_CONFIGS[mode].isBreak ? 'bg-neon-green shadow-[0_0_6px_#a3e635]' : 'bg-neon-cyan shadow-[0_0_6px_#22d3ee]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
