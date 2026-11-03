import { ipcMain, BrowserWindow, Notification, dialog, screen } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { prisma } from '../db/prisma'
import { XPService } from '../services/XPService'
import { WORLD_QUOTES, getRandomQuote, WorldQuote } from '../services/quotes'
import { AIService } from '../services/aiService'
import { AchievementService } from '../services/achievementService'

export function registerIpcHandlers(mainWindow: BrowserWindow) {
  // Window controls & Always-On-Top Mini Widget HUD
  let previousBounds: Electron.Rectangle | null = null
  let wasMaximized = false
  let isMiniWidgetMode = false

  ipcMain.handle('window:minimize', () => mainWindow.minimize())
  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.handle('window:close', () => mainWindow.close())

  ipcMain.handle('window:setMiniMode', async (_, enable: boolean) => {
    if (enable && !isMiniWidgetMode) {
      wasMaximized = mainWindow.isMaximized()
      previousBounds = wasMaximized ? { x: 100, y: 100, width: 1280, height: 840 } : mainWindow.getBounds()
      
      if (wasMaximized) {
        mainWindow.unmaximize()
      }

      isMiniWidgetMode = true
      mainWindow.setAlwaysOnTop(true, 'screen-saver')
      mainWindow.setMinimumSize(280, 75)
      mainWindow.setResizable(true)

      const activeDisplay = screen.getDisplayMatching(previousBounds)
      const workArea = activeDisplay.workArea
      const widgetWidth = 320
      const widgetHeight = 84
      const x = Math.round(workArea.x + workArea.width - widgetWidth - 30)
      const y = Math.round(workArea.y + 35)

      mainWindow.setBounds({ x, y, width: widgetWidth, height: widgetHeight })
      return { isMini: true }
    } else if (!enable && isMiniWidgetMode) {
      isMiniWidgetMode = false
      mainWindow.setAlwaysOnTop(false)
      mainWindow.setMinimumSize(1024, 680)

      if (wasMaximized) {
        mainWindow.maximize()
        wasMaximized = false
      } else if (previousBounds) {
        mainWindow.setBounds(previousBounds)
      } else {
        mainWindow.setSize(1280, 840)
        mainWindow.center()
      }
      return { isMini: false }
    }
    return { isMini: isMiniWidgetMode }
  })

  ipcMain.handle('window:isMiniMode', () => isMiniWidgetMode)

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

  ipcMain.handle('xp:getHistory', async (_, limit = 500) => {
    return await prisma.xPTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  })

  // Deep Work & Focus Cyberdeck
  ipcMain.handle('focus:completeSession', async (_, { durationMin, taskId, customTitle }) => {
    const profile = await prisma.userProfile.findFirst({ include: { skills: true } })
    if (!profile) throw new Error("Profile not found")

    // Locate the Focus skill
    const focusSkill = profile.skills.find((s: any) => s.name.toLowerCase() === 'focus')

    // XP calculation: roughly 1 XP per minute of focus, minimum 15 XP for a sprint
    const xpReward = Math.max(15, Math.round(durationMin * 1.0))
    const txSourceId = `focus-${Date.now()}`
    const label = customTitle ? `Deep Work: ${customTitle}` : `Deep Work Focus Sprint (${durationMin}m)`

    const updatedProfile = await XPService.awardXP(
      xpReward,
      'FOCUS_SESSION',
      txSourceId,
      label,
      focusSkill?.id
    )

    let taskResult = null
    if (taskId) {
      const task = await prisma.task.findUnique({ where: { id: taskId } })
      if (task && task.status !== 'COMPLETED') {
        taskResult = await prisma.task.update({
          where: { id: taskId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        })
        await XPService.awardXP(
          task.xpReward,
          'TASK',
          task.id,
          `Completed during Focus: ${task.title}`,
          task.skillId || focusSkill?.id
        )
      }
    }

    return {
      success: true,
      xpAwarded: xpReward,
      profile: updatedProfile,
      task: taskResult,
    }
  })

  ipcMain.handle('focus:getStats', async () => {
    const today = new Date().toISOString().split('T')[0]
    const todayTxs = await prisma.xPTransaction.findMany({
      where: {
        sourceType: 'FOCUS_SESSION',
        createdAt: {
          gte: new Date(`${today}T00:00:00.000Z`),
        },
      },
    })

    const totalSessions = await prisma.xPTransaction.count({
      where: { sourceType: 'FOCUS_SESSION' },
    })

    const totalXp = await prisma.xPTransaction.aggregate({
      where: { sourceType: 'FOCUS_SESSION' },
      _sum: { amount: true },
    })

    return {
      todayCount: todayTxs.length,
      todayXp: todayTxs.reduce((sum: number, tx: any) => sum + tx.amount, 0),
      totalSessions,
      totalFocusXp: totalXp._sum.amount || 0,
    }
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

  ipcMain.handle('goals:toggleComplete', async (_, id: string) => {
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { milestones: true, tasks: true },
    })
    if (!goal) throw new Error("Goal not found")

    const willBeCompleted = goal.status !== 'COMPLETED'
    const newStatus = willBeCompleted ? 'COMPLETED' : 'ACTIVE'

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: { status: newStatus },
      include: { milestones: { orderBy: { order: 'asc' } }, tasks: true },
    })

    let updatedProfile = await prisma.userProfile.findFirst({ include: { skills: true } })
    let xpAwarded = 0

    if (willBeCompleted) {
      xpAwarded = 100
      updatedProfile = await XPService.awardXP(
        xpAwarded,
        'GOAL',
        goal.id,
        `Main Quest Victory: ${goal.title}`
      )
    }

    return { goal: updatedGoal, profile: updatedProfile!, xpAwarded }
  })

  ipcMain.handle('goals:delete', async (_, id: string) => {
    await prisma.goal.delete({ where: { id } })
    return true
  })

  // Milestones
  ipcMain.handle('milestones:create', async (_, data) => {
    const count = await prisma.milestone.count({ where: { goalId: data.goalId } })
    return await prisma.milestone.create({
      data: {
        goalId: data.goalId,
        title: data.title,
        description: data.description || null,
        order: count + 1,
        xpReward: data.xpReward || 50,
        status: 'PENDING',
      },
    })
  })

  ipcMain.handle('milestones:toggleComplete', async (_, id: string) => {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { goal: { include: { milestones: true } } },
    })
    if (!milestone) throw new Error("Milestone not found")

    const willBeCompleted = milestone.status !== 'COMPLETED'
    const newStatus = willBeCompleted ? 'COMPLETED' : 'PENDING'

    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: willBeCompleted ? new Date() : null,
      },
    })

    let updatedProfile = await prisma.userProfile.findFirst({ include: { skills: true } })
    let xpAwarded = 0
    let goalCompleted = false

    if (willBeCompleted) {
      xpAwarded = milestone.xpReward
      updatedProfile = await XPService.awardXP(
        xpAwarded,
        'MILESTONE',
        milestone.id,
        `Completed Milestone: ${milestone.title}`
      )

      // Check if all milestones in the goal are now completed
      const allMilestones = await prisma.milestone.findMany({ where: { goalId: milestone.goalId } })
      const allDone = allMilestones.length > 0 && allMilestones.every((m: any) => m.status === 'COMPLETED')
      if (allDone && milestone.goal.status !== 'COMPLETED') {
        goalCompleted = true
        await prisma.goal.update({
          where: { id: milestone.goalId },
          data: { status: 'COMPLETED' },
        })
        const goalBonusXp = 100
        xpAwarded += goalBonusXp
        updatedProfile = await XPService.awardXP(
          goalBonusXp,
          'GOAL',
          milestone.goalId,
          `Conquered Main Quest: ${milestone.goal.title}`
        )
      }
    }

    return { milestone: updatedMilestone, profile: updatedProfile!, xpAwarded, goalCompleted }
  })

  ipcMain.handle('milestones:delete', async (_, id: string) => {
    await prisma.milestone.delete({ where: { id } })
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

  ipcMain.handle('habits:update', async (_, { id, data }) => {
    return await prisma.habit.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.frequency !== undefined ? { frequency: data.frequency } : {}),
        ...(data.daysOfWeek !== undefined ? { daysOfWeek: data.daysOfWeek } : {}),
        ...(data.targetDuration !== undefined ? { targetDuration: data.targetDuration } : {}),
        ...(data.reminderTime !== undefined ? { reminderTime: data.reminderTime } : {}),
        ...(data.xpReward !== undefined ? { xpReward: data.xpReward } : {}),
        ...(data.archived !== undefined ? { archived: data.archived } : {}),
      },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })
  })

  ipcMain.handle('habits:delete', async (_, id: string) => {
    try {
      await prisma.habit.delete({
        where: { id },
      })
    } catch {
      await prisma.habit.update({
        where: { id },
        data: { archived: true },
      })
    }
    return true
  })

  // Worldwide Wisdom Notifications
  ipcMain.handle('notifications:sendQuote', async (_, quote?: WorldQuote) => {
    const q = quote || getRandomQuote()
    if (Notification.isSupported()) {
      try {
        const notif = new Notification({
          title: `${q.flag} ${q.original} [${q.language.toUpperCase()}]`,
          body: `${q.translation} — ${q.author} (${q.culture})`,
          icon: path.join(__dirname, '../../public/logo.png'),
          silent: false,
        })
        notif.show()
      } catch (err) {
        console.error('Failed to display native notification:', err)
      }
    }
    return q
  })

  ipcMain.handle('notifications:getRandomQuote', async (_, languageFilter?: string) => {
    return getRandomQuote(languageFilter)
  })

  ipcMain.handle('notifications:listQuotes', async () => {
    return WORLD_QUOTES
  })

  // Gemini AI Companion Engine
  ipcMain.handle('ai:decomposeGoal', async (_, prompt: string) => {
    return await AIService.decomposeGoal(prompt)
  })

  ipcMain.handle('ai:deployGoal', async (_, data) => {
    return await AIService.deployDecomposedGoal(data)
  })

  ipcMain.handle('ai:suggestDailyPlan', async (_, dateStr: string) => {
    return await AIService.suggestDailyPlan(dateStr || new Date().toISOString().split('T')[0])
  })

  ipcMain.handle('ai:chat', async (_, { message, history }) => {
    return await AIService.chat(message, history || [])
  })

  ipcMain.handle('ai:generateWeeklyReview', async () => {
    return await AIService.generateWeeklyReview()
  })

  ipcMain.handle('ai:suggestAdaptiveReschedule', async () => {
    return await AIService.suggestAdaptiveReschedule()
  })

  ipcMain.handle('ai:applyAdaptiveReschedules', async (_, reschedules) => {
    return await AIService.applyAdaptiveReschedules(reschedules)
  })

  // RPG Achievements & Trophies
  ipcMain.handle('achievements:list', async () => {
    return await AchievementService.listAchievements()
  })

  ipcMain.handle('achievements:check', async () => {
    return await AchievementService.checkAndUnlockAchievements()
  })

  // Data Vault: Backup & Restore
  ipcMain.handle('data:export', async () => {
    const defaultName = `life-os-backup-${new Date().toISOString().split('T')[0]}.json`
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export LIFE OS Backup',
      defaultPath: defaultName,
      filters: [{ name: 'JSON Backup (*.json)', extensions: ['json'] }],
    })

    if (canceled || !filePath) {
      return { canceled: true }
    }

    const backupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: await prisma.userProfile.findFirst({ include: { skills: true } }),
      goals: await prisma.goal.findMany({ include: { milestones: true } }),
      tasks: await prisma.task.findMany(),
      habits: await prisma.habit.findMany({ include: { logs: true } }),
      settings: await prisma.userSettings.findFirst(),
      userAchievements: await prisma.userAchievement.findMany(),
    }

    await fs.writeFile(filePath, JSON.stringify(backupPayload, null, 2), 'utf-8')
    return {
      success: true,
      filePath,
      exportedAt: backupPayload.exportedAt,
      stats: {
        tasks: backupPayload.tasks.length,
        goals: backupPayload.goals.length,
        habits: backupPayload.habits.length,
      },
    }
  })

  ipcMain.handle('data:import', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select LIFE OS Backup JSON',
      properties: ['openFile'],
      filters: [{ name: 'JSON Backup (*.json)', extensions: ['json'] }],
    })

    if (canceled || !filePaths || filePaths.length === 0) {
      return { canceled: true }
    }

    const filePath = filePaths[0]
    const content = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(content)

    if (!parsed || !parsed.version) {
      throw new Error('Invalid backup file: missing LIFE OS format metadata.')
    }

    // Restore goals & milestones
    if (Array.isArray(parsed.goals)) {
      for (const g of parsed.goals) {
        await prisma.goal.upsert({
          where: { id: g.id },
          create: {
            id: g.id,
            title: g.title,
            description: g.description,
            category: g.category || 'General',
            priority: g.priority || 'MEDIUM',
            status: g.status || 'ACTIVE',
            targetDate: g.targetDate ? new Date(g.targetDate) : null,
            icon: g.icon,
            color: g.color,
          },
          update: {
            title: g.title,
            description: g.description,
            category: g.category || 'General',
            priority: g.priority || 'MEDIUM',
            status: g.status || 'ACTIVE',
            targetDate: g.targetDate ? new Date(g.targetDate) : null,
          },
        })

        if (Array.isArray(g.milestones)) {
          for (const m of g.milestones) {
            await prisma.milestone.upsert({
              where: { id: m.id },
              create: {
                id: m.id,
                goalId: g.id,
                title: m.title,
                description: m.description,
                order: m.order || 0,
                status: m.status || 'PENDING',
                xpReward: m.xpReward || 50,
                completedAt: m.completedAt ? new Date(m.completedAt) : null,
              },
              update: {
                title: m.title,
                status: m.status || 'PENDING',
                xpReward: m.xpReward || 50,
              },
            })
          }
        }
      }
    }

    // Restore tasks
    if (Array.isArray(parsed.tasks)) {
      for (const t of parsed.tasks) {
        await prisma.task.upsert({
          where: { id: t.id },
          create: {
            id: t.id,
            title: t.title,
            description: t.description,
            goalId: t.goalId || null,
            milestoneId: t.milestoneId || null,
            skillId: t.skillId || null,
            type: t.type || 'DAILY_MISSION',
            priority: t.priority || 'MEDIUM',
            difficulty: t.difficulty || 'MEDIUM',
            estimatedMin: t.estimatedMin || 30,
            scheduledDate: t.scheduledDate || null,
            startTime: t.startTime || null,
            endTime: t.endTime || null,
            color: t.color || null,
            xpReward: t.xpReward || 20,
            status: t.status || 'TODO',
            completedAt: t.completedAt ? new Date(t.completedAt) : null,
          },
          update: {
            title: t.title,
            description: t.description,
            status: t.status || 'TODO',
            scheduledDate: t.scheduledDate || null,
          },
        })
      }
    }

    // Restore habits & logs
    if (Array.isArray(parsed.habits)) {
      for (const h of parsed.habits) {
        await prisma.habit.upsert({
          where: { id: h.id },
          create: {
            id: h.id,
            name: h.name,
            description: h.description,
            icon: h.icon || 'zap',
            category: h.category || 'General',
            frequency: h.frequency || 'DAILY',
            daysOfWeek: h.daysOfWeek || '1,2,3,4,5,6,7',
            targetDuration: h.targetDuration || 15,
            xpReward: h.xpReward || 10,
          },
          update: {
            name: h.name,
            description: h.description,
            category: h.category || 'General',
          },
        })

        if (Array.isArray(h.logs)) {
          for (const l of h.logs) {
            await prisma.habitLog.upsert({
              where: {
                habitId_date: {
                  habitId: h.id,
                  date: l.date,
                },
              },
              create: {
                habitId: h.id,
                date: l.date,
                completed: l.completed ?? true,
                durationMin: l.durationMin || null,
              },
              update: {
                completed: l.completed ?? true,
              },
            })
          }
        }
      }
    }

    // Restore profile XP and level
    if (parsed.profile) {
      const currentProfile = await prisma.userProfile.findFirst()
      if (currentProfile) {
        await prisma.userProfile.update({
          where: { id: currentProfile.id },
          data: {
            level: parsed.profile.level || currentProfile.level,
            currentXp: parsed.profile.currentXp || currentProfile.currentXp,
            totalXp: parsed.profile.totalXp || currentProfile.totalXp,
            title: parsed.profile.title || currentProfile.title,
          },
        })
      }
    }

    return {
      success: true,
      stats: {
        tasks: parsed.tasks?.length || 0,
        goals: parsed.goals?.length || 0,
        habits: parsed.habits?.length || 0,
      },
    }
  })
}
