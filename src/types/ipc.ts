export interface UserProfileDTO {
  id: string
  name: string
  title: string
  level: number
  currentXp: number
  totalXp: number
  avatarId: string
  skills: SkillDTO[]
}

export interface SkillDTO {
  id: string
  name: string
  level: number
  xp: number
  icon: string
  color: string
}

export interface UserSettingsDTO {
  id: string
  theme: string
  startScreen: string
  dateFormat: string
  timeFormat: string
  timezone: string
  geminiApiKey: string | null
  aiModel: string
  notifications: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
}

export interface GoalDTO {
  id: string
  title: string
  description?: string | null
  category: string
  priority: string
  targetDate?: string | null
  status: string
  icon?: string | null
  color?: string | null
  milestones: MilestoneDTO[]
  tasks?: TaskDTO[]
}

export interface MilestoneDTO {
  id: string
  goalId: string
  title: string
  description?: string | null
  order: number
  status: string
  xpReward: number
  completedAt?: string | null
}

export interface TaskDTO {
  id: string
  title: string
  description?: string | null
  goalId?: string | null
  milestoneId?: string | null
  skillId?: string | null
  type: string
  priority: string
  difficulty: string
  estimatedMin?: number | null
  scheduledDate?: string | null
  startTime?: string | null
  endTime?: string | null
  color?: string | null
  dueDateTime?: string | null
  xpReward: number
  status: string
  completedAt?: string | null
  goal?: { id: string; title: string; category: string } | null
  skill?: { id: string; name: string; color: string } | null
}

export interface HabitDTO {
  id: string
  name: string
  description?: string | null
  icon: string
  category: string
  frequency: string
  daysOfWeek: string
  targetDuration?: number | null
  reminderTime?: string | null
  xpReward: number
  archived: boolean
  logs: { date: string; completed: boolean }[]
}

export interface XPTransactionDTO {
  id: string
  amount: number
  sourceType: string
  sourceId: string
  description: string
  createdAt: string
}

export interface ElectronAPI {
  // Window controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>

  // Profile & XP
  getProfile: () => Promise<UserProfileDTO>
  updateProfile: (data: Partial<UserProfileDTO>) => Promise<UserProfileDTO>
  getXPHistory: (limit?: number) => Promise<XPTransactionDTO[]>

  // Settings
  getSettings: () => Promise<UserSettingsDTO>
  updateSettings: (data: Partial<UserSettingsDTO>) => Promise<UserSettingsDTO>

  // Goals & Quests
  getGoals: () => Promise<GoalDTO[]>
  createGoal: (data: Partial<GoalDTO>) => Promise<GoalDTO>
  updateGoal: (id: string, data: Partial<GoalDTO>) => Promise<GoalDTO>
  toggleGoalComplete: (id: string) => Promise<{ goal: GoalDTO; profile: UserProfileDTO; xpAwarded: number }>
  deleteGoal: (id: string) => Promise<boolean>

  // Milestones
  createMilestone: (data: { goalId: string; title: string; description?: string; xpReward?: number }) => Promise<MilestoneDTO>
  toggleMilestoneComplete: (id: string) => Promise<{ milestone: MilestoneDTO; profile: UserProfileDTO; xpAwarded: number; goalCompleted?: boolean }>
  deleteMilestone: (id: string) => Promise<boolean>

  // Tasks / Missions
  getTasks: (filter?: { scheduledDate?: string; status?: string }) => Promise<TaskDTO[]>
  createTask: (data: Partial<TaskDTO>) => Promise<TaskDTO>
  updateTask: (id: string, data: Partial<TaskDTO>) => Promise<TaskDTO>
  toggleTaskComplete: (id: string) => Promise<{ task: TaskDTO; profile: UserProfileDTO; xpAwarded: number }>
  deleteTask: (id: string) => Promise<boolean>

  // Habits
  getHabits: () => Promise<HabitDTO[]>
  createHabit: (data: Partial<HabitDTO>) => Promise<HabitDTO>
  updateHabit: (id: string, data: Partial<HabitDTO>) => Promise<HabitDTO>
  toggleHabitComplete: (habitId: string, date: string) => Promise<{ habit: HabitDTO; profile: UserProfileDTO; xpAwarded: number }>
  deleteHabit: (id: string) => Promise<boolean>

  // Notifications & Worldwide Quotes
  sendQuoteNotification: (quote?: any) => Promise<any>
  getRandomQuote: (languageFilter?: string) => Promise<any>
  listQuotes: () => Promise<any[]>

  // Gemini AI Companion
  aiDecomposeGoal: (prompt: string) => Promise<any>
  aiDeployGoal: (data: any) => Promise<any>
  aiSuggestDailyPlan: (dateStr?: string) => Promise<any>
  aiChat: (message: string, history?: any[]) => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

