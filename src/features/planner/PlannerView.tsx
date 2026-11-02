import React, { useState, useEffect, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Trash2,
  Edit2,
  X,
  Target,
  Zap,
  Layers,
  Flame,
} from 'lucide-react'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroInput } from '@/components/8bit/RetroInput'
import { RetroProgressBar } from '@/components/8bit/RetroProgressBar'
import { TaskDTO, GoalDTO } from '@/types/ipc'

interface PlannerViewProps {
  onRefreshProfile?: () => void
}

export const PlannerView: React.FC<PlannerViewProps> = ({ onRefreshProfile }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [goals, setGoals] = useState<GoalDTO[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Quick Backlog input
  const [backlogTitle, setBacklogTitle] = useState('')
  const [showBacklog, setShowBacklog] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formEstimatedMin, setFormEstimatedMin] = useState(45)
  const [formPriority, setFormPriority] = useState('MEDIUM')
  const [formCategory, setFormCategory] = useState('General')
  const [formGoalId, setFormGoalId] = useState('')
  const [formStartTime, setFormStartTime] = useState('09:00')
  const [formColor, setFormColor] = useState('cyan')
  const [formXp, setFormXp] = useState(20)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!window.electronAPI) return
    const [fetchedTasks, fetchedGoals] = await Promise.all([
      window.electronAPI.getTasks(),
      window.electronAPI.getGoals(),
    ])
    setTasks(fetchedTasks || [])
    setGoals(fetchedGoals || [])
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Calculate the 7 days of the currently selected week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const start = new Date(currentDate)
    const day = start.getDay() // 0 is Sunday
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [currentDate])

  const weekStartStr = weekDays[0].toISOString().split('T')[0]
  const weekEndStr = weekDays[6].toISOString().split('T')[0]

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  const handleNextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Week dates string
  const formatWeekRange = () => {
    const first = weekDays[0]
    const last = weekDays[6]
    const fMonth = first.toLocaleString('en', { month: 'short' })
    const lMonth = last.toLocaleString('en', { month: 'short' })
    return `${first.getDate()} ${fMonth} — ${last.getDate()} ${lMonth} ${last.getFullYear()}`
  }

  // Filter tasks in current week vs backlog
  const { weekTasks, backlogTasks, dailyWorkload, overloadedDays } = useMemo(() => {
    const wMap: Record<string, TaskDTO[]> = {}
    const workload: Record<string, number> = {}
    weekDays.forEach((d) => {
      const s = d.toISOString().split('T')[0]
      wMap[s] = []
      workload[s] = 0
    })

    const backlog: TaskDTO[] = []

    tasks.forEach((t) => {
      if (t.scheduledDate && wMap[t.scheduledDate]) {
        wMap[t.scheduledDate].push(t)
        workload[t.scheduledDate] += t.estimatedMin || 30
      } else if (!t.scheduledDate) {
        backlog.push(t)
      }
    })

    const overloaded = Object.entries(workload)
      .filter(([_, mins]) => mins > 330) // Over 5.5 hours
      .map(([date]) => date)

    return {
      weekTasks: wMap,
      backlogTasks: backlog,
      dailyWorkload: workload,
      overloadedDays: overloaded,
    }
  }, [tasks, weekDays])

  // Total weekly analytics
  const totalWeeklyMinutes = Object.values(dailyWorkload).reduce((a, b) => a + b, 0)
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1)
  const allWeekTasksFlat = Object.values(weekTasks).flat()
  const completedWeeklyTasks = allWeekTasksFlat.filter((t) => t.status === 'COMPLETED').length
  const totalWeeklyTasks = allWeekTasksFlat.length
  const weeklyCompletionRate =
    totalWeeklyTasks > 0 ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100) : 0
  const totalWeeklyPotentialXp = allWeekTasksFlat.reduce((acc, t) => acc + t.xpReward, 0)

  // Toggle complete
  const handleToggleTask = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.electronAPI) return

    const result = await window.electronAPI.toggleTaskComplete(taskId)
    if (result.xpAwarded > 0) {
      showToast(`+${result.xpAwarded} XP Gained! Mission Complete!`)
      if (onRefreshProfile) onRefreshProfile()
    }
    loadData()
  }

  // Move task to next day
  const handleMoveToNextDay = async (task: TaskDTO, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.electronAPI || !task.scheduledDate) return

    const currentD = new Date(task.scheduledDate)
    currentD.setDate(currentD.getDate() + 1)
    const nextStr = currentD.toISOString().split('T')[0]

    await window.electronAPI.updateTask(task.id, { scheduledDate: nextStr })
    showToast(`Pushed to ${currentD.toLocaleDateString('en', { weekday: 'short' })}!`)
    loadData()
  }

  // Move task to previous day
  const handleMoveToPrevDay = async (task: TaskDTO, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.electronAPI || !task.scheduledDate) return

    const currentD = new Date(task.scheduledDate)
    currentD.setDate(currentD.getDate() - 1)
    const prevStr = currentD.toISOString().split('T')[0]

    await window.electronAPI.updateTask(task.id, { scheduledDate: prevStr })
    showToast(`Moved to ${currentD.toLocaleDateString('en', { weekday: 'short' })}!`)
    loadData()
  }

  // Deploy task from backlog to a specific day
  const handleDeployToDate = async (taskId: string, targetDateStr: string) => {
    if (!window.electronAPI) return
    await window.electronAPI.updateTask(taskId, { scheduledDate: targetDateStr })
    showToast(`Mission scheduled!`)
    loadData()
  }

  // Open modal
  const openNewTaskModal = (dateStr?: string) => {
    setSelectedTask(null)
    setFormTitle('')
    setFormDate(dateStr || todayStr)
    setFormEstimatedMin(45)
    setFormPriority('MEDIUM')
    setFormCategory('General')
    setFormGoalId('')
    setFormStartTime('09:00')
    setFormColor('cyan')
    setFormXp(20)
    setIsModalOpen(true)
  }

  const openEditTaskModal = (task: TaskDTO) => {
    setSelectedTask(task)
    setFormTitle(task.title)
    setFormDate(task.scheduledDate || todayStr)
    setFormEstimatedMin(task.estimatedMin || 45)
    setFormPriority(task.priority || 'MEDIUM')
    setFormCategory(task.goal?.category || 'General')
    setFormGoalId(task.goalId || '')
    setFormStartTime(task.startTime || '09:00')
    setFormColor(task.color || 'cyan')
    setFormXp(task.xpReward || 20)
    setIsModalOpen(true)
  }

  // Save Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !window.electronAPI) return

    if (selectedTask) {
      await window.electronAPI.updateTask(selectedTask.id, {
        title: formTitle.trim(),
        scheduledDate: formDate,
        estimatedMin: formEstimatedMin,
        priority: formPriority,
        startTime: formStartTime,
        color: formColor,
        goalId: formGoalId || null,
        xpReward: formXp,
      })
      showToast('Mission updated!')
    } else {
      await window.electronAPI.createTask({
        title: formTitle.trim(),
        type: 'WEEKLY_PLAN',
        scheduledDate: formDate,
        estimatedMin: formEstimatedMin,
        priority: formPriority,
        startTime: formStartTime,
        color: formColor,
        goalId: formGoalId || null,
        xpReward: formXp,
      })
      showToast('New mission deployed!')
    }

    setIsModalOpen(false)
    loadData()
  }

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.electronAPI) return
    await window.electronAPI.deleteTask(taskId)
    setIsModalOpen(false)
    showToast('Mission eliminated.')
    loadData()
  }

  // Quick Backlog Add
  const handleAddBacklog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!backlogTitle.trim() || !window.electronAPI) return

    await window.electronAPI.createTask({
      title: backlogTitle.trim(),
      type: 'BACKLOG',
      scheduledDate: null,
      priority: 'MEDIUM',
      estimatedMin: 45,
      xpReward: 20,
    })

    setBacklogTitle('')
    showToast('Added to Quest Backlog!')
    loadData()
  }

  return (
    <div className="space-y-6 pb-16 select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 bg-gradient-to-r from-primary to-neon-pink text-white px-4 py-2 border-2 border-neon-cyan shadow-[0_0_25px_rgba(34,211,238,0.6)] font-mono text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-yellow animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Hero with Neon Glow */}
      <div className="relative p-6 bg-gradient-to-r from-card via-[#161226] to-[#121926] border-2 border-primary shadow-[0_0_30px_rgba(168,85,247,0.25)] overflow-hidden">
        {/* Corner Neon Dots */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />
        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-neon-yellow shadow-[0_0_8px_#facc15]" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-neon-green shadow-[0_0_8px_#a3e635]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold mb-1.5 flex-wrap gap-y-1">
              <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15 shadow-[0_0_8px_rgba(34,211,238,0.3)] flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                WEEKLY PLANNER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15 shadow-[0_0_8px_rgba(250,204,21,0.3)]">
                [TIMELINE MATRIX]
              </span>
              {overloadedDays.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-pink border-neon-pink/80 bg-neon-pink/20 shadow-[0_0_12px_rgba(236,72,153,0.5)] animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  OVERLOAD DETECTED ({overloadedDays.length} DAYS)
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              ORCHESTRATE YOUR{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-pink">
                WEEKLY VICTORY
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Balance realistic workloads, prevent burnout, and level up through structured daily timeblocks.
            </p>
          </div>

          {/* Week Selector Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <RetroButton variant="secondary" size="sm" onClick={handleToday}>
              Current Week
            </RetroButton>

            <div className="flex items-center border-2 border-border bg-secondary shadow-sm">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 hover:text-neon-cyan transition-colors border-r border-border cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono text-xs font-bold text-neon-cyan tracking-wide whitespace-nowrap">
                {formatWeekRange()}
              </span>
              <button
                onClick={handleNextWeek}
                className="p-1.5 hover:text-neon-cyan transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <RetroButton
              variant="cyan"
              size="sm"
              pixelFont
              onClick={() => openNewTaskModal()}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Mission
            </RetroButton>
          </div>
        </div>
      </div>

      {/* 4 Weekly Stat Cards (DEV SCOPE Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Planned Tasks */}
        <div className="p-4 bg-primary/10 border-2 border-primary hover:border-primary transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary shadow-[0_0_6px_#a855f7]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-primary">[MISSIONS PLANNED]</span>
            <div className="w-7 h-7 bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-primary flex items-baseline gap-1">
            {totalWeeklyTasks}
            <span className="text-xs text-primary/70 font-normal">Quests</span>
          </div>
          <p className="text-[10px] text-primary/80 mt-1 font-mono font-bold">{completedWeeklyTasks} completed this week</p>
        </div>

        {/* Total Workload */}
        <div className="p-4 bg-neon-cyan/10 border-2 border-neon-cyan hover:border-neon-cyan transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-neon-cyan">[WORKLOAD CAPACITY]</span>
            <div className="w-7 h-7 bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neon-cyan flex items-baseline gap-1">
            {totalWeeklyHours}h
            <span className="text-xs text-neon-cyan/70 font-normal">/ 35h Max</span>
          </div>
          <p className="text-[10px] text-neon-cyan/80 mt-1 font-mono font-bold">~{Math.round(totalWeeklyMinutes / 7)}m per day avg</p>
        </div>

        {/* Potential Weekly XP */}
        <div className="p-4 bg-neon-pink/10 border-2 border-neon-pink hover:border-neon-pink transition-all shadow-[0_0_20px_rgba(236,72,153,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-neon-pink">[POTENTIAL EXP]</span>
            <div className="w-7 h-7 bg-neon-pink/20 border border-neon-pink flex items-center justify-center text-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.4)]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neon-pink flex items-baseline gap-1">
            +{totalWeeklyPotentialXp}
            <span className="text-xs text-neon-pink/70 font-normal">XP</span>
          </div>
          <p className="text-[10px] text-neon-pink/80 mt-1 font-mono font-bold">High yield week</p>
        </div>

        {/* Completion Hygiene */}
        <div className="p-4 bg-neon-green/10 border-2 border-neon-green hover:border-neon-green transition-all shadow-[0_0_20px_rgba(163,230,53,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-green shadow-[0_0_6px_#a3e635]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-neon-green">[WEEK HYGIENE]</span>
            <div className="w-7 h-7 bg-neon-green/20 border border-neon-green flex items-center justify-center text-neon-green shadow-[0_0_10px_rgba(163,230,53,0.4)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neon-green flex items-baseline gap-1">
            {weeklyCompletionRate}%
            <span className="text-xs text-neon-green/70 font-normal">Done</span>
          </div>
          <p className="text-[10px] text-neon-green/80 mt-1 font-mono font-bold">{completedWeeklyTasks} of {totalWeeklyTasks} completed</p>
        </div>
      </div>

      {/* 7 Days Columns (The Weekly Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5 items-start">
        {weekDays.map((d, index) => {
          const dayStr = d.toISOString().split('T')[0]
          const isToday = dayStr === todayStr
          const dayName = d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()
          const dayNumber = `${d.getDate()}/${d.getMonth() + 1}`
          const dayTaskList = weekTasks[dayStr] || []
          const dayMinutes = dailyWorkload[dayStr] || 0
          const dayHours = (dayMinutes / 60).toFixed(1)
          const isOverloaded = dayMinutes > 330 // > 5.5 hours

          // Card theme based on day of week & overload
          const dayColors = [
            'border-t-neon-cyan',
            'border-t-primary',
            'border-t-neon-yellow',
            'border-t-neon-pink',
            'border-t-neon-green',
            'border-t-neon-cyan',
            'border-t-primary',
          ]
          const topStripeColor = isOverloaded ? 'border-t-destructive' : dayColors[index % dayColors.length]

          return (
            <div
              key={dayStr}
              className={`bg-card border-2 transition-all relative overflow-hidden flex flex-col min-h-[460px] ${
                isToday
                  ? 'border-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-gradient-to-b from-card via-[#131220] to-card'
                  : isOverloaded
                  ? 'border-destructive shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'border-border hover:border-border/90'
              } ${topStripeColor} border-t-4`}
            >
              {/* Corner pixel dot */}
              <span
                className={`absolute top-0 right-0 w-2 h-2 ${
                  isToday ? 'bg-neon-cyan' : isOverloaded ? 'bg-destructive' : 'bg-transparent'
                }`}
              />

              {/* Day Header */}
              <div className="p-3 border-b border-border/80 bg-secondary/60">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-xs font-bold text-foreground">{dayName}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{dayNumber}</span>
                  </div>
                  {isToday ? (
                    <span className="text-[8px] font-mono px-1.5 py-0.2 bg-neon-cyan text-black font-bold shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                      TODAY
                    </span>
                  ) : isOverloaded ? (
                    <span className="text-[8px] font-mono px-1 py-0.2 bg-destructive text-white font-bold animate-pulse">
                      OVERLOAD
                    </span>
                  ) : null}
                </div>

                {/* Daily Workload Bar */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className={isOverloaded ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                      {dayHours}h planned
                    </span>
                    <span className="text-neon-cyan font-bold">
                      {dayTaskList.filter((t) => t.status === 'COMPLETED').length}/{dayTaskList.length}
                    </span>
                  </div>
                  <div className="w-full bg-background h-1.5 border border-border/60 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverloaded
                          ? 'bg-destructive shadow-[0_0_6px_#ef4444]'
                          : dayMinutes > 240
                          ? 'bg-neon-yellow shadow-[0_0_6px_#facc15]'
                          : 'bg-neon-green shadow-[0_0_6px_#a3e635]'
                      }`}
                      style={{ width: `${Math.min(100, (dayMinutes / 360) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Task Cards Container */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {dayTaskList.length === 0 ? (
                  <div
                    onClick={() => openNewTaskModal(dayStr)}
                    className="h-32 border-2 border-dashed border-border/50 hover:border-neon-cyan/60 flex flex-col items-center justify-center text-center p-3 cursor-pointer group transition-colors bg-secondary/20"
                  >
                    <Plus className="w-4 h-4 text-muted-foreground group-hover:text-neon-cyan group-hover:scale-125 transition-all mb-1" />
                    <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground">
                      Deploy Mission
                    </span>
                  </div>
                ) : (
                  dayTaskList.map((task) => {
                    const isDone = task.status === 'COMPLETED'
                    return (
                      <div
                        key={task.id}
                        onClick={() => openEditTaskModal(task)}
                        className={`p-2.5 border transition-all text-left relative group cursor-pointer ${
                          isDone
                            ? 'bg-secondary/40 border-border/40 opacity-50'
                            : 'bg-secondary border-border hover:border-neon-cyan/70 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                        }`}
                      >
                        {/* Title & Checkbox */}
                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleToggleTask(task.id, e)}
                            className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                            title={isDone ? 'Mark Todo' : 'Complete Quest'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-neon-green" />
                            ) : (
                              <Circle className="w-4 h-4 text-neon-cyan" />
                            )}
                          </button>
                          <p
                            className={`text-[11px] font-mono font-bold leading-tight flex-1 ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>

                        {/* Badges: Time, Priority, XP */}
                        <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-border/50">
                          <span className="text-muted-foreground flex items-center">
                            <Clock className="w-2.5 h-2.5 mr-0.5 text-neon-yellow" />
                            {task.estimatedMin || 30}m
                          </span>
                          <span
                            className={`px-1 py-0.2 border uppercase font-bold text-[8px] ${
                              task.priority === 'CRITICAL'
                                ? 'text-neon-pink border-neon-pink/60 bg-neon-pink/15'
                                : task.priority === 'HIGH'
                                ? 'text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15'
                                : 'text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15'
                            }`}
                          >
                            +{task.xpReward} XP
                          </span>
                        </div>

                        {/* Quick Reschedule Arrows (visible on hover) */}
                        <div className="mt-2 pt-1 border-t border-border/40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleMoveToPrevDay(task, e)}
                            className="p-0.5 text-muted-foreground hover:text-neon-cyan transition-colors"
                            title="Move to Previous Day"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <span className="text-[8px] font-mono text-muted-foreground">SHIFT</span>
                          <button
                            type="button"
                            onClick={(e) => handleMoveToNextDay(task, e)}
                            className="p-0.5 text-muted-foreground hover:text-neon-cyan transition-colors"
                            title="Move to Tomorrow"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Card Add Button */}
              <div className="p-2 border-t border-border/60 bg-secondary/40">
                <button
                  type="button"
                  onClick={() => openNewTaskModal(dayStr)}
                  className="w-full py-1 text-[10px] font-mono font-bold text-muted-foreground hover:text-neon-cyan hover:bg-secondary flex items-center justify-center transition-colors border border-transparent hover:border-border cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quest Backlog / Unscheduled Missions Drawer */}
      <div className="p-4 bg-card border-2 border-neon-yellow shadow-[0_0_25px_rgba(250,204,21,0.2)] relative">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-yellow shadow-[0_0_6px_#facc15]" />

        <div className="flex items-center justify-between pb-3 border-b border-neon-yellow/40 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-neon-yellow/20 border border-neon-yellow flex items-center justify-center text-neon-yellow shadow-[0_0_10px_rgba(250,204,21,0.4)]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-pixel text-xs text-neon-yellow tracking-wider">
                QUEST BACKLOG & STAGING POOL
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground">
                Unscheduled objectives. Deploy directly into your week to build your battle plan.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2 py-0.5 border font-bold text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15 shadow-[0_0_8px_rgba(250,204,21,0.3)]">
            {backlogTasks.length} IN POOL
          </span>
        </div>

        {/* Quick Inscribe into Backlog */}
        <form onSubmit={handleAddBacklog} className="flex gap-2 mb-4">
          <RetroInput
            placeholder="Inscribe a new quest into the staging pool..."
            value={backlogTitle}
            onChange={(e) => setBacklogTitle(e.target.value)}
          />
          <RetroButton type="submit" size="sm" variant="yellow" pixelFont className="shrink-0">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Inscribe (+20 XP)
          </RetroButton>
        </form>

        {/* Backlog Item List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {backlogTasks.length === 0 ? (
            <p className="text-xs font-mono text-muted-foreground col-span-full py-4 text-center italic">
              All quests have been deployed to the timeline! Add new missions above.
            </p>
          ) : (
            backlogTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-secondary border border-border hover:border-neon-yellow/70 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-mono font-bold text-foreground">{task.title}</p>
                    <span className="text-[8px] font-mono px-1.5 py-0.2 border text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15 shrink-0">
                      +{task.xpReward} XP
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Estimated: {task.estimatedMin || 30}m
                  </span>
                </div>

                {/* Quick Deploy Buttons */}
                <div className="mt-3 pt-2 border-t border-border/60">
                  <p className="text-[9px] font-mono text-muted-foreground mb-1">DEPLOY TO DAY:</p>
                  <div className="flex flex-wrap gap-1">
                    {weekDays.map((d) => {
                      const dStr = d.toISOString().split('T')[0]
                      const dName = d.toLocaleDateString('en', { weekday: 'narrow' })
                      return (
                        <button
                          key={dStr}
                          type="button"
                          onClick={() => handleDeployToDate(task.id, dStr)}
                          className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-background border border-border hover:border-neon-cyan hover:text-neon-cyan transition-colors cursor-pointer"
                          title={`Deploy to ${d.toLocaleDateString('en', { weekday: 'short' })}`}
                        >
                          {dName}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mission Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border-2 border-neon-cyan shadow-[0_0_30px_rgba(34,211,238,0.25)] p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-pixel text-xs text-primary mb-4">
              {selectedTask ? 'EDIT TIMELINE MISSION' : 'DEPLOY TIMELINE MISSION'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">
                  Mission Objective
                </label>
                <RetroInput
                  placeholder="e.g. Master TypeScript Generics, Ship MVP Release..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">
                    Scheduled Date
                  </label>
                  <RetroInput
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">
                    Duration (Minutes)
                  </label>
                  <RetroInput
                    type="number"
                    value={formEstimatedMin}
                    onChange={(e) => setFormEstimatedMin(Number(e.target.value))}
                    min={10}
                    max={360}
                    step={15}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:border-neon-cyan focus:outline-none font-mono"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">
                    XP Reward
                  </label>
                  <RetroInput
                    type="number"
                    value={formXp}
                    onChange={(e) => setFormXp(Number(e.target.value))}
                    min={5}
                    max={100}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">
                  Linked Main Quest
                </label>
                <select
                  value={formGoalId}
                  onChange={(e) => setFormGoalId(e.target.value)}
                  className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:border-neon-cyan focus:outline-none font-mono"
                >
                  <option value="">None (Independent Mission)</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border mt-4">
                {selectedTask ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="text-destructive hover:text-red-400 text-xs flex items-center font-mono font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminate
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex space-x-2">
                  <RetroButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </RetroButton>
                  <RetroButton type="submit" size="sm" variant="cyan" pixelFont>
                    {selectedTask ? 'Update Mission' : 'Deploy (+XP)'}
                  </RetroButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
