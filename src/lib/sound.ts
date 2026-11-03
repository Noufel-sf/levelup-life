// 8-Bit Retro Web Audio Synthesizer Engine
// Provides authentic NES/Arcade chiptune sound effects with zero external assets

class RetroSoundEngine {
  private ctx: AudioContext | null = null
  private muted: boolean = false
  private volume: number = 0.25
  private listeners: Set<(muted: boolean) => void> = new Set()

  constructor() {
    // Load persisted preferences
    const storedMuted = localStorage.getItem('lifeos_sound_muted')
    if (storedMuted !== null) {
      this.muted = storedMuted === 'true'
    }

    const storedVol = localStorage.getItem('lifeos_sound_volume')
    if (storedVol !== null) {
      const parsed = parseFloat(storedVol)
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        this.volume = parsed
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public isMuted(): boolean {
    return this.muted
  }

  public getVolume(): number {
    return this.volume
  }

  public toggleMute(): boolean {
    this.muted = !this.muted
    localStorage.setItem('lifeos_sound_muted', String(this.muted))
    this.listeners.forEach((cb) => cb(this.muted))
    if (!this.muted) {
      this.playClick()
    }
    return this.muted
  }

  public setMuted(muted: boolean): void {
    this.muted = muted
    localStorage.setItem('lifeos_sound_muted', String(this.muted))
    this.listeners.forEach((cb) => cb(this.muted))
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('lifeos_sound_volume', String(this.volume))
  }

  public subscribe(cb: (muted: boolean) => void): () => void {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }

  /**
   * Subtle UI Button Click / Tab Switch (30ms blip)
   */
  public playClick(): void {
    if (this.muted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {
      // Audio autoplay policy catch
    }
  }

  /**
   * 8-Bit Coin / Task Complete Chime
   * Classic B5 -> E6 chime
   */
  public playTaskComplete(): void {
    if (this.muted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime

      // Tone 1: B5 (987.77 Hz)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'square'
      osc1.frequency.setValueAtTime(987.77, now)
      gain1.gain.setValueAtTime(this.volume * 0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.09)

      // Tone 2: E6 (1318.51 Hz)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'square'
      osc2.frequency.setValueAtTime(1318.51, now + 0.08)
      gain2.gain.setValueAtTime(this.volume * 0.35, now + 0.08)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.08)
      osc2.stop(now + 0.4)
    } catch {
      // Ignore audio interruption
    }
  }

  /**
   * Habit Logged Chime
   * Energetic double pulse (440Hz -> 880Hz)
   */
  public playHabitLog(): void {
    if (this.muted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.setValueAtTime(659.25, now + 0.06) // E5
      osc.frequency.setValueAtTime(880, now + 0.12) // A5

      gain.gain.setValueAtTime(this.volume * 0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.28)
    } catch {
      // Ignore
    }
  }

  /**
   * Level Up Fanfare
   * Ascending 8-bit celebratory arpeggio: C5 -> E5 -> G5 -> C6 -> E6
   */
  public playLevelUp(): void {
    if (this.muted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51] // C5, E5, G5, C6, E6
      const step = 0.07

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, now + idx * step)

        gain.gain.setValueAtTime(this.volume * 0.3, now + idx * step)
        const duration = idx === notes.length - 1 ? 0.45 : 0.09
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * step + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * step)
        osc.stop(now + idx * step + duration)
      })
    } catch {
      // Ignore
    }
  }

  /**
   * Trophy / Achievement Fanfare
   * Victorious brass arcade fanfare
   */
  public playAchievement(): void {
    if (this.muted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      // Fanfare: G4 -> C5 -> E5 -> G5 (held)
      const notes = [
        { freq: 392.0, time: 0, dur: 0.1 },
        { freq: 523.25, time: 0.1, dur: 0.1 },
        { freq: 659.25, time: 0.2, dur: 0.1 },
        { freq: 783.99, time: 0.3, dur: 0.5 },
      ]

      notes.forEach((n) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(n.freq, now + n.time)

        gain.gain.setValueAtTime(this.volume * 0.35, now + n.time)
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + n.time)
        osc.stop(now + n.time + n.dur)
      })
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new RetroSoundEngine()

