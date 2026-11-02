import React from 'react'
import { Calendar, Sparkles } from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroBadge } from '@/components/8bit/RetroBadge'

export const PlannerView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Mission Planning Grid</h2>
          <p className="text-xs text-muted">Weekly and daily timeline blocks</p>
        </div>
        <RetroBadge variant="cyan" pixelFont>
          PHASE 2 READY
        </RetroBadge>
      </div>

      <RetroCard variant="default">
        <RetroCardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary" />
            <RetroCardTitle pixelFont>WEEKLY TIMELINE</RetroCardTitle>
          </div>
        </RetroCardHeader>
        <div className="grid grid-cols-7 gap-2 min-h-[300px]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <div key={day} className="bg-elevated border border-border p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-arcade-pink">
                <span>{day}</span>
                <span className="text-muted text-[10px]">#{idx + 1}</span>
              </div>
              <div className="border border-dashed border-border/60 p-2 text-center text-[10px] text-muted min-h-[160px] flex items-center justify-center">
                Drag / Block Missions
              </div>
            </div>
          ))}
        </div>
      </RetroCard>
    </div>
  )
}

