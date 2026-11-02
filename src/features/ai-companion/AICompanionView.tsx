import React from 'react'
import { Bot, Sparkles, Send } from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroInput } from '@/components/8bit/RetroInput'

export const AICompanionView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Companion — Gemini Core</h2>
          <p className="text-xs text-muted">Goal decomposition, realistic day planning & adaptive rescheduling</p>
        </div>
        <RetroBadge variant="cyan" pixelFont>
          PHASE 4 ENGINE
        </RetroBadge>
      </div>

      <RetroCard variant="accent-cyan">
        <RetroCardHeader>
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-cyber-cyan" />
            <RetroCardTitle pixelFont>SYNTH COMPANION READY</RetroCardTitle>
          </div>
        </RetroCardHeader>

        <div className="p-4 bg-elevated border border-border space-y-3">
          <p className="text-xs text-foreground leading-relaxed">
            "Greetings! I am connected to the protected Electron main service. Configure your Gemini API key in Settings, and I will decompose your complex goals into daily missions."
          </p>

          <div className="flex space-x-2">
            <RetroInput placeholder="Ask companion (e.g., 'Break down learning Rust into a 4-week quest')..." />
            <RetroButton variant="cyan" pixelFont size="sm">
              <Send className="w-3.5 h-3.5" />
            </RetroButton>
          </div>
        </div>
      </RetroCard>
    </div>
  )
}

