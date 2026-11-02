import React, { useState, useEffect } from 'react'
import { Sword, Plus } from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroInput } from '@/components/8bit/RetroInput'
import { GoalDTO } from '@/types/ipc'

export const QuestsView: React.FC = () => {
  const [goals, setGoals] = useState<GoalDTO[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Career')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    if (!window.electronAPI) return
    const res = await window.electronAPI.getGoals()
    setGoals(res || [])
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !window.electronAPI) return
    await window.electronAPI.createGoal({
      title: newTitle.trim(),
      category: newCategory,
      priority: 'HIGH',
    })
    setNewTitle('')
    setIsCreating(false)
    loadGoals()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Main Quests & Milestones</h2>
          <p className="text-xs text-muted">Long-term objectives broken down into progressive victories</p>
        </div>
        <RetroButton size="sm" variant="primary" onClick={() => setIsCreating(!isCreating)} pixelFont>
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Main Quest
        </RetroButton>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 bg-card border-2 border-border shadow-pixel-sm space-y-3">
          <h4 className="font-pixel text-xs text-primary">FORGE MAIN QUEST</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RetroInput
              placeholder="Goal title (e.g., Master TypeScript & AI Engineering)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-[#100B1D] border-2 border-border px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="Career">Career & Coding</option>
              <option value="Health">Physical Health</option>
              <option value="Personal">Personal Mastery</option>
              <option value="Finance">Financial Freedom</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <RetroButton type="button" size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </RetroButton>
            <RetroButton type="submit" size="sm" variant="cyan" pixelFont>
              Save Quest (+100 XP)
            </RetroButton>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-2 text-center py-12 border border-dashed border-border p-6 text-muted">
            <Sword className="w-8 h-8 mx-auto mb-2 text-muted/60" />
            <p className="text-sm font-semibold">No Main Quests established yet.</p>
            <p className="text-xs mt-1">Embark on your journey by creating your first life goal!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <RetroCard key={goal.id} variant="accent-purple" glow>
              <RetroCardHeader>
                <div className="flex items-center space-x-2">
                  <Sword className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm text-foreground">{goal.title}</span>
                </div>
                <RetroBadge variant="cyan" pixelFont>
                  {goal.category}
                </RetroBadge>
              </RetroCardHeader>

              <div className="space-y-2 text-xs text-muted">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span>Milestones: {goal.milestones?.length || 0}</span>
                  <span className="text-terminal-green">ACTIVE</span>
                </div>
              </div>
            </RetroCard>
          ))
        )}
      </div>
    </div>
  )
}

