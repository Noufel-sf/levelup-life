import React, { useState, useEffect, useMemo } from 'react'
import {
  Sword,
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Filter,
  Sparkles,
  Trophy,
  X,
  Search,
} from 'lucide-react'
import { RetroCard, RetroCardHeader, RetroCardTitle } from '@/components/8bit/RetroCard'
import { RetroButton } from '@/components/8bit/RetroButton'
import { RetroBadge } from '@/components/8bit/RetroBadge'
import { RetroInput } from '@/components/8bit/RetroInput'
import { RetroProgressBar } from '@/components/8bit/RetroProgressBar'
import { GoalDTO, MilestoneDTO } from '@/types/ipc'

interface QuestsViewProps {
  onRefreshProfile?: () => void
}

export const QuestsView: React.FC<QuestsViewProps> = ({ onRefreshProfile }) => {
  const [goals, setGoals] = useState<GoalDTO[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGoalIds, setExpandedGoalIds] = useState<Record<string, boolean>>({})

  // Goal Form Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalDTO | null>(null)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [goalCategory, setGoalCategory] = useState('Career')
  const [goalPriority, setGoalPriority] = useState('HIGH')
  const [goalTargetDate, setGoalTargetDate] = useState('')

  // Inline Milestone Add State
  const [addingMilestoneGoalId, setAddingMilestoneGoalId] = useState<string | null>(null)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    if (!window.electronAPI) return
    const res = await window.electronAPI.getGoals()
    setGoals(res || [])

    // Expand all active goals by default
    const expanded: Record<string, boolean> = {}
    ;(res || []).forEach((g) => {
      expanded[g.id] = g.status === 'ACTIVE'
    })
    setExpandedGoalIds(expanded)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const toggleExpand = (goalId: string) => {
    setExpandedGoalIds((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }))
  }

  // Open modal for new or edit goal
  const openGoalModal = (goal?: GoalDTO) => {
    if (goal) {
      setEditingGoal(goal)
      setGoalTitle(goal.title)
      setGoalDescription(goal.description || '')
      setGoalCategory(goal.category)
      setGoalPriority(goal.priority)
      setGoalTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '')
    } else {
      setEditingGoal(null)
      setGoalTitle('')
      setGoalDescription('')
      setGoalCategory('Career')
      setGoalPriority('HIGH')
      setGoalTargetDate('')
    }
    setIsGoalModalOpen(true)
  }

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalTitle.trim() || !window.electronAPI) return

    if (editingGoal) {
      await window.electronAPI.updateGoal(editingGoal.id, {
        title: goalTitle.trim(),
        description: goalDescription.trim() || null,
        category: goalCategory,
        priority: goalPriority,
        targetDate: goalTargetDate || null,
      })
      showToast('Main Quest Updated!')
    } else {
      await window.electronAPI.createGoal({
        title: goalTitle.trim(),
        description: goalDescription.trim() || null,
        category: goalCategory,
        priority: goalPriority,
        targetDate: goalTargetDate || null,
      })
      showToast('New Main Quest Forged (+100 XP Potential)!')
    }

    setIsGoalModalOpen(false)
    setEditingGoal(null)
    loadGoals()
  }

  const handleDeleteGoal = async (id: string) => {
    if (!window.electronAPI) return
    await window.electronAPI.deleteGoal(id)
    showToast('Main Quest Deleted')
    loadGoals()
  }

  const handleToggleGoal = async (id: string) => {
    if (!window.electronAPI) return
    const res = await window.electronAPI.toggleGoalComplete(id)
    if (res.xpAwarded > 0) {
      showToast(`🏆 MAIN QUEST CONQUERED! +${res.xpAwarded} XP!`)
      onRefreshProfile?.()
    }
    loadGoals()
  }

  // Milestone Actions
  const handleAddMilestone = async (goalId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestoneTitle.trim() || !window.electronAPI) return

    await window.electronAPI.createMilestone({
      goalId,
      title: newMilestoneTitle.trim(),
      xpReward: 50,
    })

    setNewMilestoneTitle('')
    setAddingMilestoneGoalId(null)
    showToast('Milestone Added (+50 XP on completion)!')
    loadGoals()
  }

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!window.electronAPI) return
    const res = await window.electronAPI.toggleMilestoneComplete(milestoneId)
    if (res.xpAwarded > 0) {
      showToast(
        res.goalCompleted
          ? `🏆 ALL MILESTONES COMPLETE! +${res.xpAwarded} XP!`
          : `⚡ Milestone Cleared! +${res.xpAwarded} XP!`
      )
      onRefreshProfile?.()
    }
    loadGoals()
  }

  const handleDeleteMilestone = async (id: string) => {
    if (!window.electronAPI) return
    await window.electronAPI.deleteMilestone(id)
    loadGoals()
  }

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchCat = selectedCategory === 'ALL' || g.category === selectedCategory
      const matchStatus = statusFilter === 'ALL' || g.status === statusFilter
      const matchSearch =
        searchQuery === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchStatus && matchSearch
    })
  }, [goals, selectedCategory, statusFilter, searchQuery])

  const categories = ['ALL', 'Career', 'Health', 'Coding', 'Personal', 'Finance']

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 bg-primary/95 backdrop-blur text-white px-4 py-2.5 border border-primary shadow-[0_0_20px_rgba(168,85,247,0.5)] font-mono text-xs flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-neon-cyan animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border border-t-2 border-t-primary p-6 shadow-[0_0_20px_rgba(168,85,247,0.12)]">
        <div>
          <div className="flex items-center space-x-2 text-primary mb-1">
            <Sword className="w-5 h-5 text-neon-cyan arcade-float" />
            <h1 className="font-pixel text-sm text-foreground tracking-wide">
              MAIN QUESTS & MILESTONES
            </h1>
            <span className="text-[10px] font-mono text-neon-cyan">[RPG ROADMAP]</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Transform high-level life aspirations into actionable milestones and conquering victories.
          </p>
        </div>

        <RetroButton variant="cyan" pixelFont onClick={() => openGoalModal()}>
          <Plus className="w-4 h-4 mr-1.5" />
          Forge Main Quest
        </RetroButton>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border p-3 shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold tracking-wider transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary/20 text-neon-cyan border-neon-cyan/60 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                  : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Switcher & Search */}
        <div className="flex items-center space-x-2 w-full md:w-auto font-mono">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border pl-8 pr-3 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-neon-cyan focus:outline-none"
            />
          </div>

          <div className="flex bg-secondary border border-border p-0.5">
            {(['ACTIVE', 'COMPLETED', 'ALL'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider cursor-pointer ${
                  statusFilter === s ? 'bg-primary/20 text-neon-cyan font-bold border border-neon-cyan/40' : 'text-muted-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quests Cards Grid */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border bg-card/30 p-8 space-y-3">
            <Sword className="w-12 h-12 mx-auto text-muted/40 animate-pulse" />
            <p className="font-bold text-foreground">No Main Quests Found</p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Try adjusting your category filters or search query.'
                : 'Establish your first major life objective by clicking "Forge Main Quest" above.'}
            </p>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const isExpanded = !!expandedGoalIds[goal.id]
            const milestones = goal.milestones || []
            const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length
            const totalCount = milestones.length
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
            const isCompleted = goal.status === 'COMPLETED'

            return (
              <RetroCard
                key={goal.id}
                variant={isCompleted ? 'default' : 'accent-purple'}
                topStripe
                className={isCompleted ? 'border-t-neon-green opacity-70 bg-card/60' : 'border-t-primary'}
              >
                {/* Quest Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleExpand(goal.id)}
                      className="p-1 hover:text-neon-cyan transition-colors text-muted-foreground mt-0.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-neon-cyan" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2.5 mb-1 flex-wrap">
                        <h3
                          className={`font-mono font-bold text-base ${
                            isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {goal.title}
                        </h3>
                        <RetroBadge variant="cyan" pixelFont className="text-[8px]">
                          {goal.category}
                        </RetroBadge>
                        <RetroBadge
                          variant={
                            goal.priority === 'CRITICAL'
                              ? 'pink'
                              : goal.priority === 'HIGH'
                              ? 'gold'
                              : 'muted'
                          }
                          className="text-[8px]"
                        >
                          {goal.priority}
                        </RetroBadge>
                        {isCompleted && (
                          <RetroBadge variant="green" pixelFont className="text-[8px]">
                            CONQUERED
                          </RetroBadge>
                        )}
                      </div>

                      {goal.description && (
                        <p className="text-xs text-muted-foreground font-mono line-clamp-2 mt-0.5">
                          {goal.description}
                        </p>
                      )}

                      {/* Milestone Progress Bar */}
                      <div className="mt-3 max-w-md">
                        <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground mb-1">
                          <span>MILESTONES COMPLETED</span>
                          <span className="text-neon-cyan font-bold">
                            {completedCount}/{totalCount} ({Math.round(progress)}%)
                          </span>
                        </div>
                        <RetroProgressBar
                          value={progress}
                          max={100}
                          variant={isCompleted ? 'green' : 'purple'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <RetroButton
                      size="sm"
                      variant={isCompleted ? 'secondary' : 'cyan'}
                      pixelFont
                      onClick={() => handleToggleGoal(goal.id)}
                    >
                      {isCompleted ? 'Reopen' : 'Conquer (+100 XP)'}
                    </RetroButton>

                    <button
                      onClick={() => openGoalModal(goal)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary border border-transparent hover:border-border transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Milestones Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-[10px] text-muted flex items-center">
                        <Target className="w-3 h-3 mr-1.5 text-arcade-pink" />
                        MILESTONE STEPPING STONES
                      </span>

                      <button
                        onClick={() =>
                          setAddingMilestoneGoalId(
                            addingMilestoneGoalId === goal.id ? null : goal.id
                          )
                        }
                        className="text-xs font-semibold text-primary hover:text-[#c084fc] flex items-center"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Milestone Step
                      </button>
                    </div>

                    {/* Quick Add Milestone Form */}
                    {addingMilestoneGoalId === goal.id && (
                      <form
                        onSubmit={(e) => handleAddMilestone(goal.id, e)}
                        className="p-2.5 bg-elevated border border-border flex items-center gap-2"
                      >
                        <RetroInput
                          placeholder="e.g. Master Closures and Event Loop, Build Portfolio..."
                          value={newMilestoneTitle}
                          onChange={(e) => setNewMilestoneTitle(e.target.value)}
                          autoFocus
                          required
                        />
                        <RetroButton type="submit" size="sm" variant="cyan" pixelFont>
                          Save (+50 XP)
                        </RetroButton>
                        <RetroButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setAddingMilestoneGoalId(null)}
                        >
                          Cancel
                        </RetroButton>
                      </form>
                    )}

                    {/* Milestones List */}
                    <div className="space-y-1.5 pl-2 font-mono">
                      {milestones.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground/70 italic py-2">
                          No milestones added yet. Break this quest down into tangible stages above!
                        </p>
                      ) : (
                        milestones.map((m) => {
                          const mDone = m.status === 'COMPLETED'
                          return (
                            <div
                              key={m.id}
                              onClick={() => handleToggleMilestone(m.id)}
                              className={`flex items-center justify-between p-2.5 border transition-all cursor-pointer ${
                                mDone
                                  ? 'bg-secondary/40 border-border/40 opacity-50'
                                  : 'bg-secondary/80 border-border hover:border-neon-pink/80 hover:shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                {mDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground hover:text-neon-pink shrink-0 transition-colors" />
                                )}
                                <span
                                  className={`text-xs ${
                                    mDone ? 'line-through text-muted-foreground' : 'text-foreground font-medium'
                                  }`}
                                >
                                  {m.title}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <RetroBadge variant={mDone ? 'green' : 'pink'} pixelFont>
                                  +{m.xpReward} XP
                                </RetroBadge>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteMilestone(m.id)
                                  }}
                                  className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </RetroCard>
            )
          })
        )}
      </div>

      {/* Main Quest Modal Dialog */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border border-border border-t-2 border-t-neon-cyan shadow-[0_0_30px_rgba(34,211,238,0.25)] p-6 relative">
            <button
              onClick={() => setIsGoalModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <Sword className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-pixel text-xs text-primary">
                {editingGoal ? 'UPDATE MAIN QUEST' : 'FORGE NEW MAIN QUEST'}
              </h3>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">Quest Title</label>
                <RetroInput
                  placeholder="e.g. Master TypeScript & Advanced Architecture..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">
                  Description / Motivation
                </label>
                <textarea
                  placeholder="Why is this quest meaningful? What does victory look like?"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary border border-border p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-neon-cyan focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:border-neon-cyan focus:outline-none font-mono"
                  >
                    <option value="Career">Career</option>
                    <option value="Coding">Coding</option>
                    <option value="Health">Physical Health</option>
                    <option value="Personal">Personal Mastery</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">Priority</label>
                  <select
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:border-neon-cyan focus:outline-none font-mono"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-muted-foreground mb-1">Target Date</label>
                  <RetroInput
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border mt-4">
                <RetroButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsGoalModalOpen(false)}
                >
                  Cancel
                </RetroButton>
                <RetroButton type="submit" size="sm" variant="cyan" pixelFont>
                  {editingGoal ? 'Update Quest' : 'Inscribe Quest (+100 XP)'}
                </RetroButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
