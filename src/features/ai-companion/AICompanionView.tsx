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
} from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroInput } from '@/components/8bit/RetroInput'
import { NavTab } from '@/components/layout/Sidebar'

interface AICompanionViewProps {
  onRefreshProfile?: () => void
  onNavigateTab?: (tab: NavTab) => void
}

type AITab = 'decompose' | 'planner-coach' | 'chat'

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

      {/* TAB 3: Synth Terminal Chat */}
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
