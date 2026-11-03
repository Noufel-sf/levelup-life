import React, { useState, useEffect } from 'react'
import {
  Settings,
  Save,
  ShieldCheck,
  Bell,
  Globe,
  Sparkles,
  Send,
  BookOpen,
  Check,
  Search,
  Filter,
  Play,
  Volume2,
  Database,
  Download,
  Upload,
  HardDrive,
} from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroInput } from '@/components/8bit/RetroInput'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { WORLD_QUOTES, WorldQuote, getRandomQuote } from '@/lib/quotes'
import { soundEngine } from '@/lib/sound'
import { UserSettingsDTO, UserProfileDTO } from '@/types/ipc'
import { CharacterCustomizer } from './CharacterCustomizer'

interface SettingsViewProps {
  onTriggerQuote?: (quote?: WorldQuote) => void
  profile?: UserProfileDTO | null
  refreshProfile?: () => void
}

const LANGUAGES = [
  'ALL',
  'Arabic',
  'Japanese',
  'Latin',
  'Chinese',
  'French',
  'Spanish',
  'German',
  'Sanskrit',
  'Swahili',
  'Persian',
  'Italian',
  'Greek',
  'Korean',
  'Turkish',
  'Portuguese',
  'Russian',
]

const INTERVALS = [
  { value: '15', label: 'Every 15 Minutes' },
  { value: '30', label: 'Every 30 Minutes (Recommended)' },
  { value: '60', label: 'Every 1 Hour' },
  { value: '120', label: 'Every 2 Hours' },
  { value: '240', label: 'Every 4 Hours' },
  { value: 'off', label: 'Manual Only (From Titlebar)' },
]

