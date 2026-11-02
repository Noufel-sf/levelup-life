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
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Banner */}
      {notification && (
        <div className="fixed top-12 right-6 z-50 bg-primary text-white px-4 py-2 border-2 border-[#D8B4FE] shadow-pixel-purple animate-bounce font-pixel text-xs">
          ⚡ {notification}
        </div>
      )}

      {/* Header / Welcome Section */}
      <div className="relative p-6 bg-gradient-to-r from-card via-elevated to-secondary-bg border-2 border-border shadow-pixel-md overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#100B1D] border-2 border-primary shadow-pixel-purple p-1 shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="LIFE OS" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-arcade-pink text-xs font-mono font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {new Date().toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{getGreeting()}</h2>
              <p className="text-xs text-muted mt-1">
                "Every completed mission shapes the hero you become. Level up your reality."
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#100B1D]/80 p-3 border border-border shadow-pixel-sm">
            <div className="text-right">
              <p className="text-[10px] text-muted font-mono uppercase">Daily Progress</p>
              <p className="font-pixel text-sm text-cyber-cyan">
                {completedTasks}/{totalTasks} Done
              </p>
            </div>
            <div className="w-20">
              <RetroProgressBar value={taskCompletionRate} max={100} variant="cyan" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Missions & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Missions (Quests) */}
        <div className="lg:col-span-2 space-y-4">
          <RetroCard variant="default">
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
              <form onSubmit={handleCreateTask} className="mb-4 p-3 bg-elevated border border-border space-y-2">
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
            <div className="space-y-2.5">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted border border-dashed border-border p-6">
                  <p className="text-sm font-medium">No missions scheduled for today!</p>
                  <p className="text-xs text-muted/70 mt-1">
                    Deploy a quest above or check the Planner to build your day.
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
                          ? 'bg-elevated/40 border-border/50 opacity-60'
                          : 'bg-elevated border-border hover:border-primary shadow-pixel-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-terminal-green flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted hover:text-primary flex-shrink-0" />
                        )}
                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              isDone ? 'line-through text-muted' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-muted flex items-center">
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
          <RetroCard variant="default">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-arcade-pink" />
                <RetroCardTitle pixelFont>HABIT PROTOCOLS</RetroCardTitle>
              </div>
            </RetroCardHeader>

            <div className="space-y-2">
              {habits.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No habits initialized.</p>
              ) : (
                habits.map((habit) => {
                  const isLoggedToday = habit.logs.some((l) => l.date === todayStr && l.completed)
                  return (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`flex items-center justify-between p-2.5 border transition-all cursor-pointer ${
                        isLoggedToday
                          ? 'bg-elevated/40 border-border/50 opacity-70'
                          : 'bg-elevated border-border hover:border-arcade-pink'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 flex items-center justify-center border ${
                            isLoggedToday
                              ? 'bg-terminal-green/20 border-terminal-green text-terminal-green'
                              : 'bg-card border-border text-arcade-pink'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{habit.name}</p>
                          <p className="text-[9px] text-muted font-mono">{habit.frequency}</p>
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
          <RetroCard variant="default">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyber-cyan" />
                <RetroCardTitle pixelFont>ATTRIBUTES</RetroCardTitle>
              </div>
            </RetroCardHeader>

            <div className="grid grid-cols-2 gap-2.5">
              {profile?.skills?.map((skill) => (
                <div
                  key={skill.id}
                  className="p-2 bg-elevated border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-foreground">{skill.name}</span>
                    <RetroBadge variant="cyan" pixelFont className="text-[8px] py-0 px-1">
                      Lv.{skill.level}
                    </RetroBadge>
                  </div>
                  <RetroProgressBar value={skill.xp % 100} max={100} variant="purple" />
                </div>
              ))}
            </div>
          </RetroCard>
        </div>
      </div>
    </div>
  )
}

