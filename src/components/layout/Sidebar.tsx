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
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-neon-cyan',
      activeBg: 'bg-neon-cyan/15 text-neon-cyan border-l-2 border-neon-cyan shadow-[inset_0_0_12px_rgba(34,211,238,0.2)]',
      badge: 'ACTIVE',
      badgeVariant: 'cyan' as const,
    },
    {
      id: 'calendar' as NavTab,
      label: 'Calendar',
      icon: Calendar,
      color: 'text-primary',
      activeBg: 'bg-primary/15 text-primary border-l-2 border-primary shadow-[inset_0_0_12px_rgba(168,85,247,0.2)]',
      badge: 'GRID',
      badgeVariant: 'primary' as const,
    },
    {
      id: 'planner' as NavTab,
      label: 'Planner',
      icon: Clock,
      color: 'text-neon-yellow',
      activeBg: 'bg-neon-yellow/15 text-neon-yellow border-l-2 border-neon-yellow shadow-[inset_0_0_12px_rgba(250,204,21,0.2)]',
      badgeVariant: 'gold' as const,
    },
    {
      id: 'quests' as NavTab,
      label: 'Quests',
      icon: Sword,
      color: 'text-neon-pink',
      activeBg: 'bg-neon-pink/15 text-neon-pink border-l-2 border-neon-pink shadow-[inset_0_0_12px_rgba(236,72,153,0.2)]',
      badge: 'RPG',
      badgeVariant: 'pink' as const,
    },
    {
      id: 'habits' as NavTab,
      label: 'Habits',
      icon: Zap,
      color: 'text-neon-green',
      activeBg: 'bg-neon-green/15 text-neon-green border-l-2 border-neon-green shadow-[inset_0_0_12px_rgba(163,230,53,0.2)]',
      badgeVariant: 'green' as const,
    },
    {
      id: 'progress' as NavTab,
      label: 'Progress',
      icon: TrendingUp,
      color: 'text-neon-blue',
      activeBg: 'bg-neon-blue/15 text-neon-blue border-l-2 border-neon-blue shadow-[inset_0_0_12px_rgba(59,130,246,0.2)]',
      badgeVariant: 'cyan' as const,
    },
    {
      id: 'ai' as NavTab,
      label: 'AI Companion',
      icon: Bot,
      color: 'text-arcade-pink',
      activeBg: 'bg-gradient-to-r from-primary/20 to-neon-pink/20 text-neon-pink border-l-2 border-neon-pink shadow-[inset_0_0_12px_rgba(236,72,153,0.2)]',
      badge: 'GEMINI',
      badgeVariant: 'pink' as const,
    },
  ]

  const currentLevel = profile?.level || 1
  const currentXp = profile?.currentXp || 0
  const xpNeeded = 100 + (currentLevel - 1) * 75

  return (
    <aside className="w-64 bg-[#0a0a0e] border-r border-border flex flex-col justify-between h-full select-none shrink-0 z-20 relative">
      {/* Top Section */}
      <div className="p-4 space-y-5">
        {/* App Title / Logo Banner */}
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-card flex items-center justify-center border-2 border-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.4)] p-0.5 arcade-float relative">
              <img src="/logo.png" alt="LIFE OS" className="w-full h-full object-contain" />
              {/* Corner accent pixel dots */}
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-neon-pink shadow-[0_0_6px_#ec4899]" />
              <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-neon-green shadow-[0_0_6px_#a3e635]" />
            </div>
            <div>
              <h1 className="font-pixel text-[13px] tracking-wider flex items-center gap-1.5">
                <span className="text-foreground">LIFE</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-primary to-neon-pink">
                  OS
                </span>
              </h1>
              <p className="text-[9px] text-neon-cyan font-mono tracking-widest uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                [ARCADE ENGINE]
              </p>
            </div>
          </div>
        </div>

        {/* Character Status Card */}
        <div className="p-3 bg-card border-2 border-border shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden border-t-2 border-t-neon-cyan group hover:border-neon-cyan/70 transition-all">
          {/* Subtle colored corner dots */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-pink/80" />
          <span className="absolute bottom-0 left-0 w-2 h-2 bg-neon-green/80" />

          <div className="flex items-center space-x-3 mb-2.5">
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-secondary border-2 border-neon-pink flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.4)] p-0.5">
                <img src="/logo.png" alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5">
                <RetroBadge variant="pink" pixelFont className="text-[7px] px-1 py-0 shadow-[0_0_8px_rgba(236,72,153,0.5)]">
                  Lv.{currentLevel}
                </RetroBadge>
              </div>
            </div>

            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[10px] font-pixel text-foreground truncate tracking-wide">{profile?.name || 'Player One'}</p>
              <p className="text-[8px] font-pixel truncate text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-cyan font-bold mt-0.5">
                {profile?.title || 'Novice Adventurer'}
              </p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-muted-foreground font-bold">[EXP PROTOCOL]</span>
              <span className="text-neon-cyan font-bold">
                {currentXp} / {xpNeeded}
              </span>
            </div>
            <RetroProgressBar value={currentXp} max={xpNeeded} variant="cyan" />
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
                    ? item.activeBg + ' font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 hover:border-l-2 hover:border-border'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-muted-foreground'} transition-colors`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <RetroBadge
                    variant={isActive ? item.badgeVariant : 'muted'}
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
      <div className="p-3 border-t border-border bg-[#09090b]">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-all duration-150 cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-neon-yellow/15 text-neon-yellow border-l-2 border-neon-yellow font-bold shadow-[inset_0_0_10px_rgba(250,204,21,0.2)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Settings className="w-4 h-4 text-neon-yellow" />
            <span>Settings</span>
          </div>
          <span className="text-[9px] text-neon-yellow/80 font-mono">[CONFIG]</span>
        </button>
      </div>
    </aside>
  )
}
