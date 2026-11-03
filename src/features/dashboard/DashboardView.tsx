import React, { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Zap,
  TrendingUp,
  Award,
  Clock,
  Shield,
  Calendar as CalendarIcon,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroProgressBar } from '@/components/8bit/RetroProgressBar'
import { RetroInput } from '@/components/8bit/RetroInput'
import { UserProfileDTO, TaskDTO, HabitDTO } from '@/types/ipc'

interface DashboardViewProps {
  profile: UserProfileDTO | null
  onRefreshProfile: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({ profile, onRefreshProfile }) => {
  const [allTasks, setAllTasks] = useState<TaskDTO[]>([])
  const [habits, setHabits] = useState<HabitDTO[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDuration, setNewTaskDuration] = useState(45)
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM')
  const [newTaskDate, setNewTaskDate] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Filter mode for Missions: 'today' | 'week' | 'active' | 'all'
  const [missionFilter, setMissionFilter] = useState<'today' | 'week' | 'active' | 'all'>('today')

  // Local date helper
  const getLocalDateStr = (d: Date = new Date()) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const todayStr = useMemo(() => getLocalDateStr(new Date()), [])

  // Calculate current week dates
  const weekDateStrings = useMemo(() => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    const start = new Date(now)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return getLocalDateStr(d)
    })
  }, [])

  useEffect(() => {
    setNewTaskDate(todayStr)
    loadData()
  }, [todayStr])

  const loadData = async () => {
    if (!window.electronAPI) return
    const [fetchedTasks, fetchedHabits] = await Promise.all([
      window.electronAPI.getTasks(), // Load ALL tasks from the planner & database
      window.electronAPI.getHabits(),
    ])
    setAllTasks(fetchedTasks || [])
    setHabits(fetchedHabits || [])
  }

  const handleToggleTask = async (taskId: string) => {
    if (!window.electronAPI) return
    const result = await window.electronAPI.toggleTaskComplete(taskId)
    if (result.xpAwarded > 0) {
      showToast(`+${result.xpAwarded} XP Gained! Mission Complete!`)
      onRefreshProfile()
    }
    loadData()
  }

  const handleToggleHabit = async (habitId: string) => {
    if (!window.electronAPI) return
    const result = await window.electronAPI.toggleHabitComplete(habitId, todayStr)
    if (result.xpAwarded > 0) {
      showToast(`+${result.xpAwarded} XP Gained! Habit Logged!`)
      onRefreshProfile()
    }
    loadData()
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !window.electronAPI) return

    await window.electronAPI.createTask({
      title: newTaskTitle.trim(),
      type: 'DAILY_MISSION',
      scheduledDate: newTaskDate || todayStr,
      estimatedMin: newTaskDuration,
      priority: newTaskPriority,
      xpReward: 20,
    })

    setNewTaskTitle('')
    setIsAddingTask(false)
    loadData()
    showToast('New Mission Deployed to Timeline!')
  }

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning, Adventurer'
    if (hour < 18) return 'Good Afternoon, Commander'
    return 'Good Evening, Operative'
  }

  // Filter missions based on the selected tab
  const displayedTasks = useMemo(() => {
    switch (missionFilter) {
      case 'today':
        return allTasks.filter((t) => t.scheduledDate === todayStr)
      case 'week':
        return allTasks.filter((t) => t.scheduledDate && weekDateStrings.includes(t.scheduledDate))
      case 'active':
        return allTasks.filter((t) => t.status !== 'COMPLETED')
      case 'all':
      default:
        return allTasks
    }
  }, [allTasks, missionFilter, todayStr, weekDateStrings])

  // Analytics for Today vs This Week
  const todayTasks = allTasks.filter((t) => t.scheduledDate === todayStr)
  const todayCompleted = todayTasks.filter((t) => t.status === 'COMPLETED').length
  const todayTotal = todayTasks.length
  const todayCompletionRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0

  const weekTasks = allTasks.filter((t) => t.scheduledDate && weekDateStrings.includes(t.scheduledDate))
  const weekCompleted = weekTasks.filter((t) => t.status === 'COMPLETED').length
  const weekTotal = weekTasks.length
  const weekCompletionRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0

  const completedHabits = habits.filter((h) => h.logs.some((l) => l.date === todayStr && l.completed)).length

  // Date badge helper
  const getDateLabel = (taskDate?: string | null) => {
    if (!taskDate) return { text: 'UNSCHEDULED', color: 'text-muted-foreground' }
    if (taskDate === todayStr) return { text: 'TODAY', color: 'text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15 font-bold' }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = getLocalDateStr(tomorrow)
    if (taskDate === tomorrowStr) return { text: 'TOMORROW', color: 'text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15 font-bold' }

    // Parse date for day of week
    const parts = taskDate.split('-')
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      const dayName = d.toLocaleDateString('en', { weekday: 'short' })
      return { text: `${dayName} ${parts[2]}/${parts[1]}`, color: 'text-primary border-primary/60 bg-primary/15' }
    }
    return { text: taskDate, color: 'text-muted-foreground' }
  }

  return (
    <div className="space-y-6 pb-16 relative">
      {/* Ambient background glowing spots */}
      <div className="absolute -top-10 -left-10 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -right-10 w-80 h-80 bg-neon-cyan/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-neon-pink/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-12 right-6 z-50 bg-gradient-to-r from-primary to-neon-pink text-white px-4 py-2 border-2 border-neon-cyan shadow-[0_0_25px_rgba(34,211,238,0.6)] font-mono text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-yellow animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Colorful Hero Banner */}
      <div className="relative p-6 bg-gradient-to-r from-card via-[#161226] to-[#121926] border-2 border-neon-cyan shadow-[0_0_30px_rgba(34,211,238,0.25)] overflow-hidden">
        {/* Neon corner pixel dots */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-green shadow-[0_0_8px_#a3e635]" />
        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-neon-yellow shadow-[0_0_8px_#facc15]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-card border-2 border-neon-pink shadow-[0_0_20px_rgba(236,72,153,0.5)] p-1 shrink-0 flex items-center justify-center arcade-float">
              <img src="/logo.png" alt="LIFE OS" className="w-full h-full object-contain" />
            </div>
            <div>
              {/* Colorful Tag Row */}
              <div className="flex items-center space-x-2 text-xs font-mono font-bold mb-1.5 flex-wrap gap-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  [ 01 ] SYSTEM ONLINE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-pink border-neon-pink/60 bg-neon-pink/15 shadow-[0_0_8px_rgba(236,72,153,0.3)]">
                  [ 02 ] PLANNER SYNC: ACTIVE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-green border-neon-green/60 bg-neon-green/15 shadow-[0_0_8px_rgba(163,230,53,0.3)]">
                  [ 03 ] LEVEL {profile?.level || 1}
                </span>
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-wider text-foreground font-pixel leading-snug">
                LEVEL UP YOUR{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-pink">
                  REALITY
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Real missions synchronized directly with your weekly and daily planner timeline.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-secondary/80 p-3.5 border-2 border-neon-yellow shadow-[0_0_15px_rgba(250,204,21,0.25)]">
            <div className="text-right">
              <p className="text-[10px] text-neon-yellow font-mono uppercase font-bold">Today's Progress</p>
              <p className="font-mono text-sm font-bold text-neon-cyan">
                {todayCompleted}/{todayTotal} Done ({todayCompletionRate}%)
              </p>
              <p className="text-[9px] text-muted-foreground font-mono">Week Plan: {weekCompleted}/{weekTotal}</p>
            </div>
            <div className="w-24">
              <RetroProgressBar value={todayCompletionRate} max={100} variant="gold" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Distinctly Colorful Metric Cards (DEV SCOPE Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Purple EXP Metric Card */}
        <div className="p-4 bg-primary/10 border-2 border-primary hover:border-primary transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary shadow-[0_0_6px_#a855f7]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-primary">[EXP ACCUMULATED]</span>
            <div className="w-7 h-7 bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-primary flex items-baseline gap-1">
            {profile?.currentXp || 0}
            <span className="text-xs text-primary/70 font-normal">XP</span>
          </div>
          <p className="text-[10px] text-primary/80 mt-1 font-mono font-bold">+20 to +50 XP per quest</p>
        </div>

        {/* Cyan Planner Missions Metric Card */}
        <div className="p-4 bg-neon-cyan/10 border-2 border-neon-cyan hover:border-neon-cyan transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-neon-cyan">[PLANNER MISSIONS]</span>
            <div className="w-7 h-7 bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neon-cyan flex items-baseline gap-1">
            {weekCompleted}/{weekTotal}
            <span className="text-xs text-neon-cyan/70 font-normal">({weekCompletionRate}%)</span>
          </div>
          <p className="text-[10px] text-neon-cyan/80 mt-1 font-mono font-bold">{todayCompleted}/{todayTotal} completed today</p>
        </div>

        {/* Pink Streak Metric Card */}
        <div className="p-4 bg-neon-pink/10 border-2 border-neon-pink hover:border-neon-pink transition-all shadow-[0_0_20px_rgba(236,72,153,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-neon-pink">[HABIT PROTOCOLS]</span>
            <div className="w-7 h-7 bg-neon-pink/20 border border-neon-pink flex items-center justify-center text-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.4)]">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neon-pink flex items-baseline gap-1">
            {completedHabits}/{habits.length}
            <span className="text-xs text-neon-pink/70 font-normal">Done</span>
          </div>
          <p className="text-[10px] text-neon-pink/80 mt-1 font-mono font-bold">Daily rituals active</p>
        </div>

        {/* Green Agent Rank Metric Card */}
        <div className="p-4 bg-neon-green/10 border-2 border-neon-green hover:border-neon-green transition-all shadow-[0_0_20px_rgba(163,230,53,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-green shadow-[0_0_6px_#a3e635]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-neon-green">[AGENT RANK]</span>
            <div className="w-7 h-7 bg-neon-green/20 border border-neon-green flex items-center justify-center text-neon-green shadow-[0_0_10px_rgba(163,230,53,0.4)]">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neon-green flex items-baseline gap-1">
            Lv.{profile?.level || 1}
            <span className="text-xs text-neon-green/70 font-normal">Rank</span>
          </div>
          <p className="text-[10px] text-neon-green/80 mt-1 font-mono font-bold truncate">{profile?.title || 'Operative'}</p>
        </div>
      </div>

      {/* Grid: Missions & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Planner Missions Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border-2 border-primary shadow-[0_0_25px_rgba(168,85,247,0.2)] p-5 relative">
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary shadow-[0_0_8px_#a855f7]" />

            {/* Header + Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-primary/40 mb-4 gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-pixel text-xs text-primary tracking-wider">PLANNER MISSIONS</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Synchronized with your weekly timeline
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex bg-secondary border border-border p-0.5">
                  {[
                    { id: 'today', label: "Today's Plan" },
                    { id: 'week', label: 'This Week' },
                    { id: 'active', label: 'All Active' },
                    { id: 'all', label: 'All' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setMissionFilter(tab.id as any)}
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold transition-colors cursor-pointer ${
                        missionFilter === tab.id
                          ? 'bg-neon-cyan text-black border border-neon-cyan shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <RetroButton
                  size="sm"
                  variant="cyan"
                  onClick={() => setIsAddingTask(!isAddingTask)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </RetroButton>
              </div>
            </div>

            {/* Quick Add Form with Planner Date & Duration */}
            {isAddingTask && (
              <form onSubmit={handleCreateTask} className="mb-4 p-4 bg-secondary border-2 border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.25)] space-y-3">
                <RetroInput
                  placeholder="Enter quest objective..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                      Scheduled Date
                    </label>
                    <RetroInput
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                      Duration
                    </label>
                    <select
                      value={newTaskDuration}
                      onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                      className="w-full bg-card border border-border px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                      Priority
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full bg-card border border-border px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <RetroButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAddingTask(false)}
                  >
                    Cancel
                  </RetroButton>
                  <RetroButton type="submit" size="sm" variant="cyan" pixelFont>
                    Deploy to Timeline (+20 XP)
                  </RetroButton>
                </div>
              </form>
            )}

            {/* Task List */}
            <div className="space-y-2.5">
              {displayedTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border p-6 bg-secondary/30">
                  <CalendarIcon className="w-8 h-8 mx-auto text-neon-cyan/50 mb-2 animate-pulse" />
                  <p className="text-sm font-mono text-neon-cyan font-bold">
                    No missions found for this filter!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono max-w-sm mx-auto">
                    Deploy a quest above or check the Weekly Planner to organize your week.
                  </p>
                </div>
              ) : (
                displayedTasks.map((task) => {
                  const isDone = task.status === 'COMPLETED'
                  const dateInfo = getDateLabel(task.scheduledDate)

                  // Priority border colors
                  const priorityColor =
                    task.priority === 'CRITICAL'
                      ? 'border-l-4 border-l-neon-pink bg-neon-pink/5 hover:border-neon-pink'
                      : task.priority === 'HIGH'
                      ? 'border-l-4 border-l-neon-yellow bg-neon-yellow/5 hover:border-neon-yellow'
                      : 'border-l-4 border-l-neon-cyan bg-neon-cyan/5 hover:border-neon-cyan'

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`flex items-center justify-between p-3.5 border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-secondary/40 border-border/40 opacity-50'
                          : `bg-secondary border-border ${priorityColor} hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]`
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 overflow-hidden flex-1 min-w-0 mr-3">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-neon-cyan hover:scale-125 flex-shrink-0 transition-transform" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                            <p
                              className={`text-xs font-mono font-bold truncate ${
                                isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {task.title}
                            </p>
                            {/* Date Badge from Planner */}
                            <span className={`text-[8px] font-mono px-1.5 py-0.2 border uppercase ${dateInfo.color}`}>
                              {dateInfo.text}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2.5 mt-1 text-[10px] font-mono text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="w-2.5 h-2.5 mr-1 text-neon-yellow" />
                              {task.startTime ? `${task.startTime} • ` : ''}
                              {task.estimatedMin || 30}m
                            </span>
                            <span className="uppercase text-[8px] px-1 py-0.2 bg-background border border-border">
                              {task.priority}
                            </span>
                            {task.goal && (
                              <span className="text-[8px] text-primary truncate max-w-[120px]">
                                {task.goal.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span
                          className={`font-mono text-xs px-2 py-0.5 border font-bold ${
                            isDone
                              ? 'text-neon-green border-neon-green/60 bg-neon-green/15 shadow-[0_0_8px_rgba(163,230,53,0.3)]'
                              : 'text-neon-pink border-neon-pink/60 bg-neon-pink/15 shadow-[0_0_8px_rgba(236,72,153,0.3)]'
                          }`}
                        >
                          +{task.xpReward} XP
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Daily Habits & Character Skills */}
        <div className="space-y-6">
          {/* Daily Habits Card */}
          <div className="bg-card border-2 border-neon-pink shadow-[0_0_25px_rgba(236,72,153,0.2)] p-4 relative">
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899]" />

            <div className="flex items-center justify-between pb-3 border-b border-neon-pink/40 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-neon-pink/20 border border-neon-pink flex items-center justify-center text-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.4)]">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-pixel text-xs text-neon-pink tracking-wider">HABIT PROTOCOLS</h3>
              </div>
              <span className="font-mono text-[9px] text-neon-pink font-bold">
                {habits.filter((h) => h.logs.some((l) => l.date === todayStr && l.completed)).length}/{habits.length} DONE
              </span>
            </div>

            <div className="space-y-2">
              {habits.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 font-mono">No habits initialized.</p>
              ) : (
                habits.map((habit, idx) => {
                  const isLoggedToday = habit.logs.some((l) => l.date === todayStr && l.completed)
                  const colors = [
                    { border: 'border-neon-pink', bg: 'bg-neon-pink/10', text: 'text-neon-pink' },
                    { border: 'border-neon-cyan', bg: 'bg-neon-cyan/10', text: 'text-neon-cyan' },
                    { border: 'border-neon-green', bg: 'bg-neon-green/10', text: 'text-neon-green' },
                    { border: 'border-neon-yellow', bg: 'bg-neon-yellow/10', text: 'text-neon-yellow' },
                  ]
                  const c = colors[idx % colors.length]

                  return (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`flex items-center justify-between p-2.5 border transition-all cursor-pointer ${
                        isLoggedToday
                          ? 'bg-secondary/40 border-border/40 opacity-60'
                          : `bg-secondary border-border hover:${c.border} hover:shadow-[0_0_12px_rgba(236,72,153,0.2)]`
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 flex items-center justify-center border ${
                            isLoggedToday
                              ? 'bg-neon-green/20 border-neon-green text-neon-green'
                              : `${c.bg} ${c.border} ${c.text}`
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold text-foreground">{habit.name}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">{habit.frequency}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 border font-bold ${
                            isLoggedToday
                              ? 'text-neon-green border-neon-green/60 bg-neon-green/15 shadow-[0_0_8px_rgba(163,230,53,0.3)]'
                              : 'text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                          }`}
                        >
                          {isLoggedToday ? 'DONE' : `+${habit.xpReward} XP`}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Character Skill Matrix */}
          <div className="bg-card border-2 border-neon-green shadow-[0_0_25px_rgba(163,230,53,0.2)] p-4 relative">
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green shadow-[0_0_6px_#a3e635]" />

            <div className="flex items-center justify-between pb-3 border-b border-neon-green/40 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-neon-green/20 border border-neon-green flex items-center justify-center text-neon-green shadow-[0_0_10px_rgba(163,230,53,0.4)]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-pixel text-xs text-neon-green tracking-wider">ATTRIBUTES</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {profile?.skills?.map((skill, idx) => {
                const barVariants: Array<'cyan' | 'purple' | 'pink' | 'green' | 'gold'> = [
                  'cyan',
                  'purple',
                  'green',
                  'gold',
                ]
                const variant = barVariants[idx % barVariants.length]
                const badgeVariants: Array<'cyan' | 'primary' | 'green' | 'gold'> = [
                  'cyan',
                  'primary',
                  'green',
                  'gold',
                ]

                return (
                  <div
                    key={skill.id}
                    className="p-2.5 bg-secondary border border-border hover:border-neon-cyan/60 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-foreground">{skill.name}</span>
                      <RetroBadge variant={badgeVariants[idx % badgeVariants.length]} pixelFont className="text-[8px] py-0 px-1">
                        Lv.{skill.level}
                      </RetroBadge>
                    </div>
                    <RetroProgressBar value={skill.xp % 100} max={100} variant={variant} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
