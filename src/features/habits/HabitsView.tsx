import React, { useState, useEffect } from 'react'
import { Zap, Plus } from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroInput } from '@/components/8bit/RetroInput'
import { HabitDTO } from '@/types/ipc'

export const HabitsView: React.FC = () => {
  const [habits, setHabits] = useState<HabitDTO[]>([])
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    if (!window.electronAPI) return
    const res = await window.electronAPI.getHabits()
    setHabits(res || [])
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !window.electronAPI) return
    await window.electronAPI.createHabit({
      name: name.trim(),
      frequency: 'DAILY',
      xpReward: 10,
    })
    setName('')
    setIsCreating(false)
    loadHabits()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Habit Protocol System</h2>
          <p className="text-xs text-muted">Daily and weekly recurring habits that award consistent XP</p>
        </div>
        <RetroButton size="sm" variant="pink" onClick={() => setIsCreating(!isCreating)} pixelFont>
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Protocol
        </RetroButton>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 bg-card border-2 border-border shadow-pixel-sm space-y-3">
          <h4 className="font-pixel text-xs text-arcade-pink">INITIALIZE PROTOCOL</h4>
          <RetroInput
            placeholder="Habit name (e.g. 30min Deep Work, 2L Water, Workout)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <RetroButton type="button" size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </RetroButton>
            <RetroButton type="submit" size="sm" variant="pink" pixelFont>
              Activate (+10 XP)
            </RetroButton>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => (
          <RetroCard key={habit.id} variant="accent-pink">
            <RetroCardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-arcade-pink" />
                <span className="font-bold text-sm text-foreground">{habit.name}</span>
              </div>
              <RetroBadge variant="green" pixelFont>
                +{habit.xpReward} XP
              </RetroBadge>
            </RetroCardHeader>
            <p className="text-xs text-muted">Schedule: {habit.frequency}</p>
          </RetroCard>
        ))}
      </div>
    </div>
  )
}

