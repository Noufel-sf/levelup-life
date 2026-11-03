import React, { useEffect } from 'react'
import { Award, Sparkles, X, Trophy } from 'lucide-react'
import { AchievementDTO } from '@/types/ipc'

interface AchievementToastProps {
  achievement: AchievementDTO | null
  onClose: () => void
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  useEffect(() => {
    if (!achievement) return
    const timer = setTimeout(() => {
      onClose()
    }, 7000)
    return () => clearTimeout(timer)
  }, [achievement, onClose])

  if (!achievement) return null

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100vw-2rem)] animate-in slide-in-from-top-6 duration-300">
      <div className="bg-[#121215]/95 border-2 border-neon-yellow shadow-[0_0_35px_rgba(250,204,21,0.5)] p-4 relative overflow-hidden backdrop-blur-md">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-yellow shadow-[0_0_8px_#facc15]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-neon-yellow/20 border-2 border-neon-yellow flex items-center justify-center text-neon-yellow shadow-[0_0_12px_rgba(250,204,21,0.5)] shrink-0 animate-bounce">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-neon-yellow" />
                <span className="font-pixel text-[9px] text-neon-yellow uppercase tracking-widest">
                  TROPHY UNLOCKED // [{achievement.category}]
                </span>
              </div>
              <h3 className="font-pixel text-xs text-foreground font-bold tracking-wide">
                {achievement.name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {achievement.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-2 py-0.5 bg-neon-green/20 border border-neon-green text-neon-green font-pixel text-[8px] shadow-[0_0_8px_rgba(163,230,53,0.3)]">
              +{achievement.xpReward} XP
            </span>
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
