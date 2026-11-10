import React, { useState, useEffect } from 'react'
import { Target, ChevronRight, Sparkles, Compass } from 'lucide-react'
import { WheelOfLifeChart } from '@/features/wheel-of-life/WheelOfLifeChart'
import { loadWheelOfLifeData, WheelOfLifeData } from '@/lib/wheelOfLife'
import { soundEngine } from '@/lib/sound'
import { UserProfileDTO } from '@/types/ipc'

interface DashboardSkillsCardProps {
  profile: UserProfileDTO | null
  onNavigateTab?: (tab: any) => void
}

export const DashboardSkillsCard: React.FC<DashboardSkillsCardProps> = ({
  profile,
  onNavigateTab,
}) => {
  const [data, setData] = useState<WheelOfLifeData>(loadWheelOfLifeData)

  useEffect(() => {
    setData(loadWheelOfLifeData())
  }, [])

  // Calculate Balance Metrics
  const totalScore = data.pillars.reduce((sum, p) => sum + p.score, 0)
  const avgScore = (totalScore / data.pillars.length).toFixed(1)
  const balancePercentage = Math.round((totalScore / (data.pillars.length * 10)) * 100)
  const priorityPillars = data.pillars.filter((p) => data.priorities.includes(p.id))

  const handleOpenWheel = () => {
    soundEngine.playClick()
    if (onNavigateTab) onNavigateTab('wheel')
  }

  return (
    <div className="bg-card border-2 border-neon-cyan shadow-[0_0_25px_rgba(34,211,238,0.2)] p-4 relative font-mono overflow-hidden">
      {/* Retro scanline accent dots */}
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
      <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899]" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neon-cyan/40 mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.4)]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-pixel text-xs text-neon-cyan tracking-wider flex items-center gap-1.5">
              عجلة الحياة // WHEEL OF LIFE
            </h3>
            <p className="text-[9px] text-muted-foreground font-mono">
              Life Balance Matrix & 10 Dimensions
            </p>
          </div>
        </div>

        {/* View Full Wheel Navigation Button */}
        {onNavigateTab && (
          <button
            type="button"
            onClick={handleOpenWheel}
            className="flex items-center gap-1 text-[9px] font-pixel text-neon-cyan hover:text-white bg-neon-cyan/10 hover:bg-neon-cyan/25 border border-neon-cyan/50 px-2 py-1 transition-all cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.2)]"
            title="Open comprehensive Wheel of Life page"
          >
            <span>FULL WHEEL</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Circle Alone Container (Centered, Clean, No description list below) */}
      <div
        onClick={handleOpenWheel}
        className="p-3 bg-secondary/60 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group hover:border-neon-cyan/70 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all"
        title="Click to customize and evaluate the full Wheel of Life"
      >
        {/* The Circle Alone */}
        <div className="shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <WheelOfLifeChart pillars={data.pillars} size={190} isCompact />
        </div>

        {/* Highlight Score & Priority Badges */}
        <div className="flex-1 min-w-0 text-center sm:text-right space-y-1.5 w-full">
          <div className="font-pixel text-2xl font-bold tracking-wider text-neon-cyan drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
            {balancePercentage}%
          </div>
          <p className="text-[9px] font-mono uppercase text-muted-foreground font-bold tracking-wider">
            Overall Harmony Index
          </p>

          <div className="flex justify-center sm:justify-end pt-1">
            <span className="inline-flex items-center gap-1 text-[8px] font-pixel font-bold px-2 py-0.5 bg-neon-green/15 text-neon-green border border-neon-green/40 shadow-[0_0_8px_rgba(163,230,53,0.3)]">
              <Sparkles className="w-2.5 h-2.5 text-neon-yellow" />
              Rating {avgScore} / 10
            </span>
          </div>

          {/* Top Priorities Tags */}
          <div className="pt-2 border-t border-border/50">
            <span className="text-[8px] text-muted-foreground font-mono block mb-1">
              أولوياتك الحالية:
            </span>
            <div className="flex flex-wrap justify-center sm:justify-end gap-1">
              {priorityPillars.map((p) => (
                <span
                  key={p.id}
                  className="text-[8px] font-mono px-1.5 py-0.2 border text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10"
                >
                  {p.nameAr}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
