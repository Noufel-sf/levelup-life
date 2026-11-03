import React, { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp,
  Shield,
  Zap,
  Award,
  Calendar,
  Flame,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  CheckCircle2,
  ChevronRight,
  Target,
  CheckSquare,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroProgressBar } from '@/components/8bit/RetroProgressBar'
import { UserProfileDTO, XPTransactionDTO, TaskDTO, HabitDTO, GoalDTO } from '@/types/ipc'

interface ProgressViewProps {
  profile: UserProfileDTO | null
}

type Timeframe = '7d' | '14d' | '30d'
type AnalyticsViewTab = 'xp-curve' | 'missions' | 'habits-heatmap'

const getLocalDateStr = (d: Date = new Date()) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile }) => {
  const [history, setHistory] = useState<XPTransactionDTO[]>([])
  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [habits, setHabits] = useState<HabitDTO[]>([])
  const [goals, setGoals] = useState<GoalDTO[]>([])

  const [activeTab, setActiveTab] = useState<AnalyticsViewTab>('xp-curve')
  const [timeframe, setTimeframe] = useState<Timeframe>('14d')
  const [xpChartMode, setXpChartMode] = useState<'cumulative' | 'daily'>('cumulative')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getXPHistory(500).then((res) => setHistory(res || []))
      window.electronAPI.getTasks().then((res) => setTasks(res || []))
      window.electronAPI.getHabits().then((res) => setHabits(res || []))
      window.electronAPI.getGoals().then((res) => setGoals(res || []))
    }
  }, [])

  // Days count for the active timeframe
  const daysCount = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30

  // 1. Process timeline data for XP Recharts
  const { chartData, totalPeriodXp, bestDay, dailyAverage, activeDaysCount, sourceBreakdown } =
    useMemo(() => {
      const daysMap = new Map<
        string,
        {
          dateStr: string
          label: string
          dailyXp: number
          cumulativeXp: number
          sources: Record<string, number>
        }
      >()

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = getLocalDateStr(d)
        daysMap.set(dateStr, {
          dateStr,
          label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          dailyXp: 0,
          cumulativeXp: 0,
          sources: {},
        })
      }

      let sumPeriodXp = 0
      const sourcesTotal: Record<string, number> = {
        TASK: 0,
        HABIT: 0,
        GOAL: 0,
        OTHER: 0,
      }

      history.forEach((tx) => {
        const txDate = new Date(tx.createdAt)
        const dateStr = getLocalDateStr(txDate)
        const dayEntry = daysMap.get(dateStr)

        if (dayEntry) {
          dayEntry.dailyXp += tx.amount
          sumPeriodXp += tx.amount
          const src = tx.sourceType.toUpperCase()
          dayEntry.sources[src] = (dayEntry.sources[src] || 0) + tx.amount

          if (sourcesTotal[src] !== undefined) {
            sourcesTotal[src] += tx.amount
          } else {
            sourcesTotal.OTHER += tx.amount
          }
        }
      })

      const totalXp = profile?.totalXp || sumPeriodXp
      const baseline = Math.max(0, totalXp - sumPeriodXp)

      let runningXp = baseline
      let maxDayXp = 0
      let maxDayLabel = 'N/A'
      let activeDays = 0

      const processedData = Array.from(daysMap.values()).map((entry) => {
        runningXp += entry.dailyXp
        entry.cumulativeXp = runningXp

        if (entry.dailyXp > maxDayXp) {
          maxDayXp = entry.dailyXp
          maxDayLabel = `${entry.label} (+${entry.dailyXp} XP)`
        }
        if (entry.dailyXp > 0) activeDays++

        return entry
      })

      const avg = Math.round(sumPeriodXp / daysCount)

      return {
        chartData: processedData,
        totalPeriodXp: sumPeriodXp,
        bestDay: maxDayXp > 0 ? maxDayLabel : 'None yet',
        dailyAverage: avg,
        activeDaysCount: activeDays,
        sourceBreakdown: sourcesTotal,
      }
    }, [history, daysCount, profile?.totalXp])

  // 2. Process tasks completed velocity per day
  const missionVelocityData = useMemo(() => {
    return chartData.map((day) => {
      const completedOnDay = tasks.filter((t) => {
        if (t.status !== 'COMPLETED') return false
        if (t.completedAt) {
          return getLocalDateStr(new Date(t.completedAt)) === day.dateStr
        }
        return t.scheduledDate === day.dateStr
      })

      const scheduledOnDay = tasks.filter((t) => t.scheduledDate === day.dateStr)

      return {
        label: day.label,
        dateStr: day.dateStr,
        completed: completedOnDay.length,
        scheduled: Math.max(scheduledOnDay.length, completedOnDay.length),
      }
    })
  }, [chartData, tasks])

  // 3. Process 30-Day Habit Consistency Heatmap
  const habitHeatmap = useMemo(() => {
    const days = []
    const totalHabits = habits.length
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = getLocalDateStr(d)
      const completedHabits = habits.filter((h) =>
        h.logs?.some((l) => l.date === dateStr && l.completed)
      )
      const count = completedHabits.length
      const percentage = totalHabits > 0 ? Math.round((count / totalHabits) * 100) : 0
      days.push({
        dateStr,
        label: d.toLocaleDateString('en', { month: 'short', day: 'numeric', weekday: 'short' }),
        dayNum: d.getDate(),
        count,
        total: totalHabits,
        percentage,
        isToday: i === 0,
      })
    }
    return days
  }, [habits])

  // 4. Overall Productivity Metrics
  const totalCompletedTasks = tasks.filter((t) => t.status === 'COMPLETED').length
  const totalTasks = tasks.length
  const taskCompletionRate = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0

  const totalCompletedGoals = goals.filter((g) => g.status === 'COMPLETED').length
  const totalGoals = goals.length
  const goalCompletionRate = totalGoals > 0 ? Math.round((totalCompletedGoals / totalGoals) * 100) : 0

  // 5. Filtered transaction ledger
  const filteredHistory = useMemo(() => {
    if (sourceFilter === 'ALL') return history
    return history.filter((tx) => tx.sourceType.toUpperCase() === sourceFilter)
  }, [history, sourceFilter])

  // Custom Recharts Tooltip for XP
  const CustomXpTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#121215]/95 border-2 border-neon-cyan p-3 shadow-[0_0_20px_rgba(34,211,238,0.4)] backdrop-blur font-mono text-xs space-y-1 z-50">
          <p className="font-pixel text-[10px] text-neon-cyan tracking-wider pb-1 border-b border-border/80">
            {data.label}
          </p>
          <div className="flex items-center justify-between gap-4 text-foreground text-[11px] pt-1">
            <span className="text-muted-foreground">Daily Gain:</span>
            <span className="font-pixel text-[10px] text-neon-pink font-bold">+{data.dailyXp} XP</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-foreground text-[11px]">
            <span className="text-muted-foreground">Cumulative Total:</span>
            <span className="font-pixel text-[10px] text-neon-yellow font-bold">{data.cumulativeXp} XP</span>
          </div>
          {data.sources && Object.keys(data.sources).length > 0 && (
            <div className="pt-1.5 mt-1 border-t border-border/60 text-[9px] text-muted-foreground space-y-0.5">
              {Object.entries(data.sources).map(([src, val]) => (
                <div key={src} className="flex justify-between items-center">
                  <span className="uppercase text-muted-foreground">[{src}]:</span>
                  <span className="text-neon-green font-bold">+{val as number} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Custom Tooltip for Missions
  const CustomMissionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#121215]/95 border-2 border-neon-green p-3 shadow-[0_0_20px_rgba(163,230,53,0.4)] backdrop-blur font-mono text-xs space-y-1 z-50">
          <p className="font-pixel text-[10px] text-neon-green tracking-wider pb-1 border-b border-border/80">
            {data.label}
          </p>
          <div className="flex items-center justify-between gap-4 text-foreground text-[11px] pt-1">
            <span className="text-muted-foreground">Conquered Missions:</span>
            <span className="font-pixel text-[10px] text-neon-green font-bold">{data.completed}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-foreground text-[11px]">
            <span className="text-muted-foreground">Planned Workload:</span>
            <span className="font-pixel text-[10px] text-neon-cyan font-bold">{data.scheduled}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Hero Telemetry Banner */}
      <div className="bg-card border-2 border-primary p-5 shadow-[0_0_25px_rgba(168,85,247,0.18)] relative overflow-hidden">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary shadow-[0_0_8px_#a855f7]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-primary border-primary/60 bg-primary/15 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                [ TELEMETRY CORE ]
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">//</span>
              <span className="text-[10px] font-mono text-neon-cyan font-bold">PROGRESSION & ANALYTICS</span>
            </div>

            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-wider text-foreground font-pixel leading-snug">
              CHARACTER PROGRESSION & ANALYTICS
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Auditable XP telemetry, progression velocity curves, and milestone records across time.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-secondary/80 p-3 border-2 border-border shadow-sm">
            <div className="w-9 h-9 bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Current Tier</span>
              <span className="font-pixel text-xs text-foreground font-bold">
                Level {profile?.level || 1} <span className="text-primary font-mono text-[10px]">({profile?.title || 'Adventurer'})</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-border">
          <div className="bg-secondary/70 p-3 border border-primary/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Total XP Acquired</span>
            <span className="text-sm sm:text-base font-pixel text-primary font-bold">
              {profile?.totalXp || 0} XP
            </span>
          </div>

          <div className="bg-secondary/70 p-3 border border-neon-cyan/40 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Missions Conquered</span>
            <span className="text-sm sm:text-base font-pixel text-neon-cyan font-bold">
              {totalCompletedTasks} / {totalTasks} <span className="text-[10px] text-muted-foreground font-mono">({taskCompletionRate}%)</span>
            </span>
          </div>

          <div className="bg-secondary/70 p-3 border border-neon-pink/40 shadow-[0_0_12px_rgba(236,72,153,0.15)]">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Main Quests Victory</span>
            <span className="text-sm sm:text-base font-pixel text-neon-pink font-bold">
              {totalCompletedGoals} / {totalGoals} <span className="text-[10px] text-muted-foreground font-mono">({goalCompletionRate}%)</span>
            </span>
          </div>

          <div className="bg-secondary/70 p-3 border border-neon-yellow/40 shadow-[0_0_12px_rgba(250,204,21,0.15)]">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Daily Average XP</span>
            <span className="text-sm sm:text-base font-pixel text-neon-yellow font-bold">
              +{dailyAverage} XP/Day
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Suite Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('xp-curve')}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === 'xp-curve'
              ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan shadow-[0_0_12px_rgba(34,211,238,0.3)]'
              : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>XP Velocity Curve</span>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === 'missions'
              ? 'bg-neon-green/20 text-neon-green border-neon-green shadow-[0_0_12px_rgba(163,230,53,0.3)]'
              : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Mission Velocity</span>
        </button>

        <button
          onClick={() => setActiveTab('habits-heatmap')}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === 'habits-heatmap'
              ? 'bg-neon-pink/20 text-neon-pink border-neon-pink shadow-[0_0_12px_rgba(236,72,153,0.3)]'
              : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>30-Day Habit Heatmap</span>
        </button>
      </div>

      {/* TAB 1: XP Velocity Curve */}
      {activeTab === 'xp-curve' && (
        <RetroCard variant="accent-cyan" glow topStripe className="p-5">
          <RetroCardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <RetroCardTitle pixelFont>XP ACCUMULATION HORIZON</RetroCardTitle>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  Visualizing XP growth curve and daily output across the selected horizon.
                </p>
              </div>
            </div>

            {/* Timeframe & Mode Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-secondary border border-border p-0.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setXpChartMode('cumulative')}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    xpChartMode === 'cumulative'
                      ? 'bg-neon-cyan text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Cumulative
                </button>
                <button
                  type="button"
                  onClick={() => setXpChartMode('daily')}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    xpChartMode === 'daily'
                      ? 'bg-neon-pink text-black shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Daily Gain
                </button>
              </div>

              <div className="flex bg-secondary border border-border p-0.5 font-mono text-xs">
                {(['7d', '14d', '30d'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-primary text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </RetroCardHeader>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {xpChartMode === 'cumulative' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonCyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" stroke="#71717a" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomXpTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulativeXp"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#neonCyanGrad)"
                    dot={{ r: 3, fill: '#22d3ee', stroke: '#09090b', strokeWidth: 1.5 }}
                    activeDot={{
                      r: 6,
                      fill: '#22d3ee',
                      stroke: '#ffffff',
                      strokeWidth: 2,
                      className: 'filter drop-shadow-[0_0_8px_#22d3ee]',
                    }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" stroke="#71717a" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} />
                  <Tooltip content={<CustomXpTooltip />} />
                  <Bar dataKey="dailyXp" fill="#ec4899" radius={[2, 2, 0, 0]} className="hover:opacity-80 transition-opacity" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-muted-foreground pt-3 border-t border-border mt-3 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />
              <strong className="text-foreground">Velocity:</strong> +{totalPeriodXp} XP ({timeframe.toUpperCase()})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-yellow shadow-[0_0_6px_#facc15]" />
              <strong className="text-foreground">Peak Record:</strong> {bestDay}
            </span>
            <span className="text-neon-cyan">[{daysCount} SAMPLES ANALYZED]</span>
          </div>
        </RetroCard>
      )}

      {/* TAB 2: Mission Velocity Bar Chart */}
      {activeTab === 'missions' && (
        <RetroCard variant="accent-green" glow topStripe className="p-5">
          <RetroCardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-neon-green/20 border border-neon-green flex items-center justify-center text-neon-green shadow-[0_0_8px_rgba(163,230,53,0.4)]">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <RetroCardTitle pixelFont>DAILY MISSION VELOCITY</RetroCardTitle>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  Tasks successfully conquered vs total planned workload across the horizon.
                </p>
              </div>
            </div>

            <div className="flex bg-secondary border border-border p-0.5 font-mono text-xs">
              {(['7d', '14d', '30d'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-neon-green text-black font-bold shadow-[0_0_10px_rgba(163,230,53,0.5)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </RetroCardHeader>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missionVelocityData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="#71717a" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} />
                <YAxis stroke="#71717a" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomMissionTooltip />} />
                <Bar dataKey="completed" fill="#a3e635" name="Completed Tasks" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-muted-foreground pt-3 border-t border-border mt-3 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_#a3e635]" />
              <strong className="text-foreground">Total Missions Conquered:</strong> {totalCompletedTasks}
            </span>
            <span className="text-neon-green">
              [ALL-TIME COMPLETION RATE: {taskCompletionRate}%]
            </span>
          </div>
        </RetroCard>
      )}

      {/* TAB 3: 30-Day Habit Consistency Heatmap */}
      {activeTab === 'habits-heatmap' && (
        <RetroCard variant="accent-pink" glow topStripe className="p-5">
          <RetroCardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-neon-pink/20 border border-neon-pink flex items-center justify-center text-neon-pink shadow-[0_0_8px_rgba(236,72,153,0.4)]">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <RetroCardTitle pixelFont>30-DAY HABIT CONSISTENCY MATRIX</RetroCardTitle>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  Pixel-grid activity ledger showing daily protocol fulfillment intensity over the past month.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="text-muted-foreground">Intensity:</span>
              <span className="w-3 h-3 bg-secondary border border-border" title="0%" />
              <span className="w-3 h-3 bg-neon-green/20 border border-neon-green/40" title="1-33%" />
              <span className="w-3 h-3 bg-neon-green/50 border border-neon-green/70" title="34-66%" />
              <span className="w-3 h-3 bg-neon-green border border-neon-green shadow-[0_0_6px_#a3e635]" title="100% Perfect" />
            </div>
          </RetroCardHeader>

          {/* Heatmap Grid */}
          <div className="py-4">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {habitHeatmap.map((day) => {
                let colorStyle = 'bg-secondary border-border text-muted-foreground/50'
                if (day.percentage > 0 && day.percentage <= 33) {
                  colorStyle = 'bg-neon-green/20 border-neon-green/40 text-neon-green'
                } else if (day.percentage > 33 && day.percentage <= 66) {
                  colorStyle = 'bg-neon-green/40 border-neon-green/70 text-neon-green shadow-[0_0_8px_rgba(163,230,53,0.25)]'
                } else if (day.percentage > 66 && day.percentage < 100) {
                  colorStyle = 'bg-neon-green/70 border-neon-green text-black font-bold shadow-[0_0_10px_rgba(163,230,53,0.4)]'
                } else if (day.percentage === 100) {
                  colorStyle = 'bg-neon-green border-neon-green text-black font-bold shadow-[0_0_12px_#a3e635]'
                }

                return (
                  <div
                    key={day.dateStr}
                    className={`p-2.5 border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer hover:scale-105 ${colorStyle} ${
                      day.isToday ? 'ring-2 ring-neon-pink ring-offset-2 ring-offset-background' : ''
                    }`}
                    title={`${day.label}: ${day.count}/${day.total} habits fulfilled (${day.percentage}%)`}
                  >
                    <span className="text-[9px] font-mono font-bold block">{day.dayNum}</span>
                    <span className="text-[8px] font-mono mt-0.5">{day.percentage}%</span>
                    {day.isToday && (
                      <span className="text-[7px] font-pixel text-neon-pink uppercase mt-0.5">TODAY</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-muted-foreground pt-3 border-t border-border mt-1 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-pink shadow-[0_0_6px_#ec4899]" />
              <strong className="text-foreground">Active Protocols:</strong> {habits.length} recurring habits
            </span>
            <span className="text-neon-pink">
              [CONQUER HABITS DAILY TO SCALE YOUR MATRIX]
            </span>
          </div>
        </RetroCard>
      )}

      {/* XP Source Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border-2 border-neon-cyan/50 hover:border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.12)]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-pixel text-[9px] text-neon-cyan">DAILY MISSIONS</span>
            <Zap className="w-3.5 h-3.5 text-neon-cyan" />
          </div>
          <p className="font-mono text-base font-bold text-foreground">
            +{sourceBreakdown.TASK} XP
          </p>
          <p className="text-[9px] text-muted-foreground font-mono mt-0.5">Tasks & sprints completed</p>
        </div>

        <div className="p-3 bg-card border-2 border-neon-pink/50 hover:border-neon-pink shadow-[0_0_15px_rgba(236,72,153,0.12)]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-pixel text-[9px] text-neon-pink">HABIT PROTOCOLS</span>
            <Flame className="w-3.5 h-3.5 text-neon-pink" />
          </div>
          <p className="font-mono text-base font-bold text-foreground">
            +{sourceBreakdown.HABIT} XP
          </p>
          <p className="text-[9px] text-muted-foreground font-mono mt-0.5">Recurring daily disciplines</p>
        </div>

        <div className="p-3 bg-card border-2 border-primary/50 hover:border-primary shadow-[0_0_15px_rgba(168,85,247,0.12)]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-pixel text-[9px] text-primary">MAIN QUESTS</span>
            <Award className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="font-mono text-base font-bold text-foreground">
            +{sourceBreakdown.GOAL} XP
          </p>
          <p className="text-[9px] text-muted-foreground font-mono mt-0.5">Major milestones conquered</p>
        </div>

        <div className="p-3 bg-card border-2 border-neon-yellow/50 hover:border-neon-yellow shadow-[0_0_15px_rgba(250,204,21,0.12)]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-pixel text-[9px] text-neon-yellow">ACHIEVEMENTS</span>
            <Sparkles className="w-3.5 h-3.5 text-neon-yellow" />
          </div>
          <p className="font-mono text-base font-bold text-foreground">
            +{sourceBreakdown.OTHER} XP
          </p>
          <p className="text-[9px] text-muted-foreground font-mono mt-0.5">Bonuses & secret milestones</p>
        </div>
      </div>

      {/* Auditable XP Transaction Ledger */}
      <RetroCard variant="default">
        <RetroCardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-neon-yellow" />
            <RetroCardTitle pixelFont>XP TRANSACTION LEDGER</RetroCardTitle>
            <span className="text-[10px] font-mono text-muted-foreground">
              ({filteredHistory.length} ENTRIES)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {['ALL', 'TASK', 'HABIT', 'GOAL'].map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSourceFilter(src)}
                className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  sourceFilter === src
                    ? 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow shadow-[0_0_8px_rgba(250,204,21,0.3)]'
                    : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </RetroCardHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 font-mono">
          {filteredHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 font-mono">
              No XP transactions recorded matching this criteria.
            </p>
          ) : (
            filteredHistory.map((tx) => {
              const txDate = new Date(tx.createdAt)
              const timeFormatted = txDate.toLocaleTimeString('en', {
                hour: '2-digit',
                minute: '2-digit',
              })
              const dateFormatted = txDate.toLocaleDateString('en', {
                month: 'short',
                day: 'numeric',
              })

              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-2.5 bg-secondary/80 border border-border hover:border-neon-cyan/50 text-xs transition-colors"
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-3">
                    <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_#a3e635] shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-foreground text-xs">{tx.description}</span>
                      <span className="text-[9px] text-muted-foreground ml-2">
                        [{tx.sourceType}] • {dateFormatted} at {timeFormatted}
                      </span>
                    </div>
                  </div>

                  <RetroBadge variant="green" pixelFont className="text-[8px] shrink-0">
                    +{tx.amount} XP
                  </RetroBadge>
                </div>
              )
            })
          )}
        </div>
      </RetroCard>
    </div>
  )
}
