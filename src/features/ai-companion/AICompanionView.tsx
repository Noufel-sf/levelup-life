import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  Sparkles,
  Send,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  ShieldAlert,
  Calendar,
  MessageSquare,
  Wand2,
  Award,
  TrendingUp,
  Flame,
  RefreshCw,
  Check,
} from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroInput } from '@/components/8bit/RetroInput'
import { soundEngine } from '@/lib/sound'
import { NavTab } from '@/components/layout/Sidebar'
import { WeeklyReviewDTO, AdaptiveRescheduleDTO } from '@/types/ipc'

interface AICompanionViewProps {
  onRefreshProfile?: () => void
  onNavigateTab?: (tab: NavTab) => void
}

type AITab = 'decompose' | 'planner-coach' | 'weekly-debrief' | 'adaptive-reschedule' | 'chat'

interface TaskSuggestion {
  title: string
  estimatedMin: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  xpReward: number
  scheduledDayOffset: number
}

interface MilestoneSuggestion {
  title: string
  description?: string
  order: number
  xpReward: number
  tasks: TaskSuggestion[]
}

interface DecomposedPlan {
  title: string
  description: string
  category: string
  targetWeeks: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  milestones: MilestoneSuggestion[]
}

interface ChatMessage {
  id: string
  sender: 'synth' | 'user'
  text: string
  timestamp: string
}

