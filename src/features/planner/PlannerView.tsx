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
  CornerDownRight,
  ListTodo,
  Columns,
} from 'lucide-react'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroInput } from '@/components/8bit/RetroInput'
import { RetroProgressBar } from '@/components/8bit/RetroProgressBar'
import { soundEngine } from '@/lib/sound'
import { TaskDTO, GoalDTO } from '@/types/ipc'

interface PlannerViewProps {
  onRefreshProfile?: () => void
}

export const PlannerView: React.FC<PlannerViewProps> = ({ onRefreshProfile }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [goals, setGoals] = useState<GoalDTO[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  // Selected Day for the Full-Width Day View (defaults to Today)
  const [selectedDayStr, setSelectedDayStr] = useState<string>(todayStr)

  // View mode: 'single-day' (one day full width with tasks below it) or 'all-stacked'
  const [viewLayout, setViewLayout] = useState<'single-day' | 'all-stacked'>('single-day')

  // Quick Inline Add Task input
  const [inlineTaskTitle, setInlineTaskTitle] = useState('')
  const [inlineDuration, setInlineDuration] = useState(45)

  // Quick Backlog input
  const [backlogTitle, setBacklogTitle] = useState('')

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

  // Ensure selectedDayStr stays within the active week when changing weeks
  useEffect(() => {
    const weekStrings = weekDays.map((d) => d.toISOString().split('T')[0])
    if (!weekStrings.includes(selectedDayStr)) {
      if (weekStrings.includes(todayStr)) {
        setSelectedDayStr(todayStr)
      } else {
        setSelectedDayStr(weekStrings[0])
      }
    }
  }, [weekDays, selectedDayStr, todayStr])

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
    setSelectedDayStr(todayStr)
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
      soundEngine.playTaskComplete()
      showToast(`+${result.xpAwarded} XP Gained! Mission Complete!`)
      if (onRefreshProfile) onRefreshProfile()
    } else {
      soundEngine.playClick()
    }
    loadData()
  }

  // Move task to next day
  const handleMoveToNextDay = async (task: TaskDTO, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.electronAPI || !task.scheduledDate) return

    const currentD = new Date(task.scheduledDate)
    currentD.setDate(currentD.getDate() + 1)
    const nextStr = currentD.toISOString().split('T')[0]

    await window.electronAPI.updateTask(task.id, { scheduledDate: nextStr })
    showToast(`Pushed to ${currentD.toLocaleDateString('en', { weekday: 'short' })}!`)
    loadData()
  }

  // Move task to previous day
  const handleMoveToPrevDay = async (task: TaskDTO, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.electronAPI || !task.scheduledDate) return

    const currentD = new Date(task.scheduledDate)
    currentD.setDate(currentD.getDate() - 1)
    const prevStr = currentD.toISOString().split('T')[0]

    await window.electronAPI.updateTask(task.id, { scheduledDate: prevStr })
    showToast(`Moved to ${currentD.toLocaleDateString('en', { weekday: 'short' })}!`)
    loadData()
  }

  // Shift all remaining unfinished tasks of selected day to tomorrow
  const handleShiftUnfinishedToTomorrow = async () => {
    if (!window.electronAPI) return
    const uncompleted = (weekTasks[selectedDayStr] || []).filter((t) => t.status !== 'COMPLETED')
    if (uncompleted.length === 0) {
      showToast('No unfinished missions to shift!')
      return
    }

    const currentD = new Date(selectedDayStr)
    currentD.setDate(currentD.getDate() + 1)
    const nextStr = currentD.toISOString().split('T')[0]

    await Promise.all(
      uncompleted.map((t) =>
        window.electronAPI!.updateTask(t.id, { scheduledDate: nextStr })
      )
    )

    showToast(`Shifted ${uncompleted.length} missions to tomorrow!`)
    loadData()
  }

  // Inline Quick Add into the Selected Day
  const handleInlineAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inlineTaskTitle.trim() || !window.electronAPI) return

    await window.electronAPI.createTask({
      title: inlineTaskTitle.trim(),
      type: 'WEEKLY_PLAN',
      scheduledDate: selectedDayStr,
      estimatedMin: inlineDuration,
      priority: 'MEDIUM',
      xpReward: 20,
    })

    setInlineTaskTitle('')
    showToast('Mission deployed to timeline!')
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
    setFormDate(dateStr || selectedDayStr)
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
    setFormDate(task.scheduledDate || selectedDayStr)
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

  // Selected Day Metadata
  const selectedDateObj = useMemo(() => new Date(selectedDayStr), [selectedDayStr])
  const selectedDayTaskList = weekTasks[selectedDayStr] || []
  const selectedDayMinutes = dailyWorkload[selectedDayStr] || 0
  const selectedDayHours = (selectedDayMinutes / 60).toFixed(1)
  const isSelectedOverloaded = selectedDayMinutes > 330 // > 5.5 hours
  const selectedDayCompleted = selectedDayTaskList.filter((t) => t.status === 'COMPLETED').length
  const selectedDayTotal = selectedDayTaskList.length
  const selectedDayProgress =
    selectedDayTotal > 0 ? Math.round((selectedDayCompleted / selectedDayTotal) * 100) : 0

  return (
    <div className="space-y-6 pb-20 select-none relative">
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
                [FULL-WIDTH DAY TIMELINE]
              </span>
              {overloadedDays.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-pink border-neon-pink/80 bg-neon-pink/20 shadow-[0_0_12px_rgba(236,72,153,0.5)] animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  OVERLOAD DETECTED ({overloadedDays.length} DAYS)
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-wider text-foreground font-pixel leading-snug">
              ORCHESTRATE YOUR{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-pink">
                WEEKLY VICTORY
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Select any day from the weekly strip below to expand full-width missions and timeblocks.
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
              onClick={() => openNewTaskModal(selectedDayStr)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Deploy Mission
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

      {/* Horizontal 7-Day Interactive Selector Bar */}
      <div className="bg-card border-2 border-border p-2.5 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <Columns className="w-3.5 h-3.5 text-neon-cyan" />
            SELECT DAY TO VIEW FULL TIMELINE:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewLayout('single-day')}
              className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border transition-colors cursor-pointer ${
                viewLayout === 'single-day'
                  ? 'bg-neon-cyan text-black border-neon-cyan'
                  : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              Single Day Focus
            </button>
            <button
              onClick={() => setViewLayout('all-stacked')}
              className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border transition-colors cursor-pointer ${
                viewLayout === 'all-stacked'
                  ? 'bg-neon-cyan text-black border-neon-cyan'
                  : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              All Days Stacked
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d, index) => {
            const dayStr = d.toISOString().split('T')[0]
            const isToday = dayStr === todayStr
            const isSelected = selectedDayStr === dayStr && viewLayout === 'single-day'
            const dayName = d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()
            const dayNumber = `${d.getDate()}/${d.getMonth() + 1}`
            const dayTaskList = weekTasks[dayStr] || []
            const dayMinutes = dailyWorkload[dayStr] || 0
            const dayHours = (dayMinutes / 60).toFixed(1)
            const isOverloaded = dayMinutes > 330

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => {
                  setSelectedDayStr(dayStr)
                  setViewLayout('single-day')
                }}
                className={`p-2.5 border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-neon-cyan bg-neon-cyan/15 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-[1.02]'
                    : isToday
                    ? 'border-primary/80 bg-primary/10 hover:border-neon-cyan'
                    : isOverloaded
                    ? 'border-destructive/80 bg-destructive/10 hover:border-destructive'
                    : 'border-border bg-secondary hover:border-neon-cyan/50'
                }`}
              >
                {/* Active day indicator beacon */}
                {isSelected && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? 'text-neon-cyan' : isToday ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {dayName}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{dayNumber}</span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className={isOverloaded ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                      {dayHours}h
                    </span>
                    <span
                      className={`font-bold ${
                        isSelected ? 'text-neon-cyan' : 'text-foreground'
                      }`}
                    >
                      {dayTaskList.length} quests
                    </span>
                  </div>
                </div>

                {/* Mini capacity indicator */}
                <div className="w-full bg-background h-1 border border-border/60 overflow-hidden mt-1.5">
                  <div
                    className={`h-full ${
                      isOverloaded
                        ? 'bg-destructive'
                        : dayMinutes > 240
                        ? 'bg-neon-yellow'
                        : 'bg-neon-green'
                    }`}
                    style={{ width: `${Math.min(100, (dayMinutes / 360) * 100)}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* FULL WIDTH DAY VIEW (Requested by User) */}
      {viewLayout === 'single-day' ? (
        <div className="space-y-4">
          {/* Active Day Full-Width Header Card */}
          <div
            className={`p-5 bg-card border-2 shadow-[0_0_30px_rgba(34,211,238,0.2)] relative overflow-hidden ${
              isSelectedOverloaded ? 'border-destructive' : 'border-neon-cyan'
            }`}
          >
            {/* Corner pixel dots */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />
            <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-green shadow-[0_0_8px_#a3e635]" />
            <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 font-mono text-xs font-bold mb-1.5 flex-wrap gap-y-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                    {selectedDateObj.toLocaleDateString('en', { weekday: 'long' }).toUpperCase()}
                  </span>
                  {selectedDayStr === todayStr && (
                    <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-black border-neon-cyan bg-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-pulse">
                      TODAY'S BATTLEFIELD
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 border font-bold ${
                      isSelectedOverloaded
                        ? 'text-destructive border-destructive/60 bg-destructive/15'
                        : selectedDayMinutes > 240
                        ? 'text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15'
                        : 'text-neon-green border-neon-green/60 bg-neon-green/15'
                    }`}
                  >
                    WORKLOAD: {selectedDayHours}H / 5.0H CAPACITY
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-primary border-primary/60 bg-primary/15">
                    {selectedDayCompleted}/{selectedDayTotal} DONE ({selectedDayProgress}%)
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold font-pixel text-foreground tracking-wide">
                  {selectedDateObj.toLocaleDateString('en', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>

              {/* Day Level Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <RetroButton
                  variant="secondary"
                  size="sm"
                  onClick={handleShiftUnfinishedToTomorrow}
                  title="Shift all incomplete missions of this day to tomorrow"
                >
                  <CornerDownRight className="w-3.5 h-3.5 mr-1 text-neon-yellow" />
                  Shift Incomplete to Tomorrow
                </RetroButton>

                <RetroButton
                  variant="cyan"
                  size="sm"
                  pixelFont
                  onClick={() => openNewTaskModal(selectedDayStr)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Mission
                </RetroButton>
              </div>
            </div>

            {/* Daily Completion Progress Bar */}
            <div className="mt-4 pt-3 border-t border-border/80">
              <RetroProgressBar value={selectedDayProgress} max={100} variant="cyan" />
            </div>
          </div>

          {/* Full-Width Task Cards Container */}
          <div className="space-y-2.5">
            {selectedDayTaskList.length === 0 ? (
              <div
                onClick={() => openNewTaskModal(selectedDayStr)}
                className="py-12 border-2 border-dashed border-border/60 hover:border-neon-cyan/70 bg-card/40 flex flex-col items-center justify-center text-center p-6 cursor-pointer group transition-colors shadow-sm"
              >
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-neon-cyan group-hover:scale-125 transition-all mb-2" />
                <p className="font-mono font-bold text-foreground text-sm">
                  No missions scheduled for {selectedDateObj.toLocaleDateString('en', { weekday: 'long' })}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1 max-w-md">
                  Click here to deploy a new mission or drag one from your quest backlog below.
                </p>
              </div>
            ) : (
              selectedDayTaskList.map((task) => {
                const isDone = task.status === 'COMPLETED'
                const priorityStyles =
                  task.priority === 'CRITICAL'
                    ? 'border-l-4 border-l-neon-pink bg-neon-pink/5 hover:border-neon-pink'
                    : task.priority === 'HIGH'
                    ? 'border-l-4 border-l-neon-yellow bg-neon-yellow/5 hover:border-neon-yellow'
                    : 'border-l-4 border-l-neon-cyan bg-neon-cyan/5 hover:border-neon-cyan'

                return (
                  <div
                    key={task.id}
                    onClick={() => openEditTaskModal(task)}
                    className={`p-4 bg-card border-2 border-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group ${
                      isDone
                        ? 'opacity-60 bg-secondary/40 border-border/40'
                        : `${priorityStyles} hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]`
                    }`}
                  >
                    {/* Left: Checkbox + Title + Badges */}
                    <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleTask(task.id, e)}
                        className="mt-0.5 sm:mt-0 shrink-0 hover:scale-125 transition-transform"
                        title={isDone ? 'Mark Todo' : 'Conquer Mission'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-neon-green" />
                        ) : (
                          <Circle className="w-5 h-5 text-neon-cyan" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                          <p
                            className={`font-mono text-sm font-bold ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 border uppercase font-bold ${
                              task.priority === 'CRITICAL'
                                ? 'text-neon-pink border-neon-pink/60 bg-neon-pink/15'
                                : task.priority === 'HIGH'
                                ? 'text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15'
                                : 'text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.goal && (
                            <span className="text-[9px] font-mono px-2 py-0.5 border text-primary border-primary/60 bg-primary/15">
                              {task.goal.title}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-xs font-mono text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-neon-yellow" />
                            {task.startTime || '09:00'} ({task.estimatedMin || 45} mins)
                          </span>
                          <span>•</span>
                          <span className="text-neon-cyan">+{task.xpReward} XP Reward</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 justify-end">
                      <button
                        type="button"
                        onClick={(e) => handleMoveToPrevDay(task, e)}
                        className="p-1.5 bg-secondary border border-border hover:border-neon-cyan hover:text-neon-cyan transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
                        title="Shift to Previous Day"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span className="hidden md:inline">Yesterday</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleMoveToNextDay(task, e)}
                        className="p-1.5 bg-secondary border border-border hover:border-neon-cyan hover:text-neon-cyan transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
                        title="Shift to Tomorrow"
                      >
                        <span className="hidden md:inline">Tomorrow</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditTaskModal(task)
                        }}
                        className="p-1.5 bg-secondary border border-border hover:border-neon-cyan hover:text-neon-cyan transition-colors cursor-pointer"
                        title="Edit Mission"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTask(task.id)
                        }}
                        className="p-1.5 bg-secondary border border-border hover:border-destructive hover:text-destructive transition-colors cursor-pointer"
                        title="Eliminate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}

            {/* Inline Quick Add Input for the Active Day */}
            <form
              onSubmit={handleInlineAdd}
              className="p-3 bg-secondary border-2 border-dashed border-border hover:border-neon-cyan/80 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-neon-cyan shrink-0" />
              <input
                type="text"
                placeholder={`Quickly inscribe a new mission for ${selectedDateObj.toLocaleDateString(
                  'en',
                  { weekday: 'long' }
                )}... (Press Enter to deploy)`}
                value={inlineTaskTitle}
                onChange={(e) => setInlineTaskTitle(e.target.value)}
                className="flex-1 bg-transparent border-none text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={inlineDuration}
                  onChange={(e) => setInlineDuration(Number(e.target.value))}
                  className="bg-card border border-border text-[10px] font-mono px-2 py-1 text-foreground focus:outline-none"
                >
                  <option value={15}>15m</option>
                  <option value={30}>30m</option>
                  <option value={45}>45m</option>
                  <option value={60}>60m</option>
                  <option value={90}>90m</option>
                  <option value={120}>2h</option>
                </select>
                <RetroButton type="submit" size="sm" variant="cyan" pixelFont>
                  Deploy
                </RetroButton>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ALL DAYS STACKED (FULL WIDTH FOR EACH DAY) */
        <div className="space-y-6">
          {weekDays.map((d, index) => {
            const dayStr = d.toISOString().split('T')[0]
            const isToday = dayStr === todayStr
            const dayTaskList = weekTasks[dayStr] || []
            const dayMinutes = dailyWorkload[dayStr] || 0
            const dayHours = (dayMinutes / 60).toFixed(1)
            const isOverloaded = dayMinutes > 330

            return (
              <div
                key={dayStr}
                className={`p-5 bg-card border-2 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] ${
                  isToday
                    ? 'border-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                    : isOverloaded
                    ? 'border-destructive'
                    : 'border-border'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-bold text-foreground">
                      {d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-neon-cyan text-black font-bold">
                        TODAY
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {dayHours}h planned • {dayTaskList.length} missions
                    </span>
                  </div>

                  <RetroButton
                    variant="cyan"
                    size="sm"
                    pixelFont
                    onClick={() => openNewTaskModal(dayStr)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </RetroButton>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {dayTaskList.length === 0 ? (
                    <p className="text-xs font-mono text-muted-foreground/70 italic py-2">
                      No missions planned for this day.
                    </p>
                  ) : (
                    dayTaskList.map((task) => {
                      const isDone = task.status === 'COMPLETED'
                      return (
                        <div
                          key={task.id}
                          onClick={() => openEditTaskModal(task)}
                          className={`p-3 bg-secondary border border-border flex items-center justify-between gap-3 cursor-pointer ${
                            isDone ? 'opacity-50 line-through' : 'hover:border-neon-cyan'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={(e) => handleToggleTask(task.id, e)}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-neon-green" />
                              ) : (
                                <Circle className="w-4 h-4 text-neon-cyan" />
                              )}
                            </button>
                            <span className="font-mono text-xs font-bold text-foreground">
                              {task.title}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {task.estimatedMin || 30}m
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-mono text-neon-cyan">
                              +{task.xpReward} XP
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quest Backlog & Staging Pool (Spacious Full Width at the bottom) */}
      <div className="p-5 bg-card border-2 border-neon-yellow shadow-[0_0_25px_rgba(250,204,21,0.2)] relative">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-yellow shadow-[0_0_6px_#facc15]" />

        <div className="flex items-center justify-between pb-3 border-b border-neon-yellow/40 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-neon-yellow/20 border border-neon-yellow flex items-center justify-center text-neon-yellow shadow-[0_0_10px_rgba(250,204,21,0.4)]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-pixel text-xs text-neon-yellow tracking-wider">
                QUEST STAGING POOL & BACKLOG
              </h3>
              <p className="text-xs font-mono text-muted-foreground">
                Unscheduled objectives. Deploy directly onto{' '}
                <span className="text-neon-cyan font-bold">
                  {selectedDateObj.toLocaleDateString('en', { weekday: 'long' })}
                </span>{' '}
                or any day of this week.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 border font-bold text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15 shadow-[0_0_8px_rgba(250,204,21,0.3)]">
            {backlogTasks.length} MISSIONS IN POOL
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

        {/* Backlog Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {backlogTasks.length === 0 ? (
            <p className="text-xs font-mono text-muted-foreground col-span-full py-4 text-center italic">
              All quests have been deployed to your timeline! Inscribe new objectives above.
            </p>
          ) : (
            backlogTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 bg-secondary border border-border hover:border-neon-yellow/70 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-xs font-mono font-bold text-foreground">{task.title}</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 border text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15 shrink-0 font-bold">
                      +{task.xpReward} XP
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-neon-yellow" />
                    Estimated: {task.estimatedMin || 45} mins
                  </span>
                </div>

                {/* 1-Click Deploy Buttons */}
                <div className="mt-3 pt-2.5 border-t border-border/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono text-muted-foreground">DEPLOY TO:</span>
                    <button
                      type="button"
                      onClick={() => handleDeployToDate(task.id, selectedDayStr)}
                      className="text-[9px] font-mono font-bold text-neon-cyan hover:underline"
                    >
                      Deploy to Active Day ({selectedDateObj.toLocaleDateString('en', { weekday: 'short' })})
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {weekDays.map((d) => {
                      const dStr = d.toISOString().split('T')[0]
                      const dName = d.toLocaleDateString('en', { weekday: 'narrow' })
                      return (
                        <button
                          key={dStr}
                          type="button"
                          onClick={() => handleDeployToDate(task.id, dStr)}
                          className={`flex-1 py-1 text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            dStr === selectedDayStr
                              ? 'bg-neon-cyan text-black border-neon-cyan'
                              : 'bg-background border-border hover:border-neon-cyan hover:text-neon-cyan'
                          }`}
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