export const SettingsView: React.FC<SettingsViewProps> = ({
  onTriggerQuote,
  profile,
  refreshProfile,
}) => {
  const [settings, setSettings] = useState<UserSettingsDTO | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  // Notification configuration states
  const [desktopEnabled, setDesktopEnabled] = useState<boolean>(true)
  const [interval, setIntervalVal] = useState<string>('30')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL')

  // Quotes browser state
  const [showCodex, setShowCodex] = useState<boolean>(false)
  const [codexSearch, setCodexSearch] = useState<string>('')
  const [codexLanguage, setCodexLanguage] = useState<string>('ALL')

  // Sound FX State
  const [soundMuted, setSoundMuted] = useState<boolean>(soundEngine.isMuted())
  const [soundVolume, setSoundVolume] = useState<number>(Math.round(soundEngine.getVolume() * 100))

  // Data Vault State
  const [backupStatus, setBackupStatus] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [isImporting, setIsImporting] = useState<boolean>(false)

  const handleExportBackup = async () => {
    if (!window.electronAPI?.exportData) return
    setIsExporting(true)
    try {
      const res = await window.electronAPI.exportData()
      if (res.success) {
        soundEngine.playAchievement()
        setBackupStatus(`BACKUP EXPORTED: ${res.stats?.tasks || 0} missions, ${res.stats?.goals || 0} quests`)
      } else if (!res.canceled) {
        setBackupStatus('Export was canceled.')
      }
    } catch (err: any) {
      setBackupStatus(`Export error: ${err?.message || 'Unknown'}`)
    } finally {
      setIsExporting(false)
      setTimeout(() => setBackupStatus(null), 4000)
    }
  }

  const handleImportBackup = async () => {
    if (!window.electronAPI?.importData) return
    const confirmed = window.confirm(
      'WARNING: Importing a backup file will restore and overwrite existing tasks and quests with the same IDs. Proceed with database restore?'
    )
    if (!confirmed) return

    setIsImporting(true)
    try {
      const res = await window.electronAPI.importData()
      if (res.success) {
        soundEngine.playLevelUp()
        setBackupStatus(`DATA RESTORED: ${res.stats?.tasks || 0} missions, ${res.stats?.goals || 0} quests restored!`)
      } else if (!res.canceled) {
        setBackupStatus('Import canceled.')
      }
    } catch (err: any) {
      setBackupStatus(`Import error: ${err?.message || 'Unknown'}`)
    } finally {
      setIsImporting(false)
      setTimeout(() => setBackupStatus(null), 5000)
    }
  }

  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => setSoundMuted(muted))
    return () => unsub()
  }, [])

  useEffect(() => {
    // Load local storage preferences
    const storedDesktop = localStorage.getItem('lifeos_notification_desktop')
    if (storedDesktop !== null) setDesktopEnabled(storedDesktop === 'true')

    const storedInterval = localStorage.getItem('lifeos_notification_interval')
    if (storedInterval !== null) setIntervalVal(storedInterval)

    const storedLang = localStorage.getItem('lifeos_notification_lang')
    if (storedLang !== null) setSelectedLanguage(storedLang)

    // Load backend settings
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((s) => {
        setSettings(s)
        if (s?.geminiApiKey) setApiKey(s.geminiApiKey)
      })
    }
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Persist notification preferences
    localStorage.setItem('lifeos_notification_desktop', String(desktopEnabled))
    localStorage.setItem('lifeos_notification_interval', interval)
    localStorage.setItem('lifeos_notification_lang', selectedLanguage)

    if (window.electronAPI) {
      try {
        const updated = await window.electronAPI.updateSettings({
          geminiApiKey: apiKey.trim() || null,
          notifications: desktopEnabled,
        })
        setSettings(updated)
      } catch (err) {
        console.error('Failed to save settings:', err)
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleTestNotification = () => {
    const q = getRandomQuote(selectedLanguage)
    onTriggerQuote?.(q)
  }

  // Filtered quotes in the Codex browser
  const filteredQuotes = WORLD_QUOTES.filter((q) => {
    const matchesLang =
      codexLanguage === 'ALL' || q.language.toLowerCase() === codexLanguage.toLowerCase()
    const query = codexSearch.toLowerCase()
    const matchesSearch =
      !query ||
      q.original.toLowerCase().includes(query) ||
      q.translation.toLowerCase().includes(query) ||
      q.author.toLowerCase().includes(query) ||
      q.culture.toLowerCase().includes(query) ||
      q.language.toLowerCase().includes(query)
    return matchesLang && matchesSearch
  })

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground font-pixel tracking-wider">
            System Settings
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Configure local preferences, Gemini API credentials & Worldwide Wisdom notifications
          </p>
        </div>
        {saved && (
          <span className="font-pixel text-[10px] text-neon-green flex items-center bg-neon-green/10 border border-neon-green/40 px-2.5 py-1 shadow-[0_0_8px_rgba(163,230,53,0.3)]">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> SETTINGS PERSISTED
          </span>
        )}
      </div>

      {/* Operative Identity & Prestige Title Customizer */}
      <CharacterCustomizer
        profile={profile || null}
        onProfileUpdated={refreshProfile}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Worldwide Wisdom & Notification Hub */}
        <RetroCard variant="accent-cyan" glow topStripe>
          <RetroCardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-neon-cyan" />
              <RetroCardTitle pixelFont>WORLDWIDE WISDOM NOTIFICATIONS</RetroCardTitle>
            </div>
            <RetroBadge variant="cyan" pixelFont className="text-[7px]">
              {WORLD_QUOTES.length} QUOTES LOADED
            </RetroBadge>
          </RetroCardHeader>

          <div className="space-y-4 font-mono text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Receive periodic philosophical quotes from around the globe in their authentic native scripts (Arabic, Japanese, Latin, Chinese, French, Spanish, Sanskrit, Persian, Swahili, etc.) with translated wisdom and author origin.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Desktop Notification Toggle */}
              <div className="bg-secondary/70 p-3.5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-neon-cyan" />
                    Native OS Desktop Notification
                  </label>
                  <input
                    type="checkbox"
                    checked={desktopEnabled}
                    onChange={(e) => setDesktopEnabled(e.target.checked)}
                    className="accent-neon-cyan w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Triggers Windows Notification Center toasts with authentic scripts, English meaning, and audio cue.
                </p>
              </div>

              {/* Notification Interval Selector */}
              <div className="bg-secondary/70 p-3.5 border border-border space-y-2">
                <label className="font-bold text-foreground block">
                  Delivery Frequency Interval
                </label>
                <select
                  value={interval}
                  onChange={(e) => setIntervalVal(e.target.value)}
                  className="w-full bg-card border border-border px-2.5 py-1.5 text-foreground focus:outline-none focus:border-neon-cyan cursor-pointer text-xs"
                >
                  {INTERVALS.map((intv) => (
                    <option key={intv.value} value={intv.value}>
                      {intv.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground">
                  How often quotes should be delivered automatically while the app runs.
                </p>
              </div>

              {/* Preferred Language Filter */}
              <div className="bg-secondary/70 p-3.5 border border-border space-y-2 md:col-span-2">
                <label className="font-bold text-foreground block">
                  Cultural Region & Language Focus
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-card border border-border px-2.5 py-1.5 text-foreground focus:outline-none focus:border-neon-cyan cursor-pointer text-xs"
                >
                  <option value="ALL">🌍 All Worldwide Wisdom (Multi-Language Shuffle)</option>
                  {LANGUAGES.filter((l) => l !== 'ALL').map((lang) => (
                    <option key={lang} value={lang}>
                      {lang} Wisdom Tradition
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground">
                  Pick a specific culture to focus on, or keep it on "All Worldwide Wisdom" for a diverse global journey.
                </p>
              </div>
            </div>

            {/* Test Notification & Browse Codex Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <RetroButton
                  type="button"
                  variant="yellow"
                  size="sm"
                  pixelFont
                  onClick={handleTestNotification}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Test Notification Now
                </RetroButton>

                <RetroButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCodex(!showCodex)}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-neon-cyan" />
                  {showCodex ? 'Hide Quotes Codex' : `Browse All ${WORLD_QUOTES.length} Quotes`}
                </RetroButton>
              </div>

              <span className="text-[10px] text-neon-yellow">
                💡 Tip: Click "GLOBAL WISDOM" on top titlebar anytime
              </span>
            </div>
          </div>
        </RetroCard>

        {/* Global Quotes Codex Browser */}
        {showCodex && (
          <div className="bg-card border-2 border-neon-yellow p-4 shadow-[0_0_25px_rgba(250,204,21,0.2)] space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-neon-yellow" />
                <h3 className="font-pixel text-xs text-neon-yellow tracking-wider">
                  WORLD WISDOM CODEX ({filteredQuotes.length} / {WORLD_QUOTES.length})
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search quote, author, meaning..."
                    value={codexSearch}
                    onChange={(e) => setCodexSearch(e.target.value)}
                    className="bg-secondary border border-border pl-7 pr-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon-yellow font-mono w-48 sm:w-60"
                  />
                </div>

                <select
                  value={codexLanguage}
                  onChange={(e) => setCodexLanguage(e.target.value)}
                  className="bg-secondary border border-border px-2 py-1 text-xs text-foreground focus:outline-none focus:border-neon-yellow font-mono cursor-pointer"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredQuotes.map((q) => {
                const isRtl = q.language === 'Arabic' || q.language === 'Persian'
                return (
                  <div
                    key={q.id}
                    className="bg-secondary/70 p-3 border border-border hover:border-neon-yellow/70 transition-colors space-y-1.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span>{q.flag}</span>
                        <RetroBadge variant="cyan" pixelFont className="text-[7px]">
                          {q.language}
                        </RetroBadge>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          [{q.culture}]
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onTriggerQuote?.(q)}
                        className="text-[9px] text-neon-yellow hover:text-white px-1.5 py-0.5 border border-neon-yellow/50 hover:bg-neon-yellow/20 font-mono transition-colors cursor-pointer"
                        title="Send this exact quote as a desktop notification"
                      >
                        Notify
                      </button>
                    </div>

                    <p
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className={`font-bold ${
                        isRtl
                          ? 'font-serif text-base text-neon-yellow text-right'
                          : 'text-xs text-foreground'
                      }`}
                    >
                      "{q.original}"
                    </p>

                    <p className="text-[11px] text-muted-foreground font-mono border-l border-neon-pink/50 pl-2 leading-relaxed">
                      {q.translation}
                    </p>

                    <p className="text-[9px] text-muted-foreground font-mono text-right font-semibold">
                      — {q.author}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 8-Bit Retro Audio & Chiptune Synthesizer */}
        <RetroCard variant="accent-cyan">
          <RetroCardHeader>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-neon-cyan" />
              <RetroCardTitle pixelFont>8-BIT RETRO SOUND SYNTHESIZER</RetroCardTitle>
            </div>
            <RetroBadge variant={soundMuted ? 'muted' : 'cyan'} pixelFont>
              {soundMuted ? 'AUDIO MUTED' : 'ARCADE SYNTH ACTIVE'}
            </RetroBadge>
          </RetroCardHeader>

          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sound Enabled / Disabled Switch */}
              <div className="p-3 bg-secondary/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-foreground">Sound FX Engine</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newMuted = soundEngine.toggleMute()
                      setSoundMuted(newMuted)
                    }}
                    className={`px-3 py-1 text-[10px] font-pixel border cursor-pointer transition-all ${
                      !soundMuted
                        ? 'bg-neon-cyan text-black border-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                        : 'bg-card text-muted-foreground border-border hover:border-foreground'
                    }`}
                  >
                    {!soundMuted ? 'ENABLED [ON]' : 'MUTED [OFF]'}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Authentic synthesized chiptune square & triangle waves. Zero external audio downloads.
                </p>
              </div>

              {/* Master Volume Slider */}
              <div className="p-3 bg-secondary/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-foreground">Master Synth Volume</span>
                  <span className="text-neon-cyan font-bold">{soundVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => {
                    const vol = Number(e.target.value)
                    setSoundVolume(vol)
                    soundEngine.setVolume(vol / 100)
                  }}
                  className="w-full accent-neon-cyan cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Adjust arcade effect volume level.
                </p>
              </div>
            </div>

            {/* Test Chiptune Sounds Bar */}
            <div className="pt-3 border-t border-border">
              <span className="text-[10px] text-muted-foreground block mb-2 font-bold uppercase">
                Audition Chiptune Sounds:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <RetroButton
                  type="button"
                  variant="cyan"
                  size="sm"
                  onClick={() => soundEngine.playTaskComplete()}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Task Complete (Coin)
                </RetroButton>
                <RetroButton
                  type="button"
                  variant="pink"
                  size="sm"
                  onClick={() => soundEngine.playHabitLog()}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Habit Log (Pulse)
                </RetroButton>
                <RetroButton
                  type="button"
                  variant="green"
                  size="sm"
                  onClick={() => soundEngine.playLevelUp()}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Level Up (Arpeggio)
                </RetroButton>
                <RetroButton
                  type="button"
                  variant="yellow"
                  size="sm"
                  onClick={() => soundEngine.playAchievement()}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Trophy Fanfare
                </RetroButton>
                <RetroButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => soundEngine.playClick()}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Click
                </RetroButton>
              </div>
            </div>
          </div>
        </RetroCard>

        {/* Gemini AI Configuration */}
        <RetroCard variant="default">
          <RetroCardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-primary" />
              <RetroCardTitle pixelFont>GEMINI AI CONFIGURATION</RetroCardTitle>
            </div>
          </RetroCardHeader>

          <div className="space-y-3 font-mono">
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
                Securely encrypted and stored locally in SQLite. Used for AI Companion decomposition.
              </p>
            </div>
          </div>
        </RetroCard>

        {/* Data Vault: Backup & Restore */}
        <RetroCard variant="accent-purple">
          <RetroCardHeader>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-primary" />
              <RetroCardTitle pixelFont>DATA VAULT // BACKUP & RESTORE</RetroCardTitle>
            </div>
            <RetroBadge variant="primary" pixelFont>
              LOCAL SQLITE PERSISTENCE
            </RetroBadge>
          </RetroCardHeader>

          <div className="space-y-4 font-mono text-xs">
            {backupStatus && (
              <div className="p-2.5 bg-primary/20 border border-primary text-neon-cyan font-mono text-xs flex items-center space-x-2 animate-bounce">
                <Sparkles className="w-4 h-4 text-neon-yellow" />
                <span>{backupStatus}</span>
              </div>
            )}

            <p className="text-muted-foreground text-xs leading-relaxed">
              All your progress, habits, quests, milestones, and achievements are stored locally in your SQLite database. You can export a snapshot backup anytime as JSON or restore from an existing backup file.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-secondary/50 border border-border space-y-2">
                <div className="flex items-center space-x-2 text-neon-cyan font-bold">
                  <Download className="w-4 h-4" />
                  <span>EXPORT SYSTEM BACKUP</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Creates a timestamped JSON file containing all missions, quests, habits, and profile stats.
                </p>
                <RetroButton
                  type="button"
                  variant="cyan"
                  size="sm"
                  pixelFont
                  disabled={isExporting}
                  onClick={handleExportBackup}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {isExporting ? 'Exporting...' : 'Export Backup (JSON)'}
                </RetroButton>
              </div>

              <div className="p-3 bg-secondary/50 border border-border space-y-2">
                <div className="flex items-center space-x-2 text-neon-yellow font-bold">
                  <Upload className="w-4 h-4" />
                  <span>RESTORE FROM BACKUP</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Restore quests, tasks, and habits from a previous LIFE OS backup file.
                </p>
                <RetroButton
                  type="button"
                  variant="yellow"
                  size="sm"
                  pixelFont
                  disabled={isImporting}
                  onClick={handleImportBackup}
                >
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  {isImporting ? 'Restoring...' : 'Import & Restore'}
                </RetroButton>
              </div>
            </div>
          </div>
        </RetroCard>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <RetroButton type="submit" variant="primary" pixelFont>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Configuration
          </RetroButton>
        </div>
      </form>
    </div>
  )
}
