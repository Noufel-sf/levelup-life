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
  deleteGoal: (id: string) => ipcRenderer.invoke('goals:delete', id),

  // Tasks
  getTasks: (filter?: any) => ipcRenderer.invoke('tasks:list', filter),
  createTask: (data: any) => ipcRenderer.invoke('tasks:create', data),
  toggleTaskComplete: (id: string) => ipcRenderer.invoke('tasks:toggleComplete', id),
  deleteTask: (id: string) => ipcRenderer.invoke('tasks:delete', id),

  // Habits
  getHabits: () => ipcRenderer.invoke('habits:list'),
  createHabit: (data: any) => ipcRenderer.invoke('habits:create', data),
  toggleHabitComplete: (habitId: string, date: string) =>
    ipcRenderer.invoke('habits:toggleDate', { habitId, date }),
  deleteHabit: (id: string) => ipcRenderer.invoke('habits:delete', id),
})
