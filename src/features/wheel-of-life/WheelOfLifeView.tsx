import React, { useState, useEffect, useRef } from 'react'
import {
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Check,
  Target,
  ArrowRight,
  Printer,
  Share2,
} from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { WheelOfLifeChart } from './WheelOfLifeChart'
import {
  LifePillar,
  WheelOfLifeData,
  loadWheelOfLifeData,
  saveWheelOfLifeData,
} from '@/lib/wheelOfLife'
import { soundEngine } from '@/lib/sound'
import { UserProfileDTO } from '@/types/ipc'

interface WheelOfLifeViewProps {
  profile: UserProfileDTO | null
  onNavigateTab?: (tab: any) => void
}

export const WheelOfLifeView: React.FC<WheelOfLifeViewProps> = ({
  profile,
  onNavigateTab,
}) => {
  const [data, setData] = useState<WheelOfLifeData>(loadWheelOfLifeData)
  const [isBlankMode, setIsBlankMode] = useState<boolean>(false)
  const [savedToast, setSavedToast] = useState<string | null>(null)
  const [highlightPillarId, setHighlightPillarId] = useState<string | undefined>(undefined)

  const printAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setData(loadWheelOfLifeData())
  }, [])

  const handleScoreChange = (pillarId: string, newScore: number) => {
    const updatedPillars = data.pillars.map((p) =>
      p.id === pillarId ? { ...p, score: Math.max(1, Math.min(10, newScore)) } : p
    )
    const updatedData: WheelOfLifeData = { ...data, pillars: updatedPillars }
    setData(updatedData)
    saveWheelOfLifeData(updatedData)
  }

  const handleActionStepChange = (pillarId: string, stepText: string) => {
    const updatedSteps = { ...data.actionSteps, [pillarId]: stepText }
    const updatedData: WheelOfLifeData = { ...data, actionSteps: updatedSteps }
    setData(updatedData)
    saveWheelOfLifeData(updatedData)
  }

  const togglePriority = (pillarId: string) => {
    soundEngine.playClick()
    let current = [...data.priorities]
    if (current.includes(pillarId)) {
      current = current.filter((id) => id !== pillarId)
    } else {
      if (current.length >= 3) {
        current = [...current.slice(1), pillarId]
      } else {
        current.push(pillarId)
      }
    }
    const updatedData: WheelOfLifeData = { ...data, priorities: current }
    setData(updatedData)
    saveWheelOfLifeData(updatedData)
  }

  const handleAutoSyncFromStats = () => {
    soundEngine.playAchievement()
    // Align core skills with available profile skill levels
    const updatedPillars = data.pillars.map((p) => {
      if (!profile?.skills) return p
      const matchingSkill = profile.skills.find(
        (s) =>
          s.name.toLowerCase() === p.id.toLowerCase() ||
          s.name.toLowerCase() === p.nameEn.toLowerCase()
      )
      if (matchingSkill) {
        const calculatedScore = Math.min(10, Math.max(2, matchingSkill.level + 2))
        return { ...p, score: calculatedScore }
      }
      return p
    })
    const updatedData: WheelOfLifeData = { ...data, pillars: updatedPillars }
    setData(updatedData)
    saveWheelOfLifeData(updatedData)
    showToast('Synced ratings with character level velocity!')
  }

  const handlePrintPdf = () => {
    soundEngine.playClick()
    window.print()
  }

  const showToast = (msg: string) => {
    setSavedToast(msg)
    setTimeout(() => setSavedToast(null), 3000)
  }

  // Calculate Overall Life Balance Index
  const totalScore = data.pillars.reduce((sum, p) => sum + p.score, 0)
  const avgBalance = (totalScore / data.pillars.length).toFixed(1)
  const balancePercentage = Math.round((totalScore / (data.pillars.length * 10)) * 100)

  // Priority pillar objects
  const priorityPillars = data.pillars.filter((p) => data.priorities.includes(p.id))

  return (
    <div className="space-y-6 pb-20 select-none relative font-mono text-xs">
      {/* Dev Scope scanlines overlay */}
      <div className="scanlines fixed inset-0 pointer-events-none opacity-15" />

      {/* Floating Save/Status Toast */}
      {savedToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-neon-cyan/20 border-2 border-neon-cyan px-4 py-2 text-neon-cyan font-pixel text-xs shadow-[0_0_20px_rgba(34,211,238,0.5)] flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-neon-yellow" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-card border-2 border-neon-cyan p-5 shadow-[0_0_25px_rgba(34,211,238,0.2)] relative overflow-hidden">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                LIFE BALANCE MATRIX
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-green border-neon-green/60 bg-neon-green/15 shadow-[0_0_8px_rgba(163,230,53,0.3)]">
                INDEX: {balancePercentage}%
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-pixel tracking-wider text-foreground">
              // WHEEL OF LIFE
            </h1>
            <p className="text-xs sm:text-sm text-neon-yellow/90 font-serif italic mt-1 text-right sm:text-left leading-relaxed">
              ( إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ )
            </p>
          </div>

          {/* Action Buttons: Export Image / PDF */}
          <div className="flex items-center gap-2 flex-wrap">
            <RetroButton
              variant="cyan"
              size="sm"
              pixelFont
              onClick={handlePrintPdf}
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              تحميل PDF / طباعة
            </RetroButton>

            <RetroButton
              variant="green"
              size="sm"
              pixelFont
              onClick={handleAutoSyncFromStats}
              title="Sync scores with in-game mission velocity"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              مزامنة المستويات
            </RetroButton>
          </div>
        </div>
      </div>

      {/* Main Grid: Left/Center Chart Preview + Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (lg:col-span-7): Wheel Preview & Next Phase Priorities */}
        <div className="lg:col-span-7 space-y-6">
          <div
            ref={printAreaRef}
            className="bg-card border-2 border-border shadow-[0_0_20px_rgba(0,0,0,0.5)] p-5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-neon-cyan" />
                <h3 className="font-pixel text-xs text-foreground tracking-wider">
                  معاينة العجلة // WHEEL PREVIEW
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-muted-foreground font-mono">
                  متوسط الرضا:{' '}
                  <strong className="text-neon-cyan font-bold font-pixel text-xs">
                    {avgBalance} / 10
                  </strong>
                </span>
              </div>
            </div>

            {/* The Wheel of Life Vector Chart */}
            <div className="flex justify-center items-center py-4 overflow-x-auto">
              <WheelOfLifeChart
                pillars={data.pillars}
                size={420}
                isBlankMode={isBlankMode}
                highlightPillarId={highlightPillarId}
                onPillarClick={(p) => setHighlightPillarId(p.id)}
              />
            </div>

            {/* Next Phase Priorities (أولويات للمرحلة القادمة - Exactly matching reference image) */}
            <div className="pt-6 border-t border-border mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-pixel text-xs text-neon-green tracking-wide">
                  // TOP 3 SPRINT PRIORITIES
                </h4>
                <span className="text-[9px] text-muted-foreground font-mono">
                  حدد 3 جوانب رئيسية للتركيز عليها
                </span>
              </div>

              <div className="space-y-3">
                {priorityPillars.map((pillar, idx) => {
                  const stepText = data.actionSteps[pillar.id] || ''
                  return (
                    <div
                      key={pillar.id}
                      className="p-3 bg-secondary/70 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neon-cyan/50 transition-colors"
                    >
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="w-6 h-6 rounded-none bg-neon-green text-black font-pixel text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-foreground text-xs">{pillar.nameAr}</p>
                          <p className="text-[9px] text-muted-foreground">{pillar.nameEn}</p>
                        </div>
                      </div>

                      {/* Next Action Step Input */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={stepText}
                          onChange={(e) => handleActionStepChange(pillar.id, e.target.value)}
                          placeholder="اكتب خطواتك القادمة لتحسين هذا الجانب..."
                          className="w-full bg-[#100b1d] border border-border px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-green font-mono"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Sliders Evaluation & Pillar Customizer */}
        <div className="lg:col-span-5 space-y-6">
          <RetroCard variant="accent-cyan" glow topStripe className="p-5">
            <RetroCardHeader className="pb-3 border-b border-border">
              <div>
                <RetroCardTitle pixelFont>قيم كل جانب // EVALUATE ASPECTS</RetroCardTitle>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  من 1 إلى 10: كم أنت راضٍ عن هذا الجانب اليوم؟
                </p>
              </div>
            </RetroCardHeader>

            {/* Sliders for Each Aspect */}
            <div className="space-y-3.5 py-3">
              {data.pillars.map((pillar) => {
                const isSelectedPriority = data.priorities.includes(pillar.id)

                return (
                  <div
                    key={pillar.id}
                    className={`p-2.5 bg-secondary/80 border transition-all ${
                      isSelectedPriority
                        ? 'border-neon-green shadow-[0_0_10px_rgba(163,230,53,0.2)]'
                        : 'border-border hover:border-muted-foreground/60'
                    }`}
                    onMouseEnter={() => setHighlightPillarId(pillar.id)}
                    onMouseLeave={() => setHighlightPillarId(undefined)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      {/* Score Value Pill */}
                      <span className="font-pixel text-xs text-neon-cyan font-bold px-1.5 py-0.5 bg-card border border-border">
                        {pillar.score}
                      </span>

                      {/* Pillar Title (Arabic + English) */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground block">
                          {pillar.nameAr}
                        </span>
                        <span className="text-[8px] text-muted-foreground uppercase">
                          {pillar.nameEn}
                        </span>
                      </div>
                    </div>

                    {/* Range Slider Track */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={pillar.score}
                        onChange={(e) => handleScoreChange(pillar.id, Number(e.target.value))}
                        className="w-full accent-neon-cyan cursor-pointer"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Blank Wheel Mode Checkbox */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={isBlankMode}
                  onChange={(e) => setIsBlankMode(e.target.checked)}
                  className="accent-neon-cyan w-4 h-4 cursor-pointer"
                />
                <span>عجلة فارغة لألونها بيدي (Blank Blueprint)</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick()
                  setData(loadWheelOfLifeData())
                  showToast('Reset to defaults')
                }}
                className="text-[9px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                title="Reset values"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            </div>

            {/* Select Priorities Quick Bar (أولوياتك) */}
            <div className="pt-4 border-t border-border mt-3">
              <label className="text-[10px] font-pixel text-neon-green block mb-2">
                أولوياتك // SELECT 3 SPRINT FOCUSES:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {data.pillars.map((pillar) => {
                  const isSelected = data.priorities.includes(pillar.id)
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      onClick={() => togglePriority(pillar.id)}
                      className={`px-2 py-1 text-[9px] font-mono font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neon-green text-black border-neon-green shadow-[0_0_8px_rgba(163,230,53,0.4)]'
                          : 'bg-card text-muted-foreground border-border hover:border-foreground'
                      }`}
                    >
                      {pillar.nameAr}
                    </button>
                  )
                })}
              </div>
            </div>
          </RetroCard>
        </div>
      </div>
    </div>
  )
}
