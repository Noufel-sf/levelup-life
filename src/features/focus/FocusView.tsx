import React from 'react'
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Target,
  Crosshair,
  Coffee,
  ExternalLink,
} from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroProgressBar } from '@/components/8bit/RetroProgressBar'
import { useFocus, TimerMode, MODE_CONFIGS } from '@/context/FocusContext'
import { soundEngine } from '@/lib/sound'
import { UserProfileDTO } from '@/types/ipc'

interface FocusViewProps {
  profile: UserProfileDTO | null
  onRefreshProfile?: () => void
}

export const FocusView: React.FC<FocusViewProps> = ({ profile }) => {
  const {
    mode,
    timeFormatted,
    isRunning,
    progressPercent,
    tasks,
    selectedTaskId,
    selectedTask,
    customGoal,
    stats,
    completedSession,
    setMode,
    setSelectedTaskId,
    setCustomGoal,
    toggleTimer,
    resetTimer,
    conquerSprint,
    enterMiniMode,
    dismissCompletedSession,
  } = useFocus()

  // Find Focus Skill from user profile
  const focusSkill = profile?.skills?.find((s) => s.name.toLowerCase() === 'focus')

  return (
    <div className="space-y-6 pb-20 select-none relative">
      {/* Background ambient glowing cyber spots */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-neon-pink/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-neon-cyan/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Completion Modal / Celebration Toast */}
      {completedSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-card border-2 border-neon-pink shadow-[0_0_40px_rgba(236,72,153,0.5)] p-6 max-w-md w-full relative text-center font-mono space-y-4">
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-yellow shadow-[0_0_8px_#facc15]" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />

            <div className="w-16 h-16 bg-neon-pink/20 border-2 border-neon-pink mx-auto flex items-center justify-center text-neon-pink shadow-[0_0_20px_rgba(236,72,153,0.6)] animate-bounce">
              <Flame className="w-8 h-8" />
            </div>

            <div>
              <p className="font-pixel text-[11px] text-neon-yellow tracking-widest uppercase">
                HYPER-FOCUS SPRINT CONQUERED!
              </p>
              <h2 className="font-pixel text-lg text-foreground mt-1 tracking-wide">
                +{completedSession.xp} FOCUS XP EARNED
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Objective: <span className="text-neon-cyan font-bold">{completedSession.label}</span>
              </p>
            </div>

            <div className="p-3 bg-secondary/60 border border-border text-[11px] text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Focus Attribute:</span>
                <span className="text-neon-pink font-bold">
                  {focusSkill?.name} (Lv.{focusSkill?.level || 1})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Deep Work:</span>
                <span className="text-neon-cyan font-bold">{stats.todayCount} Sprints Completed</span>
              </div>
            </div>

            <RetroButton
              variant="pink"
              size="md"
              pixelFont
              className="w-full"
              onClick={() => {
                dismissCompletedSession()
                setMode('BREAK_5')
              }}
            >
              TAKE 5M RECHARGE BREAK (+RECOVERY)
            </RetroButton>
          </div>
        </div>
      )}

      {/* Cyberdeck Hero Banner */}
      <div className="bg-card border-2 border-neon-pink p-5 shadow-[0_0_25px_rgba(236,72,153,0.2)] relative overflow-hidden">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Crosshair className="w-4 h-4 text-neon-pink animate-spin" />
              <span className="font-pixel text-xs text-neon-pink uppercase tracking-widest">
                NEURAL FOCUS CYBERDECK // DEEP WORK RUNNER
              </span>
            </div>
            <h1 className="font-pixel text-base text-foreground tracking-wide">
              POMODORO ATTRIBUTE ACCELERATOR
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Single-task deep work sprints synthesize mental focus and channel XP directly into your Focus attribute.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Float Above Screens Widget Button */}
            <RetroButton
              variant="cyan"
              size="sm"
              pixelFont
              onClick={enterMiniMode}
              title="Shrink into an Always-On-Top Mini Widget floating above all your other applications"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              FLOAT ABOVE SCREENS
            </RetroButton>

            {/* Quick HUD Metrics */}
            <div className="bg-secondary/70 p-2.5 border border-border text-center min-w-[80px]">
              <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Today Sprints</span>
              <span className="text-sm font-pixel text-neon-cyan font-bold">{stats.todayCount}</span>
            </div>
            <div className="bg-secondary/70 p-2.5 border border-border text-center min-w-[80px]">
              <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Focus XP</span>
              <span className="text-sm font-pixel text-neon-yellow font-bold">+{stats.todayXp} XP</span>
            </div>
            <div className="bg-secondary/70 p-2.5 border border-border text-center min-w-[80px]">
              <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Focus Attribute</span>
              <span className="text-sm font-pixel text-neon-pink font-bold">Lv.{focusSkill?.level || 1}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer Cockpit */}
        <div className="lg:col-span-2 space-y-5">
          {/* Mode Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-card border-2 border-border p-2">
            {(Object.keys(MODE_CONFIGS) as TimerMode[]).map((mKey) => {
              const cfg = MODE_CONFIGS[mKey]
              const isSelected = mode === mKey
              return (
                <button
                  key={mKey}
                  onClick={() => setMode(mKey)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? `bg-secondary ${cfg.color} shadow-[0_0_12px_rgba(236,72,153,0.3)]`
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {cfg.isBreak ? <Coffee className="w-3.5 h-3.5 text-neon-green" /> : <Flame className="w-3.5 h-3.5 text-neon-pink" />}
                  <span>{cfg.label}</span>
                </button>
              )
            })}
          </div>

          {/* Big Arcade Display Cockpit */}
          <div className="bg-card border-2 border-neon-cyan p-8 shadow-[0_0_35px_rgba(34,211,238,0.25)] relative text-center overflow-hidden">
            {/* CRT Scanline glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/5 to-transparent pointer-events-none animate-pulse" />

            {/* Current Objective Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/80 border border-border font-mono text-xs text-muted-foreground mb-6">
              <Target className="w-3.5 h-3.5 text-neon-pink" />
              <span>ACTIVE OBJECTIVE:</span>
              <span className="text-foreground font-bold">
                {selectedTask ? selectedTask.title : customGoal || 'Freeform Deep Work Sprint'}
              </span>
            </div>

            {/* Digital Timer Readout */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Circular SVG Gauge */}
              <div className="relative w-72 h-72 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="stroke-secondary"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  {/* Glowing progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className={MODE_CONFIGS[mode].isBreak ? 'stroke-neon-green' : 'stroke-neon-pink'}
                    strokeWidth="4"
                    strokeDasharray={276.46}
                    strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>

                {/* Inner Readout */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-pixel text-5xl text-foreground tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    {timeFormatted}
                  </span>
                  <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest mt-2 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-neon-green animate-ping' : 'bg-neon-yellow'}`} />
                    {isRunning ? 'CHRONO RUNNING' : 'SYSTEM PAUSED'}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground mt-1">
                    {progressPercent}% Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-3 pt-4">
              <RetroButton
                variant={isRunning ? 'secondary' : 'pink'}
                size="lg"
                pixelFont
                onClick={toggleTimer}
                className="min-w-[140px]"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    PAUSE SPRINT
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    START SPRINT
                  </>
                )}
              </RetroButton>

              <RetroButton variant="ghost" size="lg" onClick={resetTimer}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset
              </RetroButton>

              <RetroButton
                variant="cyan"
                size="lg"
                pixelFont
                onClick={conquerSprint}
                title="Conquer sprint early and award XP"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Conquer (+XP)
              </RetroButton>
            </div>
          </div>
        </div>

        {/* Right Col: Objective Lock & Attributes */}
        <div className="space-y-5">
          {/* Mission Lock Card */}
          <RetroCard variant="accent-pink">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-neon-pink" />
                <RetroCardTitle pixelFont>LOCK TARGET MISSION</RetroCardTitle>
              </div>
            </RetroCardHeader>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase font-bold mb-1">
                  Select Pending Mission:
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => {
                    soundEngine.playClick()
                    setSelectedTaskId(e.target.value)
                  }}
                  className="w-full bg-card border border-border px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-neon-pink"
                >
                  <option value="">-- No Mission Linked (Custom Deep Work) --</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.priority} • +{t.xpReward} XP)
                    </option>
                  ))}
                </select>
              </div>

              {!selectedTaskId && (
                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase font-bold mb-1">
                    Or Enter Custom Focus Goal:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Study React internals, write design spec..."
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    className="w-full bg-secondary border border-border px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon-cyan font-mono"
                  />
                </div>
              )}

              {selectedTask && (
                <div className="p-3 bg-secondary/70 border border-neon-pink/40 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate">{selectedTask.title}</span>
                    <RetroBadge variant="pink" pixelFont className="text-[7px]">
                      +{selectedTask.xpReward} XP
                    </RetroBadge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Finishing the sprint allows you to complete this quest with double XP!
                  </p>
                </div>
              )}
            </div>
          </RetroCard>

          {/* Focus Attribute Matrix Card */}
          <RetroCard variant="accent-cyan">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-neon-cyan" />
                <RetroCardTitle pixelFont>FOCUS ATTRIBUTE MATRIX</RetroCardTitle>
              </div>
              <RetroBadge variant="cyan" pixelFont>
                Lv.{focusSkill?.level || 1}
              </RetroBadge>
            </RetroCardHeader>

            <div className="space-y-3 font-mono text-xs">
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Deep Work sprints directly feed Experience Points into the character's Focus attribute. Higher Focus tiers unlock specialized trophy ranks.
              </p>

              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>FOCUS XP PROGRESSION:</span>
                  <span className="text-neon-cyan font-bold">
                    {(focusSkill?.xp || 0) % 100} / 100 XP
                  </span>
                </div>
                <RetroProgressBar value={(focusSkill?.xp || 0) % 100} max={100} variant="cyan" />
              </div>

              <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 bg-secondary/50 border border-border">
                  <span className="text-muted-foreground block uppercase">Total Focus XP</span>
                  <span className="text-neon-yellow font-bold">+{stats.totalFocusXp} XP</span>
                </div>
                <div className="p-2 bg-secondary/50 border border-border">
                  <span className="text-muted-foreground block uppercase">All-Time Sprints</span>
                  <span className="text-neon-pink font-bold">{stats.totalSessions} Sessions</span>
                </div>
              </div>
            </div>
          </RetroCard>
        </div>
      </div>
    </div>
  )
}
