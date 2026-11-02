import React from 'react'
import {
  LayoutDashboard,
  Calendar,
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

export type NavTab = 'dashboard' | 'planner' | 'quests' | 'habits' | 'progress' | 'ai' | 'settings'

interface SidebarProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  profile: UserProfileDTO | null
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, profile }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner' as NavTab, label: 'Planner', icon: Calendar },
    { id: 'quests' as NavTab, label: 'Quests', icon: Sword },
    { id: 'habits' as NavTab, label: 'Habits', icon: Zap },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'ai' as NavTab, label: 'AI Companion', icon: Bot, badge: 'GEMINI' },
  ]

  const currentLevel = profile?.level || 1
  const currentXp = profile?.currentXp || 0
  const xpNeeded = 100 + (currentLevel - 1) * 75

  return (
    <aside className="w-64 bg-secondary-bg border-r-2 border-border flex flex-col justify-between h-full select-none">
      {/* Top Section */}
      <div className="p-4 space-y-6">
        {/* App Title / Logo */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary flex items-center justify-center border-2 border-[#D8B4FE] shadow-pixel-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-pixel text-[13px] text-foreground tracking-wider">
                LIFE<span className="text-arcade-pink">OS</span>
              </h1>
              <p className="text-[10px] text-muted font-mono tracking-tight">VAPORWAVE RPG</p>
            </div>
          </div>
        </div>

        {/* Character Status Card */}
        <div className="p-3 bg-card border-2 border-border shadow-pixel-sm relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-2.5">
            <div className="relative">
              <div className="w-10 h-10 bg-elevated border-2 border-primary flex items-center justify-center shadow-pixel-sm">
                <Shield className="w-5 h-5 text-cyber-cyan" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <RetroBadge variant="pink" pixelFont>
                  Lv.{currentLevel}
                </RetroBadge>
              </div>
            </div>

            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-foreground truncate">{profile?.name || 'Player One'}</p>
              <p className="text-[10px] text-arcade-pink font-medium truncate">
                {profile?.title || 'Novice Adventurer'}
              </p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-muted">XP PROGRESS</span>
              <span className="text-primary font-bold">
                {currentXp} / {xpNeeded}
              </span>
            </div>
            <RetroProgressBar value={currentXp} max={xpNeeded} variant="purple" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-elevated text-primary border-l-4 border-primary shadow-pixel-sm translate-x-1'
                    : 'text-muted hover:text-foreground hover:bg-elevated/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted'}`} />
                  <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                </div>
                {item.badge && (
                  <RetroBadge variant="cyan" pixelFont className="text-[7px] py-0 px-1">
                    {item.badge}
                  </RetroBadge>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Settings Link */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-elevated text-primary border-l-4 border-primary shadow-pixel-sm'
              : 'text-muted hover:text-foreground hover:bg-elevated/50'
          }`}
        >
          <Settings className="w-4 h-4 text-muted" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  )
}

