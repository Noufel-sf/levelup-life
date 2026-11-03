import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react'
import { soundEngine } from '@/lib/sound'
import { TaskDTO, UserProfileDTO } from '@/types/ipc'

export type TimerMode = 'FOCUS_25' | 'FOCUS_45' | 'FOCUS_60' | 'BREAK_5' | 'BREAK_15'

export interface ModeConfig {
  label: string
  durationMin: number
  isBreak: boolean
  color: string
}

export const MODE_CONFIGS: Record<TimerMode, ModeConfig> = {
  FOCUS_25: { label: '25m Sprint', durationMin: 25, isBreak: false, color: 'text-neon-pink border-neon-pink' },
  FOCUS_45: { label: '45m Deep Dive', durationMin: 45, isBreak: false, color: 'text-neon-cyan border-neon-cyan' },
  FOCUS_60: { label: '60m Power Hour', durationMin: 60, isBreak: false, color: 'text-primary border-primary' },
  BREAK_5: { label: '5m Recharge', durationMin: 5, isBreak: true, color: 'text-neon-green border-neon-green' },
  BREAK_15: { label: '15m Neural Rest', durationMin: 15, isBreak: true, color: 'text-neon-yellow border-neon-yellow' },
}

interface FocusContextType {
  mode: TimerMode
  secondsRemaining: number
  isRunning: boolean
  selectedTaskId: string
  customGoal: string
  tasks: TaskDTO[]
  selectedTask: TaskDTO | undefined
  isMiniMode: boolean
  completedSession: { xp: number; label: string } | null
  currentTotalSeconds: number
  timeFormatted: string
  progressPercent: number
  stats: { todayCount: number; todayXp: number; totalSessions: number; totalFocusXp: number }
  setMode: (mode: TimerMode) => void
  setSelectedTaskId: (id: string) => void
  setCustomGoal: (goal: string) => void
  toggleTimer: () => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  enterMiniMode: () => Promise<void>
  exitMiniMode: () => Promise<void>
  toggleMiniMode: () => Promise<void>
  conquerSprint: () => Promise<void>
  dismissCompletedSession: () => void
  refreshTasks: () => Promise<void>
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export const FocusProvider: React.FC<{ children: ReactNode; onRefreshProfile?: () => void }> = ({
  children,
  onRefreshProfile,
}) => {
  const [mode, setModeState] = useState<TimerMode>('FOCUS_25')
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [customGoal, setCustomGoal] = useState<string>('')
  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [isMiniMode, setIsMiniMode] = useState<boolean>(false)
  const [completedSession, setCompletedSession] = useState<{ xp: number; label: string } | null>(null)
  const [stats, setStats] = useState({
    todayCount: 0,
    todayXp: 0,
    totalSessions: 0,
    totalFocusXp: 0,
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const currentTotalSeconds = useMemo(() => MODE_CONFIGS[mode].durationMin * 60, [mode])

  const refreshTasks = async () => {
    if (!window.electronAPI) return
    try {
      const [allTasks, fStats] = await Promise.all([
        window.electronAPI.getTasks(),
        window.electronAPI.getFocusStats?.() || Promise.resolve({ todayCount: 0, todayXp: 0, totalSessions: 0, totalFocusXp: 0 }),
      ])
      setTasks((allTasks || []).filter((t) => t.status !== 'COMPLETED'))
      setStats(fStats)
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    refreshTasks()
  }, [])

  const setMode = (newMode: TimerMode) => {
    soundEngine.playClick()
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setModeState(newMode)
    setSecondsRemaining(MODE_CONFIGS[newMode].durationMin * 60)
  }

  const toggleTimer = () => {
    soundEngine.playClick()
    setIsRunning((prev) => !prev)
  }

  const startTimer = () => {
    soundEngine.playClick()
    setIsRunning(true)
  }

  const pauseTimer = () => {
    soundEngine.playClick()
    setIsRunning(false)
  }

  const resetTimer = () => {
    soundEngine.playClick()
    setIsRunning(false)
    setSecondsRemaining(MODE_CONFIGS[mode].durationMin * 60)
  }

  const conquerSprint = async () => {
    setIsRunning(false)
    const isBreak = MODE_CONFIGS[mode].isBreak

    if (isBreak) {
      soundEngine.playTaskComplete()
      setMode('FOCUS_25')
      return
    }

    soundEngine.playLevelUp()
    const durationMin = MODE_CONFIGS[mode].durationMin
    const chosenTask = tasks.find((t) => t.id === selectedTaskId)
    const label = chosenTask ? chosenTask.title : customGoal.trim() || `${durationMin}m Deep Work Sprint`

    if (window.electronAPI?.completeFocusSession) {
      try {
        const res = await window.electronAPI.completeFocusSession({
          durationMin,
          taskId: selectedTaskId || null,
          customTitle: label,
        })
        setCompletedSession({ xp: res.xpAwarded, label })
        onRefreshProfile?.()
        refreshTasks()
      } catch (err) {
        console.error('Failed to complete focus session:', err)
      }
    }
  }

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            conquerSprint()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, mode, selectedTaskId, customGoal])

  // Mini Widget Mode Controls
  const enterMiniMode = async () => {
    if (!window.electronAPI?.setMiniWidgetMode) return
    soundEngine.playClick()
    const res = await window.electronAPI.setMiniWidgetMode(true)
    setIsMiniMode(res.isMini)
  }

  const exitMiniMode = async () => {
    if (!window.electronAPI?.setMiniWidgetMode) return
    soundEngine.playClick()
    const res = await window.electronAPI.setMiniWidgetMode(false)
    setIsMiniMode(res.isMini)
  }

  const toggleMiniMode = async () => {
    if (isMiniMode) {
      await exitMiniMode()
    } else {
      await enterMiniMode()
    }
  }

  const dismissCompletedSession = () => {
    setCompletedSession(null)
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)
  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const elapsed = currentTotalSeconds - secondsRemaining
  const progressPercent = Math.min(100, Math.round((elapsed / currentTotalSeconds) * 100))

  return (
    <FocusContext.Provider
      value={{
        mode,
        secondsRemaining,
        isRunning,
        selectedTaskId,
        customGoal,
        tasks,
        selectedTask,
        isMiniMode,
        completedSession,
        currentTotalSeconds,
        timeFormatted,
        progressPercent,
        stats,
        setMode,
        setSelectedTaskId,
        setCustomGoal,
        toggleTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        enterMiniMode,
        exitMiniMode,
        toggleMiniMode,
        conquerSprint,
        dismissCompletedSession,
        refreshTasks,
      }}
    >
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = () => {
  const context = useContext(FocusContext)
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider')
  }
  return context
}
