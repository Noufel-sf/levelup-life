import React, { useState, useEffect } from 'react'
import { Compass, ChevronRight, Sparkles } from 'lucide-react'
import { WheelOfLifeChart } from '@/features/wheel-of-life/WheelOfLifeChart'
import { loadWheelOfLifeData, WheelOfLifeData } from '@/lib/wheelOfLife'
import { soundEngine } from '@/lib/sound'
import { UserProfileDTO } from '@/types/ipc'

interface DashboardSkillsCardProps {
  profile: UserProfileDTO | null
  onNavigateTab?: (tab: any) => void
}

export const DashboardSkillsCard: React.FC<DashboardSkillsCardProps> = ({
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

  const handleOpenWheel = () => {
    soundEngine.playClick()
    if (onNavigateTab) onNavigateTab('wheel')
  }

  return (
    <div
      onClick={handleOpenWheel}
      className="bg-card border-2 border-neon-cyan/70 hover:border-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.18)] hover:shadow-[0_0_28px_rgba(34,211,238,0.32)] p-4 relative font-mono overflow-hidden cursor-pointer group transition-all select-none"
      title="Click to open and customize the full Wheel of Life"
    >
      {/* Retro scanline accent dots */}
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
      <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899]" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/80 mb-3">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-7 h-7 bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.4)] shrink-0 group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-pixel text-xs text-neon-cyan tracking-wider truncate">
              WHEEL OF LIFE
            </h3>
            <p className="text-[9px] text-muted-foreground truncate">
              عجلة حياتي // 10 Dimensions
            </p>
          </div>
        </div>

        {/* Harmony Index Badge */}
        <div className="shrink-0 pl-2">
          <span className="inline-flex items-center gap-1 text-[9px] font-pixel font-bold px-2 py-0.5 bg-neon-green/15 text-neon-green border border-neon-green/50 shadow-[0_0_8px_rgba(163,230,53,0.3)]">
            <Sparkles className="w-2.5 h-2.5 text-neon-yellow" />
            {balancePercentage}%
          </span>
        </div>
      </div>

      {/* The Circle Alone (Centered, Uncluttered Hero) */}
      <div className="py-2 flex items-center justify-center relative">
        <div className="group-hover:scale-105 transition-transform duration-300">
          <WheelOfLifeChart pillars={data.pillars} size={210} isCompact />
        </div>
      </div>

      {/* Clean Simplified Footer */}
      <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[9px] text-muted-foreground">
        <span>Average: <strong className="text-neon-cyan font-bold">{avgScore} / 10</strong></span>
        <span className="text-neon-cyan group-hover:text-white font-pixel flex items-center gap-1 transition-colors">
          <span>EXPAND</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  )
}
