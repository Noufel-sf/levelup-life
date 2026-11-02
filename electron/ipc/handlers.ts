import { ipcMain, BrowserWindow } from 'electron'
import { prisma } from '../db/prisma'
import { XPService } from '../services/XPService'

export function registerIpcHandlers(mainWindow: BrowserWindow) {
  // Window controls
  ipcMain.handle('window:minimize', () => mainWindow.minimize())
  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.handle('window:close', () => mainWindow.close())

  // Profile & Settings
  ipcMain.handle('profile:get', async () => {
    return await prisma.userProfile.findFirst({
      include: { skills: true },
    })
  })

  ipcMain.handle('profile:update', async (_, data) => {
    const profile = await prisma.userProfile.findFirst()
    if (!profile) throw new Error("Profile not found")
    return await prisma.userProfile.update({
      where: { id: profile.id },
      data,
      include: { skills: true },
    })
  })

  ipcMain.handle('settings:get', async () => {
    return await prisma.userSettings.findFirst()
  })

  ipcMain.handle('settings:update', async (_, data) => {
    const settings = await prisma.userSettings.findFirst()
    if (!settings) throw new Error("Settings not found")
    return await prisma.userSettings.update({
      where: { id: settings.id },
      data,
    })
  })

  ipcMain.handle('xp:getHistory', async (_, limit = 20) => {
    return await prisma.xPTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  })

  // Goals
  ipcMain.handle('goals:list', async () => {
    return await prisma.goal.findMany({
      include: { milestones: { orderBy: { order: 'asc' } }, tasks: true },
      orderBy: { createdAt: 'desc' },
    })
  })

  ipcMain.handle('goals:create', async (_, data) => {
    return await prisma.goal.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category || 'General',
        priority: data.priority || 'MEDIUM',
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        icon: data.icon,
        color: data.color,
      },
      include: { milestones: true, tasks: true },
    })
  })

  ipcMain.handle('goals:update', async (_, { id, data }) => {
    return await prisma.goal.update({
      where: { id },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
      include: { milestones: true, tasks: true },
    })
  })

  ipcMain.handle('goals:delete', async (_, id: string) => {
    await prisma.goal.delete({ where: { id } })
    return true
  })

  // Tasks
  ipcMain.handle('tasks:list', async (_, filter) => {
    const where: any = {}
    if (filter?.scheduledDate) {
      where.scheduledDate = filter.scheduledDate
    }
    if (filter?.status) {
      where.status = filter.status
    }

    return await prisma.task.findMany({
      where,
      include: {
        goal: { select: { id: true, title: true, category: true } },
        skill: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  ipcMain.handle('tasks:create', async (_, data) => {
    return await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        goalId: data.goalId || null,
        milestoneId: data.milestoneId || null,
        skillId: data.skillId || null,
        type: data.type || 'DAILY_MISSION',
        priority: data.priority || 'MEDIUM',
        difficulty: data.difficulty || 'MEDIUM',
        estimatedMin: data.estimatedMin || 30,
        scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        color: data.color || 'cyan',
        xpReward: data.xpReward || 20,
        status: 'TODO',
      },
      include: {
        goal: { select: { id: true, title: true, category: true } },
        skill: { select: { id: true, name: true, color: true } },
      },
    })
  })

  ipcMain.handle('tasks:update', async (_, { id, data }) => {
    return await prisma.task.update({
      where: { id },
      data,
      include: {
        goal: { select: { id: true, title: true, category: true } },
        skill: { select: { id: true, name: true, color: true } },
      },
    })
  })

  ipcMain.handle('tasks:toggleComplete', async (_, id: string) => {
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) throw new Error("Task not found")

    const willBeCompleted = task.status !== 'COMPLETED'
    const newStatus = willBeCompleted ? 'COMPLETED' : 'TODO'

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: willBeCompleted ? new Date() : null,
      },
      include: {
        goal: { select: { id: true, title: true, category: true } },
        skill: { select: { id: true, name: true, color: true } },
      },
    })

    let updatedProfile = await prisma.userProfile.findFirst({ include: { skills: true } })
    let xpAwarded = 0

    if (willBeCompleted) {
      xpAwarded = task.xpReward
      updatedProfile = await XPService.awardXP(
        xpAwarded,
        'TASK',
        task.id,
        `Completed: ${task.title}`,
        task.skillId
      )
    }

    return { task: updatedTask, profile: updatedProfile!, xpAwarded }
  })

  ipcMain.handle('tasks:delete', async (_, id: string) => {
    await prisma.task.delete({ where: { id } })
    return true
  })

  // Habits
  ipcMain.handle('habits:list', async () => {
    return await prisma.habit.findMany({
      where: { archived: false },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  })

  ipcMain.handle('habits:create', async (_, data) => {
    return await prisma.habit.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon || 'Zap',
        category: data.category || 'General',
        frequency: data.frequency || 'DAILY',
        daysOfWeek: data.daysOfWeek || '1,2,3,4,5,6,7',
        targetDuration: data.targetDuration,
        reminderTime: data.reminderTime,
        xpReward: data.xpReward || 10,
      },
      include: { logs: true },
    })
  })

  ipcMain.handle('habits:toggleDate', async (_, { habitId, date }) => {
    const habit = await prisma.habit.findUnique({ where: { id: habitId } })
    if (!habit) throw new Error("Habit not found")

    const existingLog = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date } },
    })

    let xpAwarded = 0
    if (existingLog) {
      await prisma.habitLog.delete({ where: { id: existingLog.id } })
    } else {
      await prisma.habitLog.create({
        data: { habitId, date, completed: true },
      })
      xpAwarded = habit.xpReward
      await XPService.awardXP(
        xpAwarded,
        'HABIT',
        `${habit.id}-${date}`,
        `Completed Habit: ${habit.name}`
      )
    }

    const updatedHabit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { logs: true },
    })
    const updatedProfile = await prisma.userProfile.findFirst({ include: { skills: true } })

    return { habit: updatedHabit!, profile: updatedProfile!, xpAwarded }
  })

  ipcMain.handle('habits:delete', async (_, id: string) => {
    await prisma.habit.update({
      where: { id },
      data: { archived: true },
    })
    return true
  })
}
