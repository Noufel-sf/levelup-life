import React, { useState, useEffect, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Filter,
  Calendar as CalendarIcon,
  Tag,
  Award,
  Trash2,
  X,
} from 'lucide-react'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroCard } from '@/components/8bit/RetroCard'
import { RetroInput } from '@/components/8bit/RetroInput'
import { TaskDTO, GoalDTO } from '@/types/ipc'
import { useClickOutside } from '@/hooks/useClickOutside'

interface CalendarViewProps {
  onRefreshProfile?: () => void
}

type ViewMode = 'day' | 'week' | 'month' | 'agenda'

export const CalendarView: React.FC<CalendarViewProps> = ({ onRefreshProfile }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [goals, setGoals] = useState<GoalDTO[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const modalRef = useClickOutside<HTMLDivElement>(() => {
    setIsModalOpen(false)
  }, isModalOpen)
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null)

  // Filter categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Career',
    'Coding',
    'General',
    'Health',
    'Personal',
  ])

  // New Event Form State
  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formStartTime, setFormStartTime] = useState('09:00')
  const [formEndTime, setFormEndTime] = useState('10:00')
  const [formColor, setFormColor] = useState('cyan')
  const [formCategory, setFormCategory] = useState('General')
  const [formGoalId, setFormGoalId] = useState('')
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

  // Calculate week days for current view
  const weekDays = useMemo(() => {
    const start = new Date(currentDate)
    const day = start.getDay() // 0 is Sunday
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [currentDate])

  // Hours array from 08:00 to 19:00 (matching image: 08:00 - 18:00+)
  const hours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ]

  const todayStr = new Date().toISOString().split('T')[0]

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate)
    if (viewMode === 'day') next.setDate(next.getDate() - 1)
    else if (viewMode === 'week') next.setDate(next.getDate() - 7)
    else if (viewMode === 'month') next.setMonth(next.getMonth() - 1)
    setCurrentDate(next)
  }

  const handleNext = () => {
    const next = new Date(currentDate)
    if (viewMode === 'day') next.setDate(next.getDate() + 1)
    else if (viewMode === 'week') next.setDate(next.getDate() + 7)
    else if (viewMode === 'month') next.setMonth(next.getMonth() + 1)
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Open modal for new event on specific day & hour
  const openNewEventModal = (dateStr?: string, hourStr?: string) => {
    setSelectedTask(null)
    setFormTitle('')
    setFormDate(dateStr || currentDate.toISOString().split('T')[0])
    setFormStartTime(hourStr || '09:00')
    const [h, m] = (hourStr || '09:00').split(':').map(Number)
    const endH = String(Math.min(23, h + 1)).padStart(2, '0')
    setFormEndTime(`${endH}:${String(m).padStart(2, '0')}`)
    setFormColor('cyan')
    setFormCategory('General')
    setFormGoalId('')
    setFormXp(20)
    setIsModalOpen(true)
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !window.electronAPI) return

    if (selectedTask) {
      await window.electronAPI.updateTask(selectedTask.id, {
        title: formTitle.trim(),
        scheduledDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        color: formColor,
        goalId: formGoalId || null,
        xpReward: formXp,
      })
    } else {
      await window.electronAPI.createTask({
        title: formTitle.trim(),
        scheduledDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        color: formColor,
        goalId: formGoalId || null,
        xpReward: formXp,
        priority: 'MEDIUM',
        difficulty: 'MEDIUM',
      })
    }

    setIsModalOpen(false)
    setSelectedTask(null)
    loadData()
  }

  const handleDeleteTask = async (id: string) => {
    if (!window.electronAPI) return
    await window.electronAPI.deleteTask(id)
    setIsModalOpen(false)
    setSelectedTask(null)
    loadData()
  }

  const handleToggleComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.electronAPI) return
    const res = await window.electronAPI.toggleTaskComplete(id)
    if (res.xpAwarded > 0 && onRefreshProfile) {
      onRefreshProfile()
    }
    loadData()
  }

  // Get color styles for events matching DEV SCOPE styling
  const getColorStyles = (color?: string | null, isCompleted?: boolean) => {
    if (isCompleted) {
      return 'bg-secondary/40 border border-border/40 text-muted-foreground line-through opacity-60'
    }
    switch (color) {
      case 'purple':
        return 'bg-primary/20 border-2 border-primary text-[#faf5ff] hover:bg-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
      case 'pink':
        return 'bg-neon-pink/20 border-2 border-neon-pink text-[#fdf2f8] hover:bg-neon-pink/30 shadow-[0_0_15px_rgba(236,72,153,0.35)]'
      case 'amber':
      case 'yellow':
        return 'bg-neon-yellow/20 border-2 border-neon-yellow text-[#fefce8] hover:bg-neon-yellow/30 shadow-[0_0_15px_rgba(250,204,21,0.35)]'
      case 'green':
        return 'bg-neon-green/20 border-2 border-neon-green text-[#f0fdf4] hover:bg-neon-green/30 shadow-[0_0_15px_rgba(163,230,53,0.35)]'
      case 'cyan':
      default:
        return 'bg-neon-cyan/20 border-2 border-neon-cyan text-[#ecfeff] hover:bg-neon-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.35)]'
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const cat = t.goal?.category || 'General'
    return selectedCategories.includes(cat) || selectedCategories.length === 0
  })

  // Format header date range
  const formatRange = () => {
    const first = weekDays[0]
    const last = weekDays[6]
    const fMonth = first.toLocaleString('en', { month: 'short' })
    const lMonth = last.toLocaleString('en', { month: 'short' })
    return `${first.getDate()} ${fMonth} - ${last.getDate()} ${lMonth} ${last.getFullYear()}`
  }

  // Current time position indicator
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()
  const showLiveLaser = currentHour >= 8 && currentHour <= 18
  const laserTopPercentage = ((currentHour - 8 + currentMinutes / 60) / 11) * 100

  return (
    <div className="flex gap-6 select-none pb-12">
      {/* Main Calendar View Area */}
      <div className="flex-1 space-y-4">
        {/* Top Header Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border border-t-2 border-t-primary p-4 shadow-[0_0_20px_rgba(168,85,247,0.12)]">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h1 className="font-pixel text-sm text-foreground tracking-wide">MISSION CALENDAR</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Manage timeblocks, milestones, and daily mission deployment.
            </p>
          </div>

          {/* Action & View Switchers */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Tabs */}
            <div className="flex bg-secondary border border-border p-0.5">
              {(['day', 'week', 'month', 'agenda'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    viewMode === mode
                      ? 'bg-primary/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* New Event Button */}
            <RetroButton
              variant="cyan"
              size="sm"
              pixelFont
              onClick={() => openNewEventModal()}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Mission
            </RetroButton>
          </div>
        </div>

        {/* Date Navigation & Range Selector */}
        <div className="flex items-center justify-between bg-card border border-border px-4 py-2.5 shadow-sm">
          <div className="flex items-center space-x-2">
            <RetroButton variant="secondary" size="sm" onClick={handleToday}>
              Today
            </RetroButton>
            <div className="flex items-center border border-border bg-secondary">
              <button
                onClick={handlePrev}
                className="p-1 hover:text-neon-cyan transition-colors border-r border-border cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 hover:text-neon-cyan transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="font-pixel text-[10px] font-bold text-foreground px-2 tracking-wide">
              {formatRange()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 border border-border">
              GMT {now.getTimezoneOffset() > 0 ? '-' : '+'}{Math.abs(now.getTimezoneOffset() / 60)}
            </span>
          </div>
        </div>

        {/* 7-Day Week Grid */}
        <div className="bg-card border border-border shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-x-auto relative">
          {/* Header Row: Days of Week */}
          <div className="grid grid-cols-8 border-b border-border bg-secondary/80 text-center sticky top-0 z-20">
            {/* GMT Column */}
            <div className="p-3 border-r border-border text-[10px] font-mono text-muted-foreground flex items-center justify-center">
              TIME
            </div>

            {/* 7 Day Columns */}
            {weekDays.map((d, index) => {
              const dayStr = d.toISOString().split('T')[0]
              const isToday = dayStr === todayStr
              const dayName = d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()
              const dayDate = `${d.getDate()}/${d.getMonth() + 1}`

              return (
                <div
                  key={index}
                  className={`p-2.5 border-r border-border/70 transition-colors ${
                    isToday ? 'bg-primary/10' : ''
                  }`}
                >
                  <p className="text-[11px] font-mono font-bold text-muted-foreground uppercase">{dayName}</p>
                  <div className="mt-1 flex justify-center">
                    {isToday ? (
                      <span className="w-7 h-7 rounded-full bg-neon-cyan text-black font-bold font-mono text-xs flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-pulse">
                        {d.getDate()}
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-medium text-foreground">
                        {dayDate}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grid Hours Body */}
          <div className="relative min-h-[580px]">
            {/* Current Time Laser Indicator */}
            {showLiveLaser && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                style={{ top: `${laserTopPercentage}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-neon-pink shadow-[0_0_10px_#ec4899] animate-ping ml-1" />
                <div className="flex-1 h-[2px] bg-neon-pink shadow-[0_0_10px_#ec4899]" />
              </div>
            )}

            {/* Rows for each hour */}
            {hours.map((hour, hIdx) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border/40 min-h-[52px]">
                {/* Time Label Column */}
                <div className="p-2 border-r border-border text-[10px] font-mono text-muted-foreground flex items-start justify-center bg-secondary/40">
                  {hour}
                </div>

                {/* 7 Day Cells */}
                {weekDays.map((d, dIdx) => {
                  const dayStr = d.toISOString().split('T')[0]
                  const cellTasks = filteredTasks.filter(
                    (t) =>
                      t.scheduledDate === dayStr &&
                      (t.startTime ? t.startTime.startsWith(hour.slice(0, 2)) : hIdx === 1)
                  )

                  return (
                    <div
                      key={dIdx}
                      onClick={() => openNewEventModal(dayStr, hour)}
                      className="p-1 border-r border-border/30 hover:bg-secondary/40 transition-colors relative group cursor-pointer"
                    >
                      {/* Plus icon on hover */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity">
                        <Plus className="w-3 h-3 text-muted-foreground" />
                      </div>

                      {/* Render scheduled timeblocks */}
                      {cellTasks.map((task) => {
                        const isDone = task.status === 'COMPLETED'
                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTask(task)
                              setFormTitle(task.title)
                              setFormDate(task.scheduledDate || todayStr)
                              setFormStartTime(task.startTime || '09:00')
                              setFormEndTime(task.endTime || '10:00')
                              setFormColor(task.color || 'cyan')
                              setFormCategory(task.goal?.category || 'General')
                              setFormGoalId(task.goalId || '')
                              setFormXp(task.xpReward)
                              setIsModalOpen(true)
                            }}
                            className={`p-2 border mb-1.5 transition-all text-left relative z-10 ${getColorStyles(
                              task.color,
                              isDone
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-mono font-bold tracking-tight">
                                {task.startTime || hour} - {task.endTime || '10:00'}
                              </span>
                              <button
                                onClick={(e) => handleToggleComplete(task.id, e)}
                                title={isDone ? 'Mark Todo' : 'Mark Completed (+XP)'}
                                className="hover:scale-125 transition-transform"
                              >
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 ${
                                    isDone ? 'text-neon-green' : 'text-muted-foreground hover:text-white'
                                  }`}
                                />
                              </button>
                            </div>

                            <p className="text-xs font-mono font-bold leading-tight line-clamp-2">
                              {task.title}
                            </p>

                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10 text-[9px] font-mono">
                              <span className="truncate opacity-80">
                                {task.goal?.title || 'Daily Mission'}
                              </span>
                              <span className="font-pixel text-[7px] shrink-0 font-bold text-neon-cyan">
                                +{task.xpReward}XP
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar Panel (Matching Reference Image) */}
      <div className="w-80 space-y-4 shrink-0">
        {/* Mini Month Calendar Widget */}
        <div className="p-4 bg-card border-2 border-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.25)] relative">
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />
          <div className="flex items-center justify-between pb-3 border-b border-neon-cyan/40 mb-3">
            <span className="font-pixel text-[9px] font-bold text-neon-cyan uppercase tracking-wider">
              {currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  const d = new Date(currentDate)
                  d.setMonth(d.getMonth() - 1)
                  setCurrentDate(d)
                }}
                className="p-1 hover:text-neon-cyan transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const d = new Date(currentDate)
                  d.setMonth(d.getMonth() + 1)
                  setCurrentDate(d)
                }}
                className="p-1 hover:text-neon-cyan transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
            {['MO', 'DI', 'WO', 'DO', 'VR', 'ZA', 'ZO'].map((day) => (
              <span key={day} className="text-muted-foreground font-bold font-mono py-1">
                {day}
              </span>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1
              const isSelected = dayNum === currentDate.getDate()
              return (
                <button
                  key={i}
                  onClick={() => {
                    const d = new Date(currentDate)
                    d.setDate(dayNum)
                    setCurrentDate(d)
                  }}
                  className={`w-6 h-6 mx-auto flex items-center justify-center font-mono text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neon-cyan text-black font-bold shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  {dayNum}
                </button>
              )
            })}
          </div>
        </div>

        {/* Agenda / Categories Filter Checklist */}
        <div className="p-4 bg-card border-2 border-primary shadow-[0_0_20px_rgba(168,85,247,0.25)] relative">
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary shadow-[0_0_6px_#a855f7]" />
          <div className="flex items-center justify-between pb-2 border-b border-primary/40 mb-3">
            <span className="font-pixel text-[10px] text-primary">CATEGORIES</span>
            <RetroButton
              size="sm"
              variant="ghost"
              className="p-1 h-auto"
              onClick={() => openNewEventModal()}
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
            </RetroButton>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { id: 'Coding', label: 'Coding & Quests', color: 'bg-neon-cyan', border: 'border-neon-cyan', text: 'text-neon-cyan' },
              { id: 'Career', label: 'Career & Projects', color: 'bg-primary', border: 'border-primary', text: 'text-primary' },
              { id: 'Health', label: 'Health & Habits', color: 'bg-neon-green', border: 'border-neon-green', text: 'text-neon-green' },
              { id: 'Personal', label: 'Personal Mastery', color: 'bg-neon-pink', border: 'border-neon-pink', text: 'text-neon-pink' },
              { id: 'General', label: 'General & Reviews', color: 'bg-neon-yellow', border: 'border-neon-yellow', text: 'text-neon-yellow' },
            ].map((cat) => {
              const isChecked = selectedCategories.includes(cat.id)
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between p-1.5 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-3 h-3 ${cat.color} border ${cat.border} shadow-[0_0_6px_currentColor]`} />
                    <span className={isChecked ? `${cat.text} font-bold` : 'text-muted-foreground'}>
                      {cat.label}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        setSelectedCategories(selectedCategories.filter((c) => c !== cat.id))
                      } else {
                        setSelectedCategories([...selectedCategories, cat.id])
                      }
                    }}
                    className="accent-primary cursor-pointer"
                  />
                </label>
              )
            })}
          </div>
        </div>

        {/* Upcoming Appointments ("Komende afspraken") */}
        <div className="p-4 bg-card border-2 border-neon-green shadow-[0_0_20px_rgba(163,230,53,0.25)] relative">
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green shadow-[0_0_6px_#a3e635]" />
          <div className="flex items-center justify-between pb-2 border-b border-neon-green/40 mb-3">
            <span className="font-pixel text-[10px] text-neon-green">UPCOMING MISSIONS</span>
            <span className="text-[10px] text-neon-cyan font-mono cursor-pointer hover:underline font-bold">
              [VIEW ALL]
            </span>
          </div>

          <div className="space-y-2">
            {filteredTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTask(task)
                  setFormTitle(task.title)
                  setFormDate(task.scheduledDate || todayStr)
                  setFormStartTime(task.startTime || '09:00')
                  setFormEndTime(task.endTime || '10:00')
                  setFormColor(task.color || 'cyan')
                  setFormCategory(task.goal?.category || 'General')
                  setFormGoalId(task.goalId || '')
                  setFormXp(task.xpReward)
                  setIsModalOpen(true)
                }}
                className="p-2.5 bg-secondary border border-border hover:border-neon-cyan/70 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />
                  <span className="text-xs font-mono font-bold text-foreground truncate">{task.title}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>
                    {task.scheduledDate} {task.startTime || '09:00'}
                  </span>
                  <RetroBadge variant="cyan" pixelFont className="text-[7px] py-0 px-1">
                    {task.goal?.category || 'Mission'}
                  </RetroBadge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <RetroButton
              variant="cyan"
              size="sm"
              className="w-full"
              pixelFont
              onClick={() => openNewEventModal()}
            >
              Deploy Next Mission
            </RetroButton>
          </div>
        </div>
      </div>

      {/* Modal / Dialog for New or Edit Mission Timeblock */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false)
            }
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md bg-card border border-border border-t-2 border-t-neon-cyan shadow-[0_0_30px_rgba(34,211,238,0.25)] p-6 relative"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-pixel text-xs text-primary mb-4">
              {selectedTask ? 'EDIT MISSION BLOCK' : 'SCHEDULE TIMEBLOCK'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Mission Title</label>
                <RetroInput
                  placeholder="e.g. Planning & taken, Client Demo, Code Review..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Date</label>
                  <RetroInput
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">XP Reward</label>
                  <RetroInput
                    type="number"
                    value={formXp}
                    onChange={(e) => setFormXp(Number(e.target.value))}
                    min={5}
                    max={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Start Time</label>
                  <RetroInput
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">End Time</label>
                  <RetroInput
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">Theme Color</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:border-neon-cyan focus:outline-none font-mono"
                  >
                    <option value="cyan">Cyber Cyan (Focus / Coding)</option>
                    <option value="purple">Vapor Purple (Main Quest)</option>
                    <option value="pink">Arcade Pink (Discipline / Priority)</option>
                    <option value="green">Terminal Green (Health / Habits)</option>
                    <option value="amber">Caution Amber (Demo / Deadline)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">Associated Goal</label>
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
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border mt-4">
                {selectedTask ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
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
                    {selectedTask ? 'Update Mission' : 'Lock Timeblock'}
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

