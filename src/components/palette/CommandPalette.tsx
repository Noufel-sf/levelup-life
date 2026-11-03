import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  LayoutDashboard,
  Calendar,
  Clock,
  Sword,
  Zap,
  TrendingUp,
  Bot,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  X,
  Crosshair,
} from 'lucide-react'
import { soundEngine } from '@/lib/sound'
import { NavTab } from '@/components/layout/Sidebar'
import { TaskDTO, GoalDTO } from '@/types/ipc'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (tab: NavTab) => void
  onTriggerQuote: () => void
}

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  category: 'NAVIGATION' | 'ACTIONS' | 'MISSIONS' | 'QUESTS'
  color: string
  action: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerQuote,
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [goals, setGoals] = useState<GoalDTO[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      loadSearchData()
    }
  }, [isOpen])

  const loadSearchData = async () => {
    if (!window.electronAPI) return
    try {
      const [tList, gList] = await Promise.all([
        window.electronAPI.getTasks(),
        window.electronAPI.getGoals(),
      ])
      setTasks(tList || [])
      setGoals(gList || [])
    } catch {
      // Ignore
    }
  }

  // Base navigation commands
  const navCommands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Today overview, missions & habits',
      icon: LayoutDashboard,
      category: 'NAVIGATION',
      color: 'text-neon-cyan',
      action: () => {
        onNavigate('dashboard')
        onClose()
      },
    },
    {
      id: 'nav-calendar',
      title: 'Go to Calendar',
      subtitle: 'Monthly grid & schedule',
      icon: Calendar,
      category: 'NAVIGATION',
      color: 'text-primary',
      action: () => {
        onNavigate('calendar')
        onClose()
      },
    },
    {
      id: 'nav-planner',
      title: 'Go to Planner',
      subtitle: 'Weekly workload & mission backlog',
      icon: Clock,
      category: 'NAVIGATION',
      color: 'text-neon-yellow',
      action: () => {
        onNavigate('planner')
        onClose()
      },
    },
    {
      id: 'nav-quests',
      title: 'Go to Quests',
      subtitle: 'Main goals & milestone trees',
      icon: Sword,
      category: 'NAVIGATION',
      color: 'text-neon-pink',
      action: () => {
        onNavigate('quests')
        onClose()
      },
    },
    {
      id: 'nav-habits',
      title: 'Go to Habits',
      subtitle: 'Daily protocols & consistency streaks',
      icon: Zap,
      category: 'NAVIGATION',
      color: 'text-neon-green',
      action: () => {
        onNavigate('habits')
        onClose()
      },
    },
    {
      id: 'nav-progress',
      title: 'Go to Progress & Analytics',
      subtitle: 'XP velocity curve, skill tree & trophies',
      icon: TrendingUp,
      category: 'NAVIGATION',
      color: 'text-neon-yellow',
      action: () => {
        onNavigate('progress')
        onClose()
      },
    },
    {
      id: 'nav-focus',
      title: 'Go to Focus Cyberdeck',
      subtitle: 'Pomodoro 25m sprints & deep work runner',
      icon: Crosshair,
      category: 'NAVIGATION',
      color: 'text-neon-pink',
      action: () => {
        onNavigate('focus')
        onClose()
      },
    },
    {
      id: 'nav-ai',
      title: 'Go to AI Companion',
      subtitle: 'Quest architect & weekly AI mentor',
      icon: Bot,
      category: 'NAVIGATION',
      color: 'text-neon-cyan',
      action: () => {
        onNavigate('ai')
        onClose()
      },
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Sound synth, quotes & API keys',
      icon: Settings,
      category: 'NAVIGATION',
      color: 'text-muted-foreground',
      action: () => {
        onNavigate('settings')
        onClose()
      },
    },
  ]

  // Action commands
  const actionCommands: CommandItem[] = [
    {
      id: 'act-focus',
      title: 'Initiate 25m Deep Work Sprint',
      subtitle: 'Launch Pomodoro timer and synthesize Focus XP',
      icon: Crosshair,
      category: 'ACTIONS',
      color: 'text-neon-pink',
      action: () => {
        onNavigate('focus')
        onClose()
      },
    },
    {
      id: 'act-quote',
      title: 'Draw Global Wisdom Quote',
      subtitle: 'Send desktop notification from world traditions',
      icon: Sparkles,
      category: 'ACTIONS',
      color: 'text-neon-yellow',
      action: () => {
        onTriggerQuote()
        onClose()
      },
    },
    {
      id: 'act-toggle-audio',
      title: soundEngine.isMuted() ? 'Unmute 8-Bit Audio Synth' : 'Mute 8-Bit Audio Synth',
      subtitle: 'Toggle retro sound effects on or off',
      icon: soundEngine.isMuted() ? Volume2 : VolumeX,
      category: 'ACTIONS',
      color: 'text-neon-cyan',
      action: () => {
        soundEngine.toggleMute()
        onClose()
      },
    },
    {
      id: 'act-fanfare',
      title: 'Audition Trophy Fanfare',
      subtitle: 'Play 8-bit victory sound',
      icon: Play,
      category: 'ACTIONS',
      color: 'text-neon-yellow',
      action: () => {
        soundEngine.playAchievement()
        onClose()
      },
    },
  ]

  // Mission Search Results
  const taskCommands: CommandItem[] = tasks
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: `Mission • ${t.priority} • ${t.scheduledDate || 'Backlog'} • +${t.xpReward} XP`,
      icon: Clock,
      category: 'MISSIONS',
      color: t.status === 'COMPLETED' ? 'text-neon-green' : 'text-neon-cyan',
      action: () => {
        onNavigate('planner')
        onClose()
      },
    }))

  // Quest Search Results
  const goalCommands: CommandItem[] = goals
    .filter((g) => g.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4)
    .map((g) => ({
      id: `goal-${g.id}`,
      title: g.title,
      subtitle: `Main Quest • ${g.category} • ${g.milestones?.length || 0} Milestones`,
      icon: Sword,
      category: 'QUESTS',
      color: 'text-neon-pink',
      action: () => {
        onNavigate('quests')
        onClose()
      },
    }))

  // Combine and filter commands based on query
  const filteredCommands = [
    ...actionCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.subtitle?.toLowerCase().includes(query.toLowerCase())
    ),
    ...navCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.subtitle?.toLowerCase().includes(query.toLowerCase())
    ),
    ...(query.trim() ? [...taskCommands, ...goalCommands] : []),
  ]

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      soundEngine.playClick()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      soundEngine.playClick()
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        soundEngine.playClick()
        filteredCommands[selectedIndex].action()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-card border-2 border-neon-cyan shadow-[0_0_35px_rgba(34,211,238,0.35)] overflow-hidden relative font-mono text-xs"
        onKeyDown={handleKeyDown}
      >
        {/* Glowing neon corner accents */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-green shadow-[0_0_8px_#a3e635]" />

        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-border bg-[#0d0c14] flex items-center space-x-3">
          <Search className="w-5 h-5 text-neon-cyan shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command, quest, or mission to jump..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-mono"
          />
          <span className="hidden sm:inline-block px-1.5 py-0.5 border border-border bg-secondary text-[9px] text-muted-foreground font-mono">
            ESC TO EXIT
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/40 p-1.5">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-pixel text-xs text-neon-yellow">NO MATCHING PROTOCOLS</p>
              <p className="text-[11px] mt-1">Try another keyword or search query.</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon
              const isSelected = idx === selectedIndex

              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    soundEngine.playClick()
                    cmd.action()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neon-cyan/15 border-l-4 border-neon-cyan text-foreground shadow-[inset_0_0_15px_rgba(34,211,238,0.15)]'
                      : 'hover:bg-secondary/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 flex items-center justify-center border ${
                        isSelected
                          ? 'border-neon-cyan bg-neon-cyan/20 ' + cmd.color
                          : 'border-border bg-secondary ' + cmd.color
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-pixel text-[11px] truncate tracking-wide ${
                            isSelected ? 'text-foreground font-bold' : 'text-foreground/90'
                          }`}
                        >
                          {cmd.title}
                        </span>
                        <span className="text-[8px] font-mono px-1 py-0 border border-border bg-background uppercase text-muted-foreground">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5 font-mono">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center space-x-1 text-neon-cyan shrink-0 pl-2">
                      <span className="text-[9px] font-pixel">EXEC</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-3 py-1.5 bg-[#0d0c14] border-t border-border flex items-center justify-between text-[9px] text-muted-foreground font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-neon-cyan font-bold">LIFE OS // COMMAND PALETTE</span>
        </div>
      </div>
    </div>
  )
}

