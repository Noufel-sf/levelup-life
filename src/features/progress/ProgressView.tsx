import React, { useEffect, useState } from 'react'
import { TrendingUp, Shield, Zap, Award } from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { UserProfileDTO, XPTransactionDTO } from '@/types/ipc'

interface ProgressViewProps {
  profile: UserProfileDTO | null
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile }) => {
  const [history, setHistory] = useState<XPTransactionDTO[]>([])

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getXPHistory(10).then((res) => setHistory(res || []))
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm sm:text-base font-bold text-foreground font-pixel tracking-wider">Character Progression & Analytics</h2>
        <p className="text-xs text-muted">Auditable ledger of your life achievements and gained experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RetroCard variant="accent-purple">
          <p className="text-[10px] font-mono text-muted uppercase">Total XP Acquired</p>
          <p className="font-pixel text-xl text-primary mt-1">{profile?.totalXp || 0} XP</p>
        </RetroCard>

        <RetroCard variant="accent-pink">
          <p className="text-[10px] font-mono text-muted uppercase">Character Tier</p>
          <p className="font-pixel text-lg text-arcade-pink mt-1">Level {profile?.level || 1}</p>
        </RetroCard>

        <RetroCard variant="accent-cyan">
          <p className="text-[10px] font-mono text-muted uppercase">Rank Title</p>
          <p className="font-pixel text-xs text-cyber-cyan mt-1 truncate">{profile?.title || 'Adventurer'}</p>
        </RetroCard>
      </div>

      <RetroCard variant="default">
        <RetroCardHeader>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-caution-amber" />
            <RetroCardTitle pixelFont>XP TRANSACTION LOG</RetroCardTitle>
          </div>
        </RetroCardHeader>

        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-muted text-center py-6">No XP transactions logged yet.</p>
          ) : (
            history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-2.5 bg-elevated border border-border text-xs">
                <div>
                  <span className="font-semibold text-foreground">{tx.description}</span>
                  <span className="text-[10px] text-muted ml-2 font-mono">[{tx.sourceType}]</span>
                </div>
                <RetroBadge variant="green" pixelFont>
                  +{tx.amount} XP
                </RetroBadge>
              </div>
            ))
          )}
        </div>
      </RetroCard>
    </div>
  )
}

