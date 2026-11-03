import React, { useState, useEffect } from 'react'
import {
  Zap,
  Plus,
  Pencil,
  Trash2,
  Check,
  Flame,
  Clock,
  Sparkles,
  AlertTriangle,
  X,
  RotateCcw,
  Tag,
  Target,
  Dumbbell,
  BookOpen,
  Brain,
  Shield,
} from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroInput } from '@/components/8bit/RetroInput'
import { soundEngine } from '@/lib/sound'
import { HabitDTO } from '@/types/ipc'

interface HabitsViewProps {
  onRefreshProfile?: () => void
}

const CATEGORIES = [
  'Health',
  'Coding',
  'Fitness',
  'Mindset',
  'Productivity',
  'General',
]

const FREQUENCIES = [
  { id: 'DAILY', label: 'Every Day' },
  { id: 'WEEKDAYS', label: 'Mon - Fri' },
  { id: 'WEEKLY', label: 'Once a Week' },
]

const getLocalDateStr = (d: Date = new Date()) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getLast7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      dateStr: getLocalDateStr(d),
      dayName: d.toLocaleDateString('en', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      isToday: i === 0,
    })
  }
  return days
}

const calculateStreak = (logs: { date: string; completed: boolean }[]) => {
  if (!logs || logs.length === 0) return 0
  const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date))
  let streak = 0
  const d = new Date()

  // If today isn't completed yet, check if yesterday was done so streak isn't lost before day ends
  const todayStr = getLocalDateStr(d)
  if (!completedDates.has(todayStr)) {
    d.setDate(d.getDate() - 1)
  }

  while (true) {
    const str = getLocalDateStr(d)
    if (completedDates.has(str)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export const HabitsView: React.FC<HabitsViewProps> = ({ onRefreshProfile }) => {
  const [habits, setHabits] = useState<HabitDTO[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [isCreating, setIsCreating] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitDTO | null>(null)
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  // Form states (used for both create and edit)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('General')
  const [formFrequency, setFormFrequency] = useState('DAILY')
  const [formTargetDuration, setFormTargetDuration] = useState<number>(15)
  const [formXpReward, setFormXpReward] = useState<number>(10)
  const [formDescription, setFormDescription] = useState('')

  const todayStr = getLocalDateStr(new Date())
  const last7Days = getLast7Days()

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    if (!window.electronAPI) return
    try {
      const res = await window.electronAPI.getHabits()
      setHabits(res || [])
    } catch (err) {
      console.error('Failed to load habits:', err)
    }
  }

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg)
    setTimeout(() => setFeedbackMsg(null), 3000)
  }

  const resetForm = () => {
    setFormName('')
    setFormCategory('General')
    setFormFrequency('DAILY')
    setFormTargetDuration(15)
    setFormXpReward(10)
    setFormDescription('')
    setIsCreating(false)
    setEditingHabit(null)
  }

  const handleStartEdit = (habit: HabitDTO) => {
    setEditingHabit(habit)
    setIsCreating(false)
    setFormName(habit.name)
    setFormCategory(habit.category || 'General')
    setFormFrequency(habit.frequency || 'DAILY')
    setFormTargetDuration(habit.targetDuration || 15)
    setFormXpReward(habit.xpReward || 10)
    setFormDescription(habit.description || '')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !window.electronAPI) return

    try {
      await window.electronAPI.createHabit({
        name: formName.trim(),
        category: formCategory,
        frequency: formFrequency,
        targetDuration: Number(formTargetDuration) || 15,
        xpReward: Number(formXpReward) || 10,
        description: formDescription.trim() || null,
        icon: 'Zap',
      })
      triggerFeedback(`PROTOCOL INITIALIZED: "${formName.trim()}"`)
      resetForm()
      await loadHabits()
    } catch (err) {
      console.error('Failed to create habit:', err)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHabit || !formName.trim() || !window.electronAPI) return

    try {
      await window.electronAPI.updateHabit(editingHabit.id, {
        name: formName.trim(),
        category: formCategory,
        frequency: formFrequency,
        targetDuration: Number(formTargetDuration) || 15,
        xpReward: Number(formXpReward) || 10,
        description: formDescription.trim() || null,
      })
      triggerFeedback(`PROTOCOL UPDATED: "${formName.trim()}"`)
      resetForm()
      await loadHabits()
    } catch (err) {
      console.error('Failed to update habit:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.electronAPI) return
    try {
      await window.electronAPI.deleteHabit(id)
      triggerFeedback('PROTOCOL TERMINATED & DELETED')
      setDeletingHabitId(null)
      await loadHabits()
    } catch (err) {
      console.error('Failed to delete habit:', err)
    }
  }

  const handleToggleHabit = async (habitId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.electronAPI) return

    try {
      const res = await window.electronAPI.toggleHabitComplete(habitId, todayStr)
      if (res?.xpAwarded && res.xpAwarded > 0) {
        soundEngine.playHabitLog()
        triggerFeedback(`+${res.xpAwarded} XP AWARDED // PROTOCOL FULFILLED!`)
      } else {
        soundEngine.playClick()
      }
      await loadHabits()
      onRefreshProfile?.()
    } catch (err) {
      console.error('Failed to toggle habit:', err)
    }
  }

  // Filtered habits
  const filteredHabits = habits.filter((h) => {
    if (selectedCategory === 'ALL') return true
    return h.category?.toLowerCase() === selectedCategory.toLowerCase()
  })

  // Global metrics
  const completedTodayCount = habits.filter((h) =>
    h.logs?.some((l) => l.date === todayStr && l.completed)
  ).length
  const totalHabitsCount = habits.length
  const longestStreak = habits.reduce((max, h) => {
    const s = calculateStreak(h.logs || [])
    return s > max ? s : max
  }, 0)

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div className="fixed top-12 right-6 z-50 bg-secondary/95 backdrop-blur text-foreground px-4 py-2.5 border-2 border-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.4)] font-mono text-xs flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-neon-cyan" />
          <span className="font-pixel text-[10px] text-neon-cyan">{feedbackMsg}</span>
        </div>
      )}

      {/* Main Hero Header Banner */}
      <div className="bg-card border-2 border-neon-pink p-5 shadow-[0_0_25px_rgba(236,72,153,0.18)] relative overflow-hidden">
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-pink border-neon-pink/60 bg-neon-pink/15 shadow-[0_0_8px_rgba(236,72,153,0.3)]">
                [ PROTOCOL ENGINE ]
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">//</span>
              <span className="text-[10px] font-mono text-neon-cyan font-bold">RECURRING REWARDS</span>
            </div>

            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-wider text-foreground font-pixel leading-snug">
              HABIT PROTOCOL SYSTEM
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Build daily behavioral consistency. Conquering protocols awards recurring XP and scales attributes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <RetroButton
              variant="pink"
              size="sm"
              onClick={() => {
                setEditingHabit(null)
                setIsCreating(!isCreating)
              }}
              pixelFont
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Protocol
            </RetroButton>
          </div>
        </div>

        {/* Quick Analytics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-border">
          <div className="bg-secondary/70 p-2.5 border border-border">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Active Protocols</span>
            <span className="text-sm font-pixel text-neon-pink font-bold">{totalHabitsCount}</span>
          </div>
          <div className="bg-secondary/70 p-2.5 border border-border">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Today's Fulfillment</span>
            <span className="text-sm font-pixel text-neon-cyan font-bold">
              {completedTodayCount} / {totalHabitsCount}
            </span>
          </div>
          <div className="bg-secondary/70 p-2.5 border border-border">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">Max Active Streak</span>
            <span className="text-sm font-pixel text-neon-yellow font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-neon-yellow inline" />
              {longestStreak} Days
            </span>
          </div>
          <div className="bg-secondary/70 p-2.5 border border-border">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase font-bold">XP Rate / Cycle</span>
            <span className="text-sm font-pixel text-neon-green font-bold">
              +{habits.reduce((acc, h) => acc + (h.xpReward || 10), 0)} XP
            </span>
          </div>
        </div>
      </div>

      {/* Create / Edit Form Drawer */}
      {(isCreating || editingHabit) && (
        <form
          onSubmit={editingHabit ? handleUpdate : handleCreate}
          className="p-5 bg-card border-2 border-neon-cyan shadow-[0_0_25px_rgba(34,211,238,0.25)] relative space-y-4 animate-in fade-in duration-200"
        >
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />

          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-neon-cyan" />
              <h3 className="font-pixel text-xs text-neon-cyan tracking-wider">
                {editingHabit ? `UPDATE PROTOCOL // ${editingHabit.name}` : 'INITIALIZE NEW HABIT PROTOCOL'}
              </h3>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-muted-foreground mb-1 font-bold">
                PROTOCOL NAME <span className="text-neon-pink">*</span>
              </label>
              <RetroInput
                placeholder="e.g. 45min Deep Coding, 2L Hydration, Morning Workout..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-bold">CATEGORY</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-secondary border border-border p-2 text-foreground focus:outline-none focus:border-neon-cyan cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-bold">FREQUENCY</label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                className="w-full bg-secondary border border-border p-2 text-foreground focus:outline-none focus:border-neon-cyan cursor-pointer"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">TARGET (MINS)</label>
                <RetroInput
                  type="number"
                  min="5"
                  max="300"
                  value={formTargetDuration}
                  onChange={(e) => setFormTargetDuration(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">XP REWARD</label>
                <RetroInput
                  type="number"
                  min="5"
                  max="100"
                  value={formXpReward}
                  onChange={(e) => setFormXpReward(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1 font-mono text-xs font-bold">DESCRIPTION / PROTOCOL RULE (OPTIONAL)</label>
            <RetroInput
              placeholder="Why this habit matters, rules, minimum threshold..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-border">
            <RetroButton type="button" size="sm" variant="ghost" onClick={resetForm}>
              Cancel
            </RetroButton>
            <RetroButton type="submit" size="sm" variant={editingHabit ? 'cyan' : 'pink'} pixelFont>
              <Check className="w-3.5 h-3.5 mr-1" />
              {editingHabit ? 'Save Protocol' : `Activate (+${formXpReward} XP)`}
            </RetroButton>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {deletingHabitId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-2 border-destructive p-5 max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.4)] space-y-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <h3 className="font-pixel text-xs tracking-wider">TERMINATE HABIT PROTOCOL?</h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              Are you sure you want to permanently delete this habit and purge its logged history? This action cannot be reversed.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <RetroButton
                variant="ghost"
                size="sm"
                onClick={() => setDeletingHabitId(null)}
              >
                Abort
              </RetroButton>
              <RetroButton
                variant="danger"
                size="sm"
                pixelFont
                onClick={() => handleDelete(deletingHabitId)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Confirm Delete
              </RetroButton>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground font-bold mr-1">[FILTER]:</span>
        {['ALL', ...CATEGORIES].map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                isActive
                  ? 'bg-neon-pink/20 text-neon-pink border-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                  : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Habit Cards Grid */}
      {filteredHabits.length === 0 ? (
        <div className="p-8 text-center bg-card border-2 border-dashed border-border space-y-3">
          <Zap className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
          <p className="font-pixel text-xs text-muted-foreground">NO ACTIVE PROTOCOLS FOUND</p>
          <p className="text-xs text-muted-foreground font-mono">
            {selectedCategory === 'ALL'
              ? 'Click "New Protocol" above to initialize your first recurring habit.'
              : `No protocols categorized under "${selectedCategory}".`}
          </p>
          <RetroButton
            variant="pink"
            size="sm"
            onClick={() => {
              setSelectedCategory('ALL')
              setIsCreating(true)
            }}
            pixelFont
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Initialize Protocol
          </RetroButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map((habit, idx) => {
            const isCompletedToday = habit.logs?.some((l) => l.date === todayStr && l.completed)
            const streak = calculateStreak(habit.logs || [])
            const borderColors = [
              'border-neon-pink/50 hover:border-neon-pink shadow-[0_0_15px_rgba(236,72,153,0.15)]',
              'border-neon-cyan/50 hover:border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)]',
              'border-neon-green/50 hover:border-neon-green shadow-[0_0_15px_rgba(163,230,53,0.15)]',
              'border-neon-yellow/50 hover:border-neon-yellow shadow-[0_0_15px_rgba(250,204,21,0.15)]',
            ]
            const colorClass = borderColors[idx % borderColors.length]

            return (
              <div
                key={habit.id}
                className={`bg-card border-2 p-4 transition-all duration-200 relative group ${colorClass} ${
                  isCompletedToday ? 'bg-secondary/60' : 'bg-card'
                }`}
              >
                {/* Header row: Checkbox + Name + Badges + Actions */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* Big Checkbox Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleHabit(habit.id, e)}
                      className={`w-8 h-8 shrink-0 flex items-center justify-center border-2 transition-all cursor-pointer ${
                        isCompletedToday
                          ? 'bg-neon-green text-black border-neon-green shadow-[0_0_15px_rgba(163,230,53,0.5)]'
                          : 'bg-secondary border-border hover:border-neon-pink text-transparent hover:text-neon-pink/40'
                      }`}
                      title={isCompletedToday ? 'Protocol Fulfilled for Today' : 'Click to Fulfill Protocol'}
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span
                          className={`font-pixel text-xs text-foreground tracking-wide truncate ${
                            isCompletedToday ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {habit.name}
                        </span>
                        <RetroBadge variant="primary" pixelFont className="text-[7px]">
                          {habit.category || 'General'}
                        </RetroBadge>
                      </div>

                      {habit.description && (
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5 line-clamp-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Edit and Delete */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(habit)}
                      className="p-1.5 text-muted-foreground hover:text-neon-cyan hover:bg-secondary border border-transparent hover:border-border transition-colors cursor-pointer"
                      title="Update / Edit Protocol"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingHabitId(habit.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary border border-transparent hover:border-border transition-colors cursor-pointer"
                      title="Delete Protocol"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono pt-2 border-t border-border gap-2">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neon-cyan" />
                      {habit.targetDuration || 15}m
                    </span>
                    <span className="text-border">|</span>
                    <span className="uppercase text-muted-foreground">
                      {habit.frequency || 'DAILY'}
                    </span>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1 font-bold text-neon-yellow">
                      <Flame className="w-3 h-3 text-neon-yellow" />
                      {streak} streak
                    </span>
                  </div>

                  <RetroBadge variant="green" pixelFont className="text-[8px]">
                    +{habit.xpReward || 10} XP
                  </RetroBadge>
                </div>

                {/* 7-Day History Mini Strip */}
                <div className="mt-3 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold">
                      7-Day History
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {last7Days.map((d) => {
                        const isDone = habit.logs?.some((l) => l.date === d.dateStr && l.completed)
                        return (
                          <div
                            key={d.dateStr}
                            className="flex flex-col items-center"
                            title={`${d.dateStr}: ${isDone ? 'Fulfilled' : 'Not completed'}`}
                          >
                            <span className="text-[8px] font-mono text-muted-foreground mb-0.5">
                              {d.dayName}
                            </span>
                            <div
                              className={`w-4 h-4 flex items-center justify-center border transition-all ${
                                isDone
                                  ? 'bg-neon-green border-neon-green shadow-[0_0_6px_#a3e635]'
                                  : d.isToday
                                  ? 'bg-secondary border-neon-pink animate-pulse'
                                  : 'bg-secondary/60 border-border'
                              }`}
                            >
                              {isDone && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
