import React from 'react'
import {
  Brain,
  Crosshair,
  Target,
  Heart,
  Palette,
  Users,
  Zap,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { UserProfileDTO, SkillDTO } from '@/types/ipc'
import { soundEngine } from '@/lib/sound'

interface DashboardSkillsCardProps {
  profile: UserProfileDTO | null
  onNavigateTab?: (tab: any) => void
}

const SKILL_ICONS: Record<string, any> = {
  Knowledge: Brain,
  Focus: Crosshair,
  Discipline: Target,
  Health: Heart,
  Creativity: Palette,
  Social: Users,
}

const SKILL_COLORS: Record<string, { stroke: string; text: string; bg: string; border: string; glow: string }> = {
  Knowledge: {
    stroke: '#a855f7',
    text: 'text-primary',
    bg: 'bg-primary/15',
    border: 'border-primary/40',
    glow: 'rgba(168,85,247,0.3)',
  },
  Focus: {
    stroke: '#22d3ee',
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/15',
    border: 'border-neon-cyan/40',
    glow: 'rgba(34,211,238,0.3)',
  },
  Discipline: {
    stroke: '#facc15',
    text: 'text-neon-yellow',
    bg: 'bg-neon-yellow/15',
    border: 'border-neon-yellow/40',
    glow: 'rgba(250,204,21,0.3)',
  },
  Health: {
    stroke: '#a3e635',
    text: 'text-neon-green',
    bg: 'bg-neon-green/15',
    border: 'border-neon-green/40',
    glow: 'rgba(163,230,53,0.3)',
  },
  Creativity: {
    stroke: '#ec4899',
    text: 'text-neon-pink',
    bg: 'bg-neon-pink/15',
    border: 'border-neon-pink/40',
    glow: 'rgba(236,72,153,0.3)',
  },
  Social: {
    stroke: '#38bdf8',
    text: 'text-sky-400',
    bg: 'bg-sky-500/15',
    border: 'border-sky-400/40',
    glow: 'rgba(56,189,248,0.3)',
  },
}

export const DashboardSkillsCard: React.FC<DashboardSkillsCardProps> = ({
  profile,
  onNavigateTab,
}) => {
  const skills: SkillDTO[] = profile?.skills || []

  // Calculate totals
  const totalSkillXp = skills.reduce((sum, s) => sum + s.xp, 0)
  const totalLevels = skills.reduce((sum, s) => sum + s.level, 0)
  const avgLevel = skills.length > 0 ? (totalLevels / skills.length).toFixed(1) : '1.0'

  // Radial chart configuration (concentric arcs like Apple Health / DealDeck reference)
  const size = 160
  const center = size / 2
  const strokeWidth = 7
  const ringGap = 9
  const baseRadius = 24

  return (
    <div className="bg-card border-2 border-neon-cyan shadow-[0_0_25px_rgba(34,211,238,0.2)] p-4 relative font-mono overflow-hidden">
      {/* Retro scanline accent dots */}
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
      <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899]" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neon-cyan/40 mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.4)]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-pixel text-xs text-neon-cyan tracking-wider flex items-center gap-1.5">
              LIFE SKILLS MATRIX
            </h3>
            <p className="text-[9px] text-muted-foreground font-mono">
              Attribute Mastery & XP Velocity
            </p>
          </div>
        </div>

        {/* View Full Skill Tree Navigation Button */}
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick()
              onNavigateTab('progress')
            }}
            className="flex items-center gap-1 text-[9px] font-pixel text-neon-cyan hover:text-white bg-neon-cyan/10 hover:bg-neon-cyan/25 border border-neon-cyan/50 px-2 py-1 transition-all cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.2)]"
            title="Open comprehensive RPG Skill Tree & Trophy matrix"
          >
            <span>FULL TREE</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Concentric Rings Visual Chart Area (Matching Reference Layout) */}
      <div className="flex items-center justify-between gap-3 p-3 bg-secondary/60 border border-border/80 mb-4 relative">
        {/* Concentric Arcs Chart */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {skills.map((skill, idx) => {
              const radius = baseRadius + idx * ringGap
              const circumference = 2 * Math.PI * radius
              const percent = Math.min(Math.max((skill.xp % 100) / 100, 0.08), 1)
              const dashoffset = circumference * (1 - percent)
              const c = SKILL_COLORS[skill.name] || { stroke: '#a855f7' }

              return (
                <g key={skill.id}>
                  {/* Background Track */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#1e1832"
                    strokeWidth={strokeWidth}
                  />
                  {/* Glowing Active Arc */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={c.stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.8s ease-in-out',
                      filter: `drop-shadow(0 0 3px ${c.stroke})`,
                    }}
                  />
                </g>
              )
            })}
          </svg>

          {/* Central RPG Core Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
              ATTRIBUTES
            </span>
            <span className="font-pixel text-xs text-foreground font-bold leading-tight">
              {skills.length}
            </span>
          </div>
        </div>

        {/* Highlight Score & Growth Metric (Matching DealDeck's 9.829 Metric) */}
        <div className="flex-1 min-w-0 text-right space-y-1">
          <div className="font-pixel text-2xl font-bold tracking-wider text-neon-cyan drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
            {totalSkillXp.toLocaleString()}
          </div>
          <p className="text-[9px] font-mono uppercase text-muted-foreground font-bold tracking-wider">
            Total Skill XP
          </p>

          <div className="flex justify-end pt-1">
            <span className="inline-flex items-center gap-1 text-[8px] font-pixel font-bold px-2 py-0.5 bg-neon-green/15 text-neon-green border border-neon-green/40 shadow-[0_0_8px_rgba(163,230,53,0.3)]">
              <Sparkles className="w-2.5 h-2.5 text-neon-yellow" />
              Avg Lv.{avgLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Skill Breakdown (Matching Reference Item List: Electronic, Games, Furniture) */}
      <div className="space-y-2">
        {skills.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3 font-mono">
            No attributes configured.
          </p>
        ) : (
          skills.map((skill) => {
            const Icon = SKILL_ICONS[skill.name] || Zap
            const c = SKILL_COLORS[skill.name] || {
              stroke: '#a855f7',
              text: 'text-primary',
              bg: 'bg-primary/15',
              border: 'border-primary/40',
              glow: 'rgba(168,85,247,0.3)',
            }
            const currentProgress = skill.xp % 100

            return (
              <div
                key={skill.id}
                onClick={() => {
                  soundEngine.playClick()
                  if (onNavigateTab) onNavigateTab('progress')
                }}
                className={`flex items-center justify-between p-2.5 bg-secondary/80 border ${c.border} hover:bg-secondary/95 hover:border-neon-cyan/80 hover:shadow-sm transition-all cursor-pointer group`}
                title={`${skill.name} — Click to inspect in Progress Tree`}
              >
                {/* Left: Icon & Skill Name */}
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 flex items-center justify-center border ${c.bg} ${c.border} ${c.text} shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold text-foreground truncate group-hover:text-neon-cyan transition-colors">
                      {skill.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono">
                      {skill.xp} Lifetime XP
                    </p>
                  </div>
                </div>

                {/* Right: Level & Progress Pill */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-pixel text-[10px] text-foreground font-bold">
                    Lv.{skill.level}
                  </span>

                  <span
                    className={`text-[8px] font-mono px-2 py-0.5 border font-bold ${
                      currentProgress >= 50
                        ? 'text-neon-green border-neon-green/50 bg-neon-green/15'
                        : `${c.text} ${c.border} ${c.bg}`
                    }`}
                  >
                    +{currentProgress}%
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
