import React, { useState, useEffect, useCallback, useRef } from 'react'
import { WindowFrame } from './components/layout/WindowFrame'
import { Sidebar, NavTab } from './components/layout/Sidebar'
import { DashboardView } from './features/dashboard/DashboardView'
import { CalendarView } from './features/calendar/CalendarView'
import { PlannerView } from './features/planner/PlannerView'
import { QuestsView } from './features/quests/QuestsView'
import { HabitsView } from './features/habits/HabitsView'
import { ProgressView } from './features/progress/ProgressView'
import { FocusView } from './features/focus/FocusView'
import { AICompanionView } from './features/ai-companion/AICompanionView'
import { SettingsView } from './features/settings/SettingsView'
import { QuoteNotificationToast } from './components/notifications/QuoteNotificationToast'
import { AchievementToast } from './components/notifications/AchievementToast'
import { CommandPalette } from './components/palette/CommandPalette'
import { DesktopFloatingWidget } from './components/focus/DesktopFloatingWidget'
import { InAppFloatingHUD } from './components/focus/InAppFloatingHUD'
import { FocusProvider, useFocus } from './context/FocusContext'
import { WorldQuote, getRandomQuote } from './lib/quotes'
import { soundEngine } from './lib/sound'
import { UserProfileDTO, AchievementDTO } from './types/ipc'

function AppShell({
  profile,
  refreshProfile,
  triggerQuote,
  activeQuote,
  setActiveQuote,
  activeAchievement,
  setActiveAchievement,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  currentTab,
  setCurrentTab,
}: {
  profile: UserProfileDTO | null
  refreshProfile: () => void
  triggerQuote: (customQuote?: WorldQuote) => void
  activeQuote: WorldQuote | null
  setActiveQuote: (q: WorldQuote | null) => void
  activeAchievement: AchievementDTO | null
  setActiveAchievement: (a: AchievementDTO | null) => void
  isCommandPaletteOpen: boolean
  setIsCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>
  currentTab: NavTab
  setCurrentTab: (tab: NavTab) => void
}) {
  const { isMiniMode } = useFocus()

  // If in Always-On-Top Mini Widget mode, render only the floating arcade HUD
  if (isMiniMode) {
    return <DesktopFloatingWidget />
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView profile={profile} onRefreshProfile={refreshProfile} />
      case 'calendar':
        return <CalendarView onRefreshProfile={refreshProfile} />
      case 'planner':
        return <PlannerView onRefreshProfile={refreshProfile} />
      case 'quests':
        return <QuestsView onRefreshProfile={refreshProfile} />
      case 'habits':
        return <HabitsView onRefreshProfile={refreshProfile} />
      case 'progress':
        return <ProgressView profile={profile} />
      case 'focus':
        return <FocusView profile={profile} onRefreshProfile={refreshProfile} />
      case 'ai':
        return <AICompanionView onRefreshProfile={refreshProfile} onNavigateTab={setCurrentTab} />
      case 'settings':
        return <SettingsView onTriggerQuote={triggerQuote} profile={profile} refreshProfile={refreshProfile} />
      default:
        return <DashboardView profile={profile} onRefreshProfile={refreshProfile} />
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden selection:bg-primary/30 selection:text-neon-cyan relative">
      {/* DEV SCOPE Scanlines Overlay */}
      <div className="scanlines fixed inset-0 z-50 pointer-events-none opacity-20" />

      {/* Custom Desktop Title Bar with Wisdom Quote Button & Command Runner */}
      <WindowFrame
        onTriggerQuote={() => triggerQuote()}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} profile={profile} />

        {/* Scrollable Content View with ambient grid & colorful radiant glows */}
        <main className="flex-1 overflow-y-auto p-6 relative grid-pattern">
          {/* Ambient colorful cyber light sources */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-neon-cyan/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[450px] h-[350px] bg-neon-pink/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">{renderContent()}</div>
        </main>
      </div>

      {/* In-App Floating Mini HUD (visible when timer running and outside focus tab) */}
      <InAppFloatingHUD
        currentTab={currentTab}
        onNavigateToFocus={() => setCurrentTab('focus')}
      />

      {/* Global Command Palette Omnibar */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
        onTriggerQuote={() => triggerQuote()}
      />

      {/* Global In-App Quote Notification Toast */}
      <QuoteNotificationToast
        quote={activeQuote}
        onClose={() => setActiveQuote(null)}
        onNextQuote={() => triggerQuote()}
      />

      {/* Global Achievement Unlocked Toast */}
      <AchievementToast
        achievement={activeAchievement}
        onClose={() => setActiveAchievement(null)}
      />
    </div>
  )
}

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard')
  const [profile, setProfile] = useState<UserProfileDTO | null>(null)
  const [activeQuote, setActiveQuote] = useState<WorldQuote | null>(null)
  const [activeAchievement, setActiveAchievement] = useState<AchievementDTO | null>(null)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const prevLevelRef = useRef<number | null>(null)

  const checkAchievements = async () => {
    if (window.electronAPI?.checkAchievements) {
      try {
        const newlyUnlocked = await window.electronAPI.checkAchievements()
        if (newlyUnlocked && newlyUnlocked.length > 0) {
          setActiveAchievement(newlyUnlocked[0])
          refreshProfile()
        }
      } catch (err) {
        console.error('Failed to check achievements:', err)
      }
    }
  }

  const refreshProfile = async () => {
    if (window.electronAPI) {
      try {
        const p = await window.electronAPI.getProfile()
        if (p) {
          if (prevLevelRef.current !== null && p.level > prevLevelRef.current) {
            soundEngine.playLevelUp()
          }
          prevLevelRef.current = p.level
        }
        setProfile(p)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      }
    }
  }

  const triggerQuote = useCallback((customQuote?: WorldQuote) => {
    const selectedLang = localStorage.getItem('lifeos_notification_lang') || 'ALL'
    const q = customQuote || getRandomQuote(selectedLang)
    setActiveQuote(q)

    // Check if desktop notifications are enabled
    const desktopEnabled = localStorage.getItem('lifeos_notification_desktop') !== 'false'
    if (desktopEnabled && window.electronAPI?.sendQuoteNotification) {
      window.electronAPI.sendQuoteNotification(q).catch((err) => {
        console.error('Failed to dispatch native notification:', err)
      })
    }
  }, [])

  useEffect(() => {
    refreshProfile()
    checkAchievements()

    const setupTimer = () => {
      const intervalPref = localStorage.getItem('lifeos_notification_interval') || '30'
      if (intervalPref === 'off') return null

      const minutes = parseInt(intervalPref, 10) || 30
      const ms = minutes * 60 * 1000
      return setInterval(() => {
        triggerQuote()
      }, ms)
    }

    const intervalId = setupTimer()
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [triggerQuote])

  // Global Keyboard Shortcuts (Ctrl+K for Omnibar, Ctrl+, for Settings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        soundEngine.playClick()
        setIsCommandPaletteOpen((prev) => !prev)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        soundEngine.playClick()
        setCurrentTab('settings')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <FocusProvider onRefreshProfile={refreshProfile}>
      <AppShell
        profile={profile}
        refreshProfile={refreshProfile}
        triggerQuote={triggerQuote}
        activeQuote={activeQuote}
        setActiveQuote={setActiveQuote}
        activeAchievement={activeAchievement}
        setActiveAchievement={setActiveAchievement}
        isCommandPaletteOpen={isCommandPaletteOpen}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
    </FocusProvider>
  )
}

export default App

