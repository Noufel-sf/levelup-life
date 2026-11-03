import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Profile & XP
  getProfile: () => ipcRenderer.invoke('profile:get'),
  updateProfile: (data: any) => ipcRenderer.invoke('profile:update', data),
  getXPHistory: (limit?: number) => ipcRenderer.invoke('xp:getHistory', limit),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (data: any) => ipcRenderer.invoke('settings:update', data),

  // Goals
  getGoals: () => ipcRenderer.invoke('goals:list'),
  createGoal: (data: any) => ipcRenderer.invoke('goals:create', data),
  updateGoal: (id: string, data: any) => ipcRenderer.invoke('goals:update', { id, data }),
  toggleGoalComplete: (id: string) => ipcRenderer.invoke('goals:toggleComplete', id),
  deleteGoal: (id: string) => ipcRenderer.invoke('goals:delete', id),

  // Milestones
  createMilestone: (data: any) => ipcRenderer.invoke('milestones:create', data),
  toggleMilestoneComplete: (id: string) => ipcRenderer.invoke('milestones:toggleComplete', id),
  deleteMilestone: (id: string) => ipcRenderer.invoke('milestones:delete', id),

  // Tasks
  getTasks: (filter?: any) => ipcRenderer.invoke('tasks:list', filter),
  createTask: (data: any) => ipcRenderer.invoke('tasks:create', data),
  updateTask: (id: string, data: any) => ipcRenderer.invoke('tasks:update', { id, data }),
  toggleTaskComplete: (id: string) => ipcRenderer.invoke('tasks:toggleComplete', id),
  deleteTask: (id: string) => ipcRenderer.invoke('tasks:delete', id),

  // Habits
  getHabits: () => ipcRenderer.invoke('habits:list'),
  createHabit: (data: any) => ipcRenderer.invoke('habits:create', data),
  updateHabit: (id: string, data: any) => ipcRenderer.invoke('habits:update', { id, data }),
  toggleHabitComplete: (habitId: string, date: string) =>
    ipcRenderer.invoke('habits:toggleDate', { habitId, date }),
  deleteHabit: (id: string) => ipcRenderer.invoke('habits:delete', id),

  // Notifications & Worldwide Quotes
  sendQuoteNotification: (quote?: any) => ipcRenderer.invoke('notifications:sendQuote', quote),
  getRandomQuote: (languageFilter?: string) => ipcRenderer.invoke('notifications:getRandomQuote', languageFilter),
  listQuotes: () => ipcRenderer.invoke('notifications:listQuotes'),

  // Gemini AI Companion
  aiDecomposeGoal: (prompt: string) => ipcRenderer.invoke('ai:decomposeGoal', prompt),
  aiDeployGoal: (data: any) => ipcRenderer.invoke('ai:deployGoal', data),
  aiSuggestDailyPlan: (dateStr?: string) => ipcRenderer.invoke('ai:suggestDailyPlan', dateStr),
  aiChat: (message: string, history?: any[]) => ipcRenderer.invoke('ai:chat', { message, history }),
})
