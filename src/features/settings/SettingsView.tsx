import React, { useState, useEffect } from 'react'
import { Settings, Save, ShieldCheck } from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroInput } from '@/components/8bit/RetroInput'
import { UserSettingsDTO } from '@/types/ipc'

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettingsDTO | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((s) => {
        setSettings(s)
        if (s?.geminiApiKey) setApiKey(s.geminiApiKey)
      })
    }
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!window.electronAPI) return
    const updated = await window.electronAPI.updateSettings({
      geminiApiKey: apiKey.trim() || null,
    })
    setSettings(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">System Settings</h2>
          <p className="text-xs text-muted">Configure local preferences, Gemini API credentials & notifications</p>
        </div>
        {saved && (
          <span className="font-pixel text-[10px] text-terminal-green flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> SETTINGS PERSISTED
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <RetroCard variant="default">
          <RetroCardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-primary" />
              <RetroCardTitle pixelFont>GEMINI AI CONFIGURATION</RetroCardTitle>
            </div>
          </RetroCardHeader>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Google Gemini API Key
              </label>
              <RetroInput
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-[10px] text-muted/80 mt-1">
                Securely encrypted and stored locally in SQLite. Never sent to remote servers.
              </p>
            </div>
          </div>
        </RetroCard>

        <div className="flex justify-end">
          <RetroButton type="submit" variant="primary" pixelFont>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Configuration
          </RetroButton>
        </div>
      </form>
    </div>
  )
}

