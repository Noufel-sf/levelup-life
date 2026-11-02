import React, { useState, useEffect } from 'react'
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
  Activity,
  Code2,
  Heart,
  Brain,
  Star,
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
  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [habits, setHabits] = useState<HabitDTO[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!window.electronAPI) return
    const [fetchedTasks, fetchedHabits] = await Promise.all([
      window.electronAPI.getTasks({ scheduledDate: todayStr }),
      window.electronAPI.getHabits(),
    ])
    setTasks(fetchedTasks || [])
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
      scheduledDate: todayStr,
      xpReward: 20,
      priority: 'MEDIUM',
      difficulty: 'MEDIUM',
    })

    setNewTaskTitle('')
    setIsAddingTask(false)
    loadData()
    showToast('New Mission Added!')
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

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length
  const totalTasks = tasks.length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const completedHabits = habits.filter((h) => h.logs.some((l) => l.date === todayStr && l.completed)).length

  return (
    <div className="space-y-6 pb-12 relative">
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
                  [ 02 ] RPG SYNC
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-neon-green border-neon-green/60 bg-neon-green/15 shadow-[0_0_8px_rgba(163,230,53,0.3)]">
                  [ 03 ] LEVEL {profile?.level || 1}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                LEVEL UP YOUR{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-pink">
                  REALITY
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                "Every completed quest crafts your character. Conquer your daily missions."
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-secondary/80 p-3.5 border-2 border-neon-yellow shadow-[0_0_15px_rgba(250,204,21,0.25)]">
            <div className="text-right">
              <p className="text-[10px] text-neon-yellow font-mono uppercase font-bold">Daily Completion</p>
              <p className="font-mono text-sm font-bold text-neon-cyan">
                {completedTasks}/{totalTasks} Done ({taskCompletionRate}%)
              </p>
            </div>
            <div className="w-24">
              <RetroProgressBar value={taskCompletionRate} max={100} variant="gold" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Distinctly Colorful Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Purple EXP Metric Card */}
        <div className="p-4 bg-primary/10 border-2 border-primary hover:border-primary transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary shadow-[0_0_6px_#a855f7]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-primary">[EXP HARVEST]</span>
            <div className="w-7 h-7 bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-primary flex items-baseline gap-1">
            {profile?.currentXp || 0}
            <span className="text-xs text-primary/70 font-normal">XP</span>
          </div>
          <p className="text-[10px] text-primary/80 mt-1 font-mono font-bold">+20 XP per mission</p>
        </div>

        {/* Cyan Missions Metric Card */}
        <div className="p-4 bg-neon-cyan/10 border-2 border-neon-cyan hover:border-neon-cyan transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-cyan shadow-[0_0_6px_#22d3ee]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-neon-cyan">[MISSION SCORE]</span>
            <div className="w-7 h-7 bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neon-cyan flex items-baseline gap-1">
            {taskCompletionRate}%
            <span className="text-xs text-neon-cyan/70 font-normal">Done</span>
          </div>
          <p className="text-[10px] text-neon-cyan/80 mt-1 font-mono font-bold">{completedTasks} of {totalTasks} finished</p>
        </div>

        {/* Pink Streak Metric Card */}
        <div className="p-4 bg-neon-pink/10 border-2 border-neon-pink hover:border-neon-pink transition-all shadow-[0_0_20px_rgba(236,72,153,0.25)] relative overflow-hidden group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-pink shadow-[0_0_6px_#ec4899]" />
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-2">
            <span className="text-neon-pink">[HABIT STREAK]</span>
            <div className="w-7 h-7 bg-neon-pink/20 border border-neon-pink flex items-center justify-center text-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.4)]">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neon-pink flex items-baseline gap-1">
            {completedHabits}/{habits.length}
            <span className="text-xs text-neon-pink/70 font-normal">Active</span>
          </div>
          <p className="text-[10px] text-neon-pink/80 mt-1 font-mono font-bold">Daily protocols synced</p>
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
        {/* Daily Missions (Quests) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border-2 border-primary shadow-[0_0_25px_rgba(168,85,247,0.2)] p-4 relative">
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary shadow-[0_0_6px_#a855f7]" />

            <div className="flex items-center justify-between pb-3 border-b border-primary/40 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-pixel text-xs text-primary tracking-wider">TODAY'S MISSIONS</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 border font-bold text-primary border-primary/60 bg-primary/15 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                  {tasks.length}
                </span>
              </div>

              <RetroButton
                size="sm"
                variant="cyan"
                onClick={() => setIsAddingTask(!isAddingTask)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Mission
              </RetroButton>
            </div>

            {/* Quick Add Form */}
            {isAddingTask && (
              <form onSubmit={handleCreateTask} className="mb-4 p-3.5 bg-secondary border-2 border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.25)] space-y-2">
                <RetroInput
                  placeholder="Enter quest objective..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <RetroButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAddingTask(false)}
                  >
                    Cancel
                  </RetroButton>
                  <RetroButton type="submit" size="sm" variant="cyan" pixelFont>
                    Deploy Quest (+20 XP)
                  </RetroButton>
                </div>
              </form>
            )}

            {/* Task List */}
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border p-6 bg-secondary/30">
                  <p className="text-sm font-mono text-neon-cyan font-bold">No missions scheduled for today!</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                    Deploy a quest above or check the Calendar to schedule timeblocks.
                  </p>
                </div>
              ) : (
                tasks.map((task) => {
                  const isDone = task.status === 'COMPLETED'
                  // Priority border colors
                  const priorityColor =
                    task.priority === 'CRITICAL'
                      ? 'border-l-4 border-l-neon-pink hover:border-neon-pink bg-neon-pink/5'
                      : task.priority === 'HIGH'
                      ? 'border-l-4 border-l-neon-yellow hover:border-neon-yellow bg-neon-yellow/5'
                      : 'border-l-4 border-l-neon-cyan hover:border-neon-cyan bg-neon-cyan/5'

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`flex items-center justify-between p-3 border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-secondary/40 border-border/40 opacity-50'
                          : `bg-secondary border-border ${priorityColor} hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]`
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-neon-cyan hover:scale-110 flex-shrink-0 transition-transform" />
                        )}
                        <div>
                          <p
                            className={`text-xs font-mono font-bold ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-muted-foreground flex items-center font-mono">
                              <Clock className="w-2.5 h-2.5 mr-1 text-neon-yellow" />
                              {task.estimatedMin || 30}m
                            </span>
                            <span
                              className={`text-[8px] font-mono px-1.5 py-0.2 border uppercase font-bold ${
                                task.priority === 'CRITICAL'
                                  ? 'text-neon-pink border-neon-pink/60 bg-neon-pink/15'
                                  : task.priority === 'HIGH'
                                  ? 'text-neon-yellow border-neon-yellow/60 bg-neon-yellow/15'
                                  : 'text-neon-cyan border-neon-cyan/60 bg-neon-cyan/15'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
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
