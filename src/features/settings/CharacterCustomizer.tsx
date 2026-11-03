import React, { useState, useEffect } from 'react'
import { User, Shield, Sparkles, Check, Lock, Award, Crown } from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroInput } from '@/components/8bit/RetroInput'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { PixelAvatar } from '@/components/character/PixelAvatar'
import { AVATARS, TITLES, getAvatarById, CharacterTitle } from '@/lib/avatars'
import { soundEngine } from '@/lib/sound'
import { UserProfileDTO } from '@/types/ipc'

interface CharacterCustomizerProps {
  profile: UserProfileDTO | null
  onProfileUpdated?: () => void
}

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    profile?.avatarId || 'cyber-knight'
  )
  const [selectedTitle, setSelectedTitle] = useState<string>(
    profile?.title || 'Novice Adventurer'
  )
  const [playerName, setPlayerName] = useState<string>(
    profile?.name || 'Player One'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setSelectedAvatarId(profile.avatarId || 'cyber-knight')
      setSelectedTitle(profile.title || 'Novice Adventurer')
      setPlayerName(profile.name || 'Player One')
    }
  }, [profile])

  const userLevel = profile?.level || 1
  const activeAvatar = getAvatarById(selectedAvatarId)

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!window.electronAPI?.updateProfile) return

    setIsSaving(true)
    try {
      await window.electronAPI.updateProfile({
        name: playerName.trim() || 'Player One',
        avatarId: selectedAvatarId,
        title: selectedTitle,
      })
      soundEngine.playAchievement()
      setSavedSuccess(true)
      if (onProfileUpdated) onProfileUpdated()
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to update character profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <RetroCard variant="accent-cyan" glow topStripe>
      <RetroCardHeader>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-neon-cyan" />
          <RetroCardTitle pixelFont>OPERATIVE AVATAR & TITLE CUSTOMIZER</RetroCardTitle>
        </div>
        <RetroBadge variant="cyan" pixelFont className="text-[7px]">
          LV.{userLevel} CLEARANCE
        </RetroBadge>
      </RetroCardHeader>

      <div className="space-y-6 font-mono text-xs">
        <p className="text-muted-foreground leading-relaxed">
          Customize your retro cyberpunk avatar sprite and equip unlocked prestige titles earned by leveling up your real-life productivity.
        </p>

        {/* Live Holographic Identity Card */}
        <div className="p-4 bg-secondary/80 border-2 border-neon-cyan/60 shadow-[0_0_20px_rgba(34,211,238,0.2)] relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-neon-pink shadow-[0_0_8px_#ec4899]" />
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-neon-green shadow-[0_0_8px_#a3e635]" />

          <div className="relative">
            <PixelAvatar
              avatarId={selectedAvatarId}
              size="xl"
              showBorder
              glow
              className="border-neon-cyan shadow-[0_0_25px_rgba(34,211,238,0.5)]"
            />
            <div className="absolute -bottom-2 -right-2">
              <RetroBadge variant="pink" pixelFont className="text-[8px] px-1.5 py-0.5 shadow-[0_0_10px_#ec4899]">
                Lv.{userLevel}
              </RetroBadge>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="font-pixel text-sm text-foreground tracking-wider truncate">
                {playerName || 'Player One'}
              </h3>
              <RetroBadge variant="cyan" pixelFont className="text-[7px]">
                {activeAvatar.role}
              </RetroBadge>
            </div>

            <p className="font-pixel text-[11px] text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-cyan font-bold truncate">
              « {selectedTitle} »
            </p>

            <p className="text-[10px] text-muted-foreground italic max-w-lg">
              "{activeAvatar.description}"
            </p>
          </div>

          {/* Quick Save Call-to-Action */}
          <div className="shrink-0">
            <RetroButton
              variant={savedSuccess ? 'green' : 'cyan'}
              size="md"
              pixelFont
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  PERSISTED!
                </>
              ) : isSaving ? (
                'SAVING...'
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-neon-yellow" />
                  EQUIP IDENTITY
                </>
              )}
            </RetroButton>
          </div>
        </div>

        {/* Section 1: Operative Call-Sign Name */}
        <div className="space-y-2 bg-card/60 p-3.5 border border-border">
          <label className="block text-xs font-bold text-foreground">
            Operative Call-Sign (Display Name)
          </label>
          <RetroInput
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter call-sign..."
            maxLength={24}
            className="font-pixel text-xs tracking-wider"
          />
          <p className="text-[10px] text-muted-foreground">
            Displayed across the command dashboard, tactical debriefs, and system titlebars.
          </p>
        </div>

        {/* Section 2: Choose Pixel Avatar Sprite */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-foreground flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-neon-cyan" />
              Select Cyber Avatar (8 Pixel Classes)
            </label>
            <span className="text-[10px] text-muted-foreground font-mono">
              Selected: <span className="text-neon-cyan font-bold">{activeAvatar.name}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AVATARS.map((av) => {
              const isSelected = selectedAvatarId === av.id
              return (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => {
                    soundEngine.playClick()
                    setSelectedAvatarId(av.id)
                  }}
                  className={`p-3 bg-card border-2 flex flex-col items-center text-center transition-all cursor-pointer relative group ${
                    isSelected
                      ? `${av.borderClass} ${av.glowClass} bg-secondary/80`
                      : 'border-border hover:border-muted-foreground/60 hover:bg-secondary/40'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1 right-1">
                      <span className="w-2 h-2 rounded-full bg-neon-green inline-block shadow-[0_0_6px_#a3e635]" />
                    </span>
                  )}

                  <PixelAvatar
                    avatarId={av.id}
                    size="lg"
                    showBorder={false}
                    className="mb-2 transition-transform group-hover:scale-105"
                  />

                  <span className="font-pixel text-[9px] text-foreground font-bold tracking-wider mb-0.5 truncate w-full">
                    {av.name}
                  </span>
                  <span className={`text-[8px] font-mono uppercase ${av.accentClass} truncate w-full`}>
                    {av.role}
                  </span>

                  {isSelected && (
                    <RetroBadge
                      variant="cyan"
                      pixelFont
                      className="text-[6px] px-1 py-0 mt-2 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                    >
                      EQUIPPED
                    </RetroBadge>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section 3: Select Unlocked Character Title / Rank */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-foreground flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-neon-yellow" />
              Select Character Title & Rank
            </label>
            <span className="text-[10px] text-muted-foreground font-mono">
              Unlocked by character progression level
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {TITLES.map((t: CharacterTitle) => {
              const isUnlocked = userLevel >= t.minLevel
              const isSelected = selectedTitle === t.title

              return (
                <button
                  type="button"
                  key={t.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) {
                      soundEngine.playClick()
                      setSelectedTitle(t.title)
                    }
                  }}
                  className={`p-2.5 border-2 text-left transition-all relative ${
                    !isUnlocked
                      ? 'bg-black/40 border-border/40 opacity-45 cursor-not-allowed'
                      : isSelected
                      ? 'bg-secondary border-neon-yellow shadow-[0_0_12px_rgba(250,204,21,0.3)] cursor-pointer'
                      : 'bg-card border-border hover:border-foreground/40 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[7px] font-pixel font-bold px-1 py-0 border ${
                        t.tier === 'LEGENDARY'
                          ? 'text-neon-pink border-neon-pink/60 bg-neon-pink/10'
                          : t.tier === 'MASTER'
                          ? 'text-neon-yellow border-neon-yellow/60 bg-neon-yellow/10'
                          : t.tier === 'VETERAN'
                          ? 'text-neon-green border-neon-green/60 bg-neon-green/10'
                          : 'text-muted-foreground border-border bg-secondary/50'
                      }`}
                    >
                      {t.tier}
                    </span>

                    {!isUnlocked ? (
                      <span className="flex items-center gap-1 text-[8px] font-mono text-neon-pink font-bold">
                        <Lock className="w-2.5 h-2.5" />
                        LV.{t.minLevel}
                      </span>
                    ) : isSelected ? (
                      <span className="flex items-center gap-1 text-[8px] font-mono text-neon-yellow font-bold">
                        <Check className="w-2.5 h-2.5" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono text-neon-green">UNLOCKED</span>
                    )}
                  </div>

                  <div className="font-pixel text-[9px] text-foreground tracking-wide truncate">
                    {t.title}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </RetroCard>
  )
}
