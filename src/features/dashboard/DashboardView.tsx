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
  Terminal,
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
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-12 right-6 z-50 bg-primary/90 backdrop-blur text-white px-4 py-2 border border-primary shadow-[0_0_20px_rgba(168,85,247,0.5)] font-mono text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-cyan animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header / Welcome Hero */}
      <div className="relative p-6 bg-card border border-border border-t-2 border-t-primary shadow-[0_0_25px_rgba(168,85,247,0.12)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-secondary border border-neon-cyan/60 shadow-[0_0_15px_rgba(34,211,238,0.25)] p-1 shrink-0 flex items-center justify-center arcade-float">
              <img src="/logo.png" alt="LIFE OS" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-neon-pink text-xs font-mono font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
                <span>
                  {new Date().toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-neon-cyan text-[11px]">[SYSTEM ONLINE]</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono">{getGreeting()}</h2>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                "Every completed mission shapes the hero you become. Level up your reality."
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-secondary p-3 border border-border shadow-sm">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Daily Progress</p>
              <p className="font-mono text-sm font-bold text-neon-cyan">
                {completedTasks}/{totalTasks} Done ({taskCompletionRate}%)
              </p>
            </div>
            <div className="w-24">
              <RetroProgressBar value={taskCompletionRate} max={100} variant="cyan" />
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards (DEV SCOPE Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-3.5 bg-card border border-border hover:border-primary/60 transition-all border-t-2 border-t-primary shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-mono uppercase mb-1.5">
            <span>[EXP ACCUMULATED]</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl font-bold font-mono text-primary flex items-baseline gap-1">
            {profile?.currentXp || 0}
            <span className="text-[10px] text-muted-foreground font-normal">XP</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">Next level at 100 XP</p>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 bg-card border border-border hover:border-neon-cyan/60 transition-all border-t-2 border-t-neon-cyan shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-mono uppercase mb-1.5">
            <span>[MISSION HYGIENE]</span>
            <Award className="w-3.5 h-3.5 text-neon-cyan" />
          </div>
          <div className="text-xl font-bold font-mono text-neon-cyan flex items-baseline gap-1">
            {taskCompletionRate}%
            <span className="text-[10px] text-muted-foreground font-normal">Done</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">{completedTasks} of {totalTasks} finished</p>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 bg-card border border-border hover:border-neon-pink/60 transition-all border-t-2 border-t-neon-pink shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-mono uppercase mb-1.5">
            <span>[HABIT STREAK]</span>
            <Flame className="w-3.5 h-3.5 text-neon-pink" />
          </div>
          <div className="text-xl font-bold font-mono text-neon-pink flex items-baseline gap-1">
            {completedHabits}/{habits.length}
            <span className="text-[10px] text-muted-foreground font-normal">Active</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">Daily rituals synced</p>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 bg-card border border-border hover:border-neon-green/60 transition-all border-t-2 border-t-neon-green shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-mono uppercase mb-1.5">
            <span>[AGENT RANK]</span>
            <Shield className="w-3.5 h-3.5 text-neon-green" />
          </div>
          <div className="text-xl font-bold font-mono text-neon-green flex items-baseline gap-1">
            Lv.{profile?.level || 1}
            <span className="text-[10px] text-muted-foreground font-normal">Rank</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate">{profile?.title || 'Operative'}</p>
        </div>
      </div>

      {/* Grid: Missions & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Missions (Quests) */}
        <div className="lg:col-span-2 space-y-4">
          <RetroCard variant="default" topStripe className="border-t-primary">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-primary" />
                <RetroCardTitle pixelFont>TODAY'S MISSIONS</RetroCardTitle>
                <RetroBadge variant="primary" pixelFont>
                  {tasks.length}
                </RetroBadge>
              </div>

              <RetroButton
                size="sm"
                variant="secondary"
                onClick={() => setIsAddingTask(!isAddingTask)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Mission
              </RetroButton>
            </RetroCardHeader>

            {/* Quick Add Form */}
            {isAddingTask && (
              <form onSubmit={handleCreateTask} className="mb-4 p-3 bg-secondary border border-border space-y-2">
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
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border p-6 bg-secondary/30">
                  <p className="text-sm font-mono">No missions scheduled for today!</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                    Deploy a quest above or check the Calendar to schedule timeblocks.
                  </p>
                </div>
              ) : (
                tasks.map((task) => {
                  const isDone = task.status === 'COMPLETED'
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`flex items-center justify-between p-3 border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-secondary/40 border-border/40 opacity-50'
                          : 'bg-secondary/80 border-border hover:border-primary/80 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-neon-cyan flex-shrink-0 transition-colors" />
                        )}
                        <div>
                          <p
                            className={`text-xs font-mono font-medium ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-muted-foreground flex items-center font-mono">
                              <Clock className="w-2.5 h-2.5 mr-1" />
                              {task.estimatedMin || 30}m
                            </span>
                            <RetroBadge variant="muted" className="text-[8px] py-0">
                              {task.priority}
                            </RetroBadge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RetroBadge variant={isDone ? 'green' : 'pink'} pixelFont>
                          +{task.xpReward} XP
                        </RetroBadge>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </RetroCard>
        </div>

        {/* Daily Habits & Character Skills */}
        <div className="space-y-6">
          {/* Daily Habits */}
          <RetroCard variant="default" topStripe className="border-t-neon-pink">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-neon-pink" />
                <RetroCardTitle pixelFont>HABIT PROTOCOLS</RetroCardTitle>
              </div>
            </RetroCardHeader>

            <div className="space-y-2">
              {habits.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 font-mono">No habits initialized.</p>
              ) : (
                habits.map((habit) => {
                  const isLoggedToday = habit.logs.some((l) => l.date === todayStr && l.completed)
                  return (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`flex items-center justify-between p-2.5 border transition-all cursor-pointer ${
                        isLoggedToday
                          ? 'bg-secondary/40 border-border/40 opacity-60'
                          : 'bg-secondary/80 border-border hover:border-neon-pink/80 hover:shadow-[0_0_12px_rgba(236,72,153,0.15)]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 flex items-center justify-center border ${
                            isLoggedToday
                              ? 'bg-neon-green/20 border-neon-green text-neon-green'
                              : 'bg-card border-border text-neon-pink'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-medium text-foreground">{habit.name}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">{habit.frequency}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RetroBadge variant={isLoggedToday ? 'green' : 'cyan'} pixelFont>
                          {isLoggedToday ? 'DONE' : `+${habit.xpReward} XP`}
                        </RetroBadge>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </RetroCard>

          {/* Character Skill Matrix */}
          <RetroCard variant="default" topStripe className="border-t-neon-cyan">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-neon-cyan" />
                <RetroCardTitle pixelFont>ATTRIBUTES</RetroCardTitle>
              </div>
            </RetroCardHeader>

            <div className="grid grid-cols-2 gap-2.5">
              {profile?.skills?.map((skill) => (
                <div
                  key={skill.id}
                  className="p-2.5 bg-secondary border border-border hover:border-neon-cyan/50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-foreground">{skill.name}</span>
                    <RetroBadge variant="cyan" pixelFont className="text-[8px] py-0 px-1">
                      Lv.{skill.level}
                    </RetroBadge>
                  </div>
                  <RetroProgressBar value={skill.xp % 100} max={100} variant="cyan" />
                </div>
              ))}
            </div>
          </RetroCard>
        </div>
      </div>
    </div>
  )
}
