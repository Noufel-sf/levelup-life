import React, { useState, useEffect } from 'react'
import { WindowFrame } from './components/layout/WindowFrame'
import { Sidebar, NavTab } from './components/layout/Sidebar'
import { DashboardView } from './features/dashboard/DashboardView'
import { PlannerView } from './features/planner/PlannerView'
import { QuestsView } from './features/quests/QuestsView'
import { HabitsView } from './features/habits/HabitsView'
import { ProgressView } from './features/progress/ProgressView'
import { AICompanionView } from './features/ai-companion/AICompanionView'
import { SettingsView } from './features/settings/SettingsView'
import { UserProfileDTO } from './types/ipc'

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard')
  const [profile, setProfile] = useState<UserProfileDTO | null>(null)

  const refreshProfile = async () => {
    if (window.electronAPI) {
      try {
        const p = await window.electronAPI.getProfile()
        setProfile(p)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      }
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView profile={profile} onRefreshProfile={refreshProfile} />
      case 'planner':
        return <PlannerView />
      case 'quests':
        return <QuestsView />
      case 'habits':
        return <HabitsView />
      case 'progress':
        return <ProgressView profile={profile} />
      case 'ai':
        return <AICompanionView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView profile={profile} onRefreshProfile={refreshProfile} />
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Custom Desktop Title Bar */}
      <WindowFrame />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} profile={profile} />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}

export default App

