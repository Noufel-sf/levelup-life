import React from 'react'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Sword,
  Zap,
  TrendingUp,
  Bot,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react'
import { RetroProgressBar } from '../8bit/RetroProgressBar'
import { RetroBadge } from '../8bit/RetroBadge'
import { UserProfileDTO } from '@/types/ipc'

export type NavTab = 'dashboard' | 'calendar' | 'planner' | 'quests' | 'habits' | 'progress' | 'ai' | 'settings'

interface SidebarProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  profile: UserProfileDTO | null
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, profile }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: Calendar, badge: 'GRID' },
    { id: 'planner' as NavTab, label: 'Planner', icon: Clock },
    { id: 'quests' as NavTab, label: 'Quests', icon: Sword, badge: 'ACTIVE' },
    { id: 'habits' as NavTab, label: 'Habits', icon: Zap },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'ai' as NavTab, label: 'AI Companion', icon: Bot, badge: 'GEMINI' },
  ]

  const currentLevel = profile?.level || 1
  const currentXp = profile?.currentXp || 0
  const xpNeeded = 100 + (currentLevel - 1) * 75

  return (
    <aside className="w-64 bg-[#0c0c0e] border-r border-border flex flex-col justify-between h-full select-none shrink-0 z-20">
      {/* Top Section */}
      <div className="p-4 space-y-5">
        {/* App Title / Logo */}
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-card flex items-center justify-center border border-neon-cyan/60 shadow-[0_0_12px_rgba(34,211,238,0.25)] p-0.5 arcade-float">
              <img src="/logo.png" alt="LIFE OS" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-pixel text-[12px] text-foreground tracking-wider flex items-center gap-1">
                LIFE<span className="text-neon-cyan">OS</span>
              </h1>
              <p className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase">
                [RETRO RPG ENGINE]
              </p>
            </div>
          </div>
        </div>

        {/* Character Status Card */}
        <div className="p-3 bg-card border border-border shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden border-t-2 border-t-primary">
          <div className="flex items-center space-x-3 mb-2.5">
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-secondary border border-primary/60 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)] p-0.5">
                <img src="/logo.png" alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5">
                <RetroBadge variant="pink" pixelFont className="text-[7px] px-1 py-0 shadow-[0_0_8px_rgba(236,72,153,0.4)]">
                  Lv.{currentLevel}
                </RetroBadge>
              </div>
            </div>

            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-mono font-bold text-foreground truncate">{profile?.name || 'Player One'}</p>
              <p className="text-[10px] text-neon-cyan font-mono truncate">
                {profile?.title || 'Novice Adventurer'}
              </p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-muted-foreground">XP PROGRESS</span>
              <span className="text-neon-cyan font-bold">
                {currentXp} / {xpNeeded}
              </span>
            </div>
            <RetroProgressBar value={currentXp} max={xpNeeded} variant="purple" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-primary/15 text-neon-cyan border-l-2 border-neon-cyan shadow-[inset_0_0_12px_rgba(34,211,238,0.1)] font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:border-l-2 hover:border-border'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neon-cyan' : 'text-muted-foreground'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <RetroBadge
                    variant={isActive ? 'cyan' : 'muted'}
                    pixelFont
                    className="text-[7px] py-0 px-1"
                  >
                    {item.badge}
                  </RetroBadge>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom System Settings */}
      <div className="p-3 border-t border-border bg-[#09090b]/50">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-all duration-150 cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-primary/15 text-neon-cyan border-l-2 border-neon-cyan font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span>Settings</span>
          </div>
          <span className="text-[9px] text-muted-foreground/60">[CONFIG]</span>
        </button>
      </div>
    </aside>
  )
}