export const AICompanionView: React.FC<AICompanionViewProps> = ({
  onRefreshProfile,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<AITab>('decompose')
  const [hasApiKey, setHasApiKey] = useState<boolean>(false)

  // Goal Decomposition States
  const [goalPrompt, setGoalPrompt] = useState('')
  const [isDecomposing, setIsDecomposing] = useState(false)
  const [decomposedPlan, setDecomposedPlan] = useState<DecomposedPlan | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)

  // Daily Planner Coach States
  const [isAnalyzingDay, setIsAnalyzingDay] = useState(false)
  const [dailyPlanAdvice, setDailyPlanAdvice] = useState<any | null>(null)

  // Weekly Retrospective States
  const [isGeneratingReview, setIsGeneratingReview] = useState(false)
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReviewDTO | null>(null)

  // Adaptive Rescheduling States
  const [isAnalyzingReschedule, setIsAnalyzingReschedule] = useState(false)
  const [reschedulePlan, setReschedulePlan] = useState<AdaptiveRescheduleDTO | null>(null)
  const [isApplyingReschedules, setIsApplyingReschedules] = useState(false)
  const [rescheduleAppliedSuccess, setRescheduleAppliedSuccess] = useState(false)

  // Chat States
  const [chatInput, setChatInput] = useState('')
  const [isChatting, setIsChatting] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'synth',
      text: 'Greetings, Commander! I am Synth, your Gemini-powered tactical intelligence core. State your objective, request a daily schedule audit, or ask me to decompose any ambitious goal into achievable missions.',
      timestamp: 'ONLINE',
    },
  ])
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user has API key configured
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((s) => {
        setHasApiKey(Boolean(s?.geminiApiKey && s.geminiApiKey.trim().length > 0))
      })
    }
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Handle Goal Decomposition
  const handleDecompose = async (promptToUse?: string) => {
    const query = promptToUse || goalPrompt
    if (!query.trim() || !window.electronAPI) return

    setIsDecomposing(true)
    setDecomposedPlan(null)
    setDeploySuccess(false)

    try {
      const plan = await window.electronAPI.aiDecomposeGoal(query.trim())
      setDecomposedPlan(plan)
    } catch (err) {
      console.error('Failed to decompose goal:', err)
    } finally {
      setIsDecomposing(false)
    }
  }

  // Handle Deploying Decomposed Plan to SQLite
  const handleDeployPlan = async () => {
    if (!decomposedPlan || !window.electronAPI) return
    setIsDeploying(true)

    try {
      await window.electronAPI.aiDeployGoal(decomposedPlan)
      setDeploySuccess(true)
      onRefreshProfile?.()
    } catch (err) {
      console.error('Failed to deploy goal:', err)
    } finally {
      setIsDeploying(false)
    }
  }

  // Handle Daily Plan Analysis
  const handleAnalyzeDay = async () => {
    if (!window.electronAPI) return
    setIsAnalyzingDay(true)
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const advice = await window.electronAPI.aiSuggestDailyPlan(todayStr)
      setDailyPlanAdvice(advice)
    } catch (err) {
      console.error('Failed to analyze day:', err)
    } finally {
      setIsAnalyzingDay(false)
    }
  }

  // Handle Weekly Retrospective Generation
  const handleGenerateReview = async () => {
    if (!window.electronAPI?.aiGenerateWeeklyReview) return
    setIsGeneratingReview(true)
    try {
      const rep = await window.electronAPI.aiGenerateWeeklyReview()
      setWeeklyReview(rep)
      soundEngine.playLevelUp()
      onRefreshProfile?.()
    } catch (err) {
      console.error('Failed to generate weekly review:', err)
    } finally {
      setIsGeneratingReview(false)
    }
  }

  // Handle Adaptive Reschedule Scan
  const handleSuggestReschedule = async () => {
    if (!window.electronAPI?.aiSuggestAdaptiveReschedule) return
    setIsAnalyzingReschedule(true)
    setRescheduleAppliedSuccess(false)
    try {
      const plan = await window.electronAPI.aiSuggestAdaptiveReschedule()
      setReschedulePlan(plan)
      soundEngine.playClick()
    } catch (err) {
      console.error('Failed to suggest adaptive reschedule:', err)
    } finally {
      setIsAnalyzingReschedule(false)
    }
  }

  // Handle Batch Apply Reschedules
  const handleApplyReschedules = async () => {
    if (!window.electronAPI?.aiApplyAdaptiveReschedules || !reschedulePlan?.reschedules.length) return
    setIsApplyingReschedules(true)
    try {
      const res = await window.electronAPI.aiApplyAdaptiveReschedules(reschedulePlan.reschedules)
      if (res.success) {
        soundEngine.playAchievement()
        setRescheduleAppliedSuccess(true)
        setReschedulePlan(null)
        onRefreshProfile?.()
      }
    } catch (err) {
      console.error('Failed to apply reschedules:', err)
    } finally {
      setIsApplyingReschedules(false)
    }
  }

  // Handle Chat Submit
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !window.electronAPI || isChatting) return

    const userText = chatInput.trim()
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setIsChatting(true)

    try {
      // Build history for Gemini
      const history = chatMessages.slice(-8).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: m.text,
      }))

      const responseText = await window.electronAPI.aiChat(userText, history)
      const synthMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'synth',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setChatMessages((prev) => [...prev, synthMsg])
    } catch (err) {
      console.error('Chat error:', err)
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'synth',
          text: 'Error processing prompt. Please verify your Gemini API key in Settings.',
          timestamp: 'ERROR',
        },
      ])
    } finally {
      setIsChatting(false)
    }
  }

  const promptPresets = [
    'Master Rust & System Programming',
    'Run a 10K Marathon in 8 Weeks',
    'Build and Launch a SaaS MVP',
    'Learn Conversational Japanese',
    'Master Modern System Architecture',
  ]

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Hero Header */}
      <div className="bg-card border-2 border-neon-cyan p-5 shadow-[0_0_25px_rgba(34,211,238,0.2)] relative overflow-hidden">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                [ GEMINI 2.5 CORE ]
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">//</span>
              <span className="text-[10px] font-mono text-neon-pink font-bold">TACTICAL AI COMPANION</span>
            </div>

            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-wider text-foreground font-pixel leading-snug">
              AI COMPANION — GEMINI SYNTH CORE
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Decompose complex ambitions into RPG quest lines, audit daily schedules, and unlock execution velocity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasApiKey ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neon-green/15 border border-neon-green/50 text-neon-green text-[9px] font-mono tracking-widest shadow-[0_0_8px_rgba(163,230,53,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_6px_#a3e635] animate-pulse" />
                <span>GEMINI LIVE ACTIVE</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab?.('settings')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-neon-yellow/15 border border-neon-yellow/50 hover:bg-neon-yellow/25 text-neon-yellow text-[9px] font-mono tracking-widest transition-all cursor-pointer"
                title="Configure your Gemini API key in Settings"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-neon-yellow animate-pulse" />
                <span>OFFLINE DEMO (CONFIGURE KEY)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Mode Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('decompose')}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === 'decompose'
              ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan shadow-[0_0_12px_rgba(34,211,238,0.3)]'
              : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Goal Decomposition</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('planner-coach')
            if (!dailyPlanAdvice) handleAnalyzeDay()
          }}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === 'planner-coach'
              ? 'bg-neon-pink/20 text-neon-pink border-neon-pink shadow-[0_0_12px_rgba(236,72,153,0.3)]'
              : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Plan Analysis</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('weekly-debrief')
            if (!weeklyReview) handleGenerateReview()
          }}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === 'weekly-debrief'
              ? 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow shadow-[0_0_12px_rgba(250,204,21,0.3)]'
              : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Weekly Debrief Report</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('adaptive-reschedule')
            if (!reschedulePlan) handleSuggestReschedule()
          }}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === 'adaptive-reschedule'
              ? 'bg-neon-green/20 text-neon-green border-neon-green shadow-[0_0_12px_rgba(163,230,53,0.3)]'
              : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Adaptive Rescheduler</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-primary/20 text-primary border-primary shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Synth Terminal Chat</span>
        </button>
      </div>

      {/* TAB 1: Goal Decomposition */}
      {activeTab === 'decompose' && (
        <div className="space-y-5">
          {/* Input Card */}
          <RetroCard variant="accent-cyan" glow topStripe className="p-5">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-neon-cyan" />
                <RetroCardTitle pixelFont>SYNTH QUEST DECOMPOSER</RetroCardTitle>
              </div>
              <RetroBadge variant="cyan" pixelFont className="text-[7px]">
                STRUCTURED JSON PARSER
              </RetroBadge>
            </RetroCardHeader>

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                Enter any high-level objective. Gemini will analyze the domain, construct a sequential milestone hierarchy, and break it down into daily time-blocked missions with estimated effort and XP rewards.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <RetroInput
                    placeholder="e.g. Master Rust by building a WebAssembly compiler..."
                    value={goalPrompt}
                    onChange={(e) => setGoalPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleDecompose()
                    }}
                    disabled={isDecomposing}
                  />
                </div>
                <RetroButton
                  variant="cyan"
                  pixelFont
                  onClick={() => handleDecompose()}
                  disabled={isDecomposing || !goalPrompt.trim()}
                >
                  {isDecomposing ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Decomposing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Decompose Quest
                    </>
                  )}
                </RetroButton>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-muted-foreground mr-1">[PRESETS]:</span>
                {promptPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setGoalPrompt(preset)
                      handleDecompose(preset)
                    }}
                    className="text-[9px] font-mono px-2 py-0.5 bg-secondary hover:bg-neon-cyan/20 text-muted-foreground hover:text-neon-cyan border border-border hover:border-neon-cyan/60 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </RetroCard>

          {/* Decomposed Plan Preview */}
          {decomposedPlan && (
            <div className="bg-card border-2 border-primary p-5 shadow-[0_0_30px_rgba(168,85,247,0.25)] space-y-5 animate-in fade-in duration-300 relative">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary shadow-[0_0_8px_#a855f7]" />

              {/* Goal Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <RetroBadge variant="cyan" pixelFont className="text-[8px]">
                      {decomposedPlan.category}
                    </RetroBadge>
                    <RetroBadge variant="pink" pixelFont className="text-[8px]">
                      {decomposedPlan.priority} PRIORITY
                    </RetroBadge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Horizon: ~{decomposedPlan.targetWeeks} Weeks
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-pixel text-foreground font-bold tracking-wide">
                    {decomposedPlan.title}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {decomposedPlan.description}
                  </p>
                </div>

                {/* Deploy Action Button */}
                <div className="shrink-0">
                  {deploySuccess ? (
                    <div className="flex items-center gap-2 bg-neon-green/15 border border-neon-green px-3 py-1.5 text-neon-green text-xs font-mono shadow-[0_0_12px_rgba(163,230,53,0.3)]">
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="font-pixel text-[9px]">QUEST DEPLOYED TO LOG!</span>
                    </div>
                  ) : (
                    <RetroButton
                      variant="green"
                      pixelFont
                      onClick={handleDeployPlan}
                      disabled={isDeploying}
                    >
                      {isDeploying ? (
                        <>Deploying Quest...</>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve & Deploy to Planner
                        </>
                      )}
                    </RetroButton>
                  )}
                </div>
              </div>

              {/* Milestones & Tasks Tree */}
              <div className="space-y-4">
                <h3 className="font-pixel text-xs text-neon-yellow tracking-wider">
                  TACTICAL MILESTONES & DAILY MISSIONS ({decomposedPlan.milestones.length} PHASES)
                </h3>

                <div className="space-y-3">
                  {decomposedPlan.milestones.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="bg-secondary/70 border border-border p-3.5 space-y-2.5 hover:border-primary/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 bg-primary/20 border border-primary flex items-center justify-center font-pixel text-[9px] text-primary">
                            {m.order || mIdx + 1}
                          </span>
                          <span className="font-bold text-xs text-foreground font-mono">
                            {m.title}
                          </span>
                        </div>
                        <RetroBadge variant="primary" pixelFont className="text-[7px]">
                          +{m.xpReward} XP
                        </RetroBadge>
                      </div>

                      {m.description && (
                        <p className="text-[11px] text-muted-foreground font-mono pl-7">
                          {m.description}
                        </p>
                      )}

                      {/* Child Tasks */}
                      <div className="pl-7 space-y-1.5">
                        {m.tasks.map((t, tIdx) => (
                          <div
                            key={tIdx}
                            className="flex items-center justify-between p-2 bg-card/70 border border-border/80 text-xs font-mono"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="w-1.5 h-1.5 bg-neon-cyan shadow-[0_0_4px_#22d3ee]" />
                              <span className="text-foreground truncate">{t.title}</span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3 text-neon-cyan" />
                                {t.estimatedMin}m
                              </span>
                              <RetroBadge variant="green" pixelFont className="text-[7px]">
                                +{t.xpReward} XP
                              </RetroBadge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Link after Deployment */}
              {deploySuccess && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <RetroButton
                    variant="cyan"
                    size="sm"
                    onClick={() => onNavigateTab?.('quests')}
                    pixelFont
                  >
                    View in Quest Log
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </RetroButton>
                  <RetroButton
                    variant="pink"
                    size="sm"
                    onClick={() => onNavigateTab?.('planner')}
                    pixelFont
                  >
                    View in Weekly Planner
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </RetroButton>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Daily Plan Analysis & Coach */}
      {activeTab === 'planner-coach' && (
        <div className="space-y-5">
          <RetroCard variant="accent-pink" glow topStripe className="p-5">
            <RetroCardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-neon-pink" />
                <RetroCardTitle pixelFont>SYNTH WORKLOAD AUDITOR</RetroCardTitle>
              </div>

              <RetroButton
                variant="pink"
                size="sm"
                pixelFont
                onClick={handleAnalyzeDay}
                disabled={isAnalyzingDay}
              >
                {isAnalyzingDay ? 'Analyzing Workload...' : 'Re-Analyze Schedule'}
              </RetroButton>
            </RetroCardHeader>

            {dailyPlanAdvice ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Focus Theme Banner */}
                <div className="p-3 bg-secondary/80 border-l-4 border-neon-pink flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-neon-pink uppercase font-bold block">
                      RECOMMENDED FOCUS THEME
                    </span>
                    <h3 className="font-pixel text-xs text-foreground mt-0.5">
                      {dailyPlanAdvice.focusTheme}
                    </h3>
                  </div>
                  <Sparkles className="w-5 h-5 text-neon-pink" />
                </div>

                {/* Analysis */}
                <p className="text-muted-foreground leading-relaxed">
                  {dailyPlanAdvice.analysis}
                </p>

                {/* Workload Warning if any */}
                {dailyPlanAdvice.workloadWarning && (
                  <div className="p-3 bg-destructive/15 border border-destructive/50 text-destructive flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-[11px]">{dailyPlanAdvice.workloadWarning}</span>
                  </div>
                )}

                {/* Recommended Sequence */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-pixel text-[10px] text-neon-yellow uppercase tracking-wider">
                    RECOMMENDED EXECUTION SEQUENCE
                  </h4>

                  {dailyPlanAdvice.recommendedSequence.length === 0 ? (
                    <p className="text-muted-foreground py-2">No missions pending for today. Ready for new quests!</p>
                  ) : (
                    dailyPlanAdvice.recommendedSequence.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-secondary border border-border flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start space-x-2.5">
                          <span className="w-4 h-4 rounded-full bg-neon-cyan/20 border border-neon-cyan text-neon-cyan flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-foreground text-xs">{item.title}</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{item.reason}</p>
                          </div>
                        </div>
                        <RetroBadge variant="cyan" pixelFont className="text-[7px] shrink-0">
                          {item.timeblock}
                        </RetroBadge>
                      </div>
                    ))
                  )}
                </div>

                {/* Motivational Quote */}
                <p className="text-[11px] text-neon-yellow italic border-t border-border pt-3 text-center">
                  "{dailyPlanAdvice.motivationalQuote}"
                </p>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto animate-pulse" />
                <p className="font-pixel text-xs text-muted-foreground">SCANNING REAL-TIME WORKLOAD...</p>
              </div>
            )}
          </RetroCard>
        </div>
      )}

      {/* TAB 3: Weekly Retrospective Debrief */}
      {activeTab === 'weekly-debrief' && (
        <div className="space-y-5">
          <RetroCard variant="accent-yellow" glow topStripe className="p-5">
            <RetroCardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-neon-yellow" />
                <RetroCardTitle pixelFont>SYNTH WEEKLY RETROSPECTIVE DEBRIEF</RetroCardTitle>
              </div>

              <RetroButton
                variant="yellow"
                size="sm"
                pixelFont
                onClick={handleGenerateReview}
                disabled={isGeneratingReview}
              >
                {isGeneratingReview ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Synthesizing Telemetry...
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    Generate Retrospective (+75 XP)
                  </>
                )}
              </RetroButton>
            </RetroCardHeader>

            {weeklyReview ? (
              <div className="space-y-5 font-mono text-xs">
                {/* Header Banner with Huge Arcade Performance Grade */}
                <div className="p-4 bg-secondary/80 border-2 border-neon-yellow/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-neon-yellow uppercase font-bold tracking-widest block">
                      PERFORMANCE EVALUATION // {weeklyReview.title}
                    </span>
                    <h2 className="font-pixel text-base text-foreground tracking-wide">
                      {weeklyReview.executiveSummary}
                    </h2>
                  </div>

                  {/* Huge Arcade Tier Grade */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className="text-[8px] font-pixel text-muted-foreground uppercase">RANK TIER</span>
                    <div
                      className={`w-14 h-14 border-2 flex items-center justify-center font-pixel text-2xl font-bold shadow-lg ${
                        weeklyReview.grade === 'S'
                          ? 'border-neon-yellow text-neon-yellow bg-neon-yellow/15 shadow-[0_0_20px_#facc15]'
                          : weeklyReview.grade === 'A'
                          ? 'border-neon-green text-neon-green bg-neon-green/15 shadow-[0_0_15px_#a3e635]'
                          : weeklyReview.grade === 'B'
                          ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/15 shadow-[0_0_12px_#22d3ee]'
                          : 'border-neon-pink text-neon-pink bg-neon-pink/15'
                      }`}
                    >
                      {weeklyReview.grade}
                    </div>
                  </div>
                </div>

                {/* 4-Stat Telemetry Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-secondary/50 border border-border text-center">
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Missions Conquered</span>
                    <span className="text-sm font-pixel text-neon-green font-bold">{weeklyReview.completedCount}</span>
                  </div>
                  <div className="p-3 bg-secondary/50 border border-border text-center">
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Lapsed / Postponed</span>
                    <span className="text-sm font-pixel text-neon-pink font-bold">{weeklyReview.postponedCount}</span>
                  </div>
                  <div className="p-3 bg-secondary/50 border border-border text-center">
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Habit Consistency</span>
                    <span className="text-sm font-pixel text-neon-yellow font-bold">{weeklyReview.habitConsistencyPct}%</span>
                  </div>
                  <div className="p-3 bg-secondary/50 border border-border text-center">
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">XP Harvested</span>
                    <span className="text-sm font-pixel text-neon-cyan font-bold">+{weeklyReview.weeklyXp} XP</span>
                  </div>
                </div>

                {/* Dominant Attribute & Bottlenecks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/40 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">DOMINANT ATTRIBUTE</span>
                      <RetroBadge variant="cyan" pixelFont className="text-[8px]">
                        {weeklyReview.strongestArea}
                      </RetroBadge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      This attribute absorbed the majority of your quest momentum this week.
                    </p>
                  </div>

                  <div className="p-3 bg-secondary/40 border border-border space-y-2">
                    <span className="text-[9px] text-neon-pink uppercase font-bold block">
                      TACTICAL BOTTLENECKS
                    </span>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      {weeklyReview.bottlenecks.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-neon-pink font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Directives for Next Week */}
                <div className="p-4 bg-secondary/40 border border-neon-yellow/40 space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-neon-yellow" />
                    <span className="font-pixel text-xs text-neon-yellow tracking-wider">
                      DIRECTIVES FOR THE UPCOMING WEEK
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {weeklyReview.nextWeekDirectives.map((d, idx) => (
                      <div key={idx} className="p-2.5 bg-card border border-border text-[11px] space-y-1">
                        <span className="font-pixel text-[8px] text-neon-yellow">DIRECTIVE {idx + 1}</span>
                        <p className="text-muted-foreground leading-relaxed">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote and Bonus Confirmation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border">
                  <p className="text-[11px] text-neon-yellow italic">"{weeklyReview.cyberQuote}"</p>
                  <RetroBadge variant="green" pixelFont className="text-[8px] shrink-0 self-end sm:self-auto">
                    +75 RETROSPECTIVE XP CLAIMED
                  </RetroBadge>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Award className="w-10 h-10 text-neon-yellow/50 mx-auto animate-bounce" />
                <h3 className="font-pixel text-xs text-neon-yellow">SUNDAY TACTICAL RETROSPECTIVE</h3>
                <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
                  Execute Synth's intelligence analysis over your past 7 days of missions, habit protocols, and XP progression.
                </p>
                <RetroButton
                  variant="yellow"
                  size="md"
                  pixelFont
                  onClick={handleGenerateReview}
                  disabled={isGeneratingReview}
                  className="mt-2"
                >
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  Initiate Retrospective Debrief (+75 XP)
                </RetroButton>
              </div>
            )}
          </RetroCard>
        </div>
      )}

      {/* TAB 4: Adaptive Rescheduler */}
      {activeTab === 'adaptive-reschedule' && (
        <div className="space-y-5">
          <RetroCard variant="accent-green" glow topStripe className="p-5">
            <RetroCardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-neon-green" />
                <RetroCardTitle pixelFont>SYNTH ADAPTIVE RESCHEDULER</RetroCardTitle>
              </div>

              <RetroButton
                variant="green"
                size="sm"
                pixelFont
                onClick={handleSuggestReschedule}
                disabled={isAnalyzingReschedule}
              >
                {isAnalyzingReschedule ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Scanning Overload...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Scan Timeline & Overdue
                  </>
                )}
              </RetroButton>
            </RetroCardHeader>

            {rescheduleAppliedSuccess && (
              <div className="p-3 bg-neon-green/15 border border-neon-green text-neon-green font-mono text-xs flex items-center space-x-2 animate-bounce">
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="font-pixel text-[10px]">
                  TIMELINE REBALANCED // ALL MISSIONS SYNCED TO SQLITE!
                </span>
              </div>
            )}

            {reschedulePlan ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Analysis Message */}
                <div className="p-3 bg-secondary/80 border-l-4 border-neon-green flex items-start space-x-3">
                  <Sparkles className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                  <p className="text-foreground leading-relaxed">{reschedulePlan.analysis}</p>
                </div>

                {/* Reschedule List */}
                {reschedulePlan.reschedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border p-6 bg-secondary/20">
                    <CheckCircle2 className="w-8 h-8 text-neon-green mx-auto mb-2" />
                    <p className="font-pixel text-xs text-neon-green font-bold">ALL MISSIONS ON SCHEDULE</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      No overdue or backlogged quests detected on your timeline.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">
                        PROPOSED TIMELINE REDISTRIBUTION ({reschedulePlan.reschedules.length})
                      </span>
                      <RetroButton
                        variant="green"
                        size="sm"
                        pixelFont
                        onClick={handleApplyReschedules}
                        disabled={isApplyingReschedules}
                      >
                        {isApplyingReschedules ? 'Applying...' : 'Apply All Reschedules (+Sync)'}
                      </RetroButton>
                    </div>

                    <div className="space-y-2">
                      {reschedulePlan.reschedules.map((r, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-secondary/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="font-pixel text-xs text-foreground block truncate">
                              {r.taskTitle}
                            </span>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {r.reason}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 font-mono text-[10px]">
                            <span className="px-2 py-0.5 bg-destructive/20 border border-destructive/50 text-destructive line-through">
                              {r.currentDate || 'OVERDUE'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-neon-green" />
                            <span className="px-2 py-0.5 bg-neon-green/20 border border-neon-green text-neon-green font-bold">
                              {r.proposedDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <RotateCcw className="w-10 h-10 text-neon-green/50 mx-auto animate-pulse" />
                <h3 className="font-pixel text-xs text-neon-green">ADAPTIVE TIMELINE OPTIMIZER</h3>
                <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
                  Lapsed missions or heavy days? Synth analyzes available capacity over the next 7 days and redistributes your workload without burnout.
                </p>
                <RetroButton
                  variant="green"
                  size="md"
                  pixelFont
                  onClick={handleSuggestReschedule}
                  disabled={isAnalyzingReschedule}
                  className="mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Scan & Propose Rebalance
                </RetroButton>
              </div>
            )}
          </RetroCard>
        </div>
      )}

      {/* TAB 5: Synth Terminal Chat */}
      {activeTab === 'chat' && (
        <RetroCard variant="default" className="p-0 overflow-hidden border-2 border-primary shadow-[0_0_25px_rgba(168,85,247,0.2)]">
          {/* Terminal Header */}
          <div className="bg-secondary/90 px-4 py-2.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-primary" />
              <RetroCardTitle pixelFont>SYNTH TACTICAL TERMINAL</RetroCardTitle>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_#a3e635]" />
              <span className="font-mono text-[9px] text-neon-green uppercase font-bold">READY</span>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="p-4 space-y-3.5 max-h-96 min-h-[320px] overflow-y-auto font-mono text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[9px] text-muted-foreground font-mono">
                  <span>{msg.sender === 'user' ? 'COMMANDER' : 'SYNTH CORE'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`p-3 max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary/20 border border-primary text-foreground'
                      : 'bg-secondary/90 border border-border text-foreground shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isChatting && (
              <div className="flex items-center space-x-2 text-primary font-mono text-xs animate-pulse">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                <span>Synth is computing tactical response...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendChat}
            className="p-3 bg-secondary/80 border-t border-border flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask Synth (e.g. 'How should I structure my 4-hour deep work sprint?')..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatting}
              className="flex-1 bg-card border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary font-mono"
            />
            <RetroButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isChatting || !chatInput.trim()}
              pixelFont
            >
              <Send className="w-3.5 h-3.5" />
            </RetroButton>
          </form>
        </RetroCard>
      )}
    </div>
  )
}
