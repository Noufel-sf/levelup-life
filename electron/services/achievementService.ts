import { prisma } from '../db/prisma'
import { XPService } from './XPService'

export interface AchievementItem {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: string
  xpReward: number
  isUnlocked: boolean
  unlockedAt?: string | null
}

const DEFAULT_ACHIEVEMENTS = [
  {
    code: 'FIRST_MISSION',
    name: 'First Blood',
    description: 'Conquer your first daily mission in LIFE OS.',
    icon: 'Zap',
    category: 'Combat',
    xpReward: 50,
  },
  {
    code: 'HABIT_STREAK_7',
    name: 'Unbreakable Will',
    description: 'Maintain an active 7-day streak on any habit protocol.',
    icon: 'Flame',
    category: 'Discipline',
    xpReward: 100,
  },
  {
    code: 'MAIN_QUEST_CONQUERED',
    name: 'Dragon Slayer',
    description: 'Conquer a long-term Main Quest and all its tactical milestones.',
    icon: 'Award',
    category: 'Mastery',
    xpReward: 150,
  },
  {
    code: 'CENTURY_XP',
    name: 'Ascending Power',
    description: 'Accumulate over 500 Total Experience Points.',
    icon: 'TrendingUp',
    category: 'Progression',
    xpReward: 100,
  },
  {
    code: 'LEVEL_5',
    name: 'Veteran Operative',
    description: 'Reach Character Tier Level 5 or higher.',
    icon: 'Shield',
    category: 'Progression',
    xpReward: 150,
  },
  {
    code: 'SPRINT_5',
    name: 'Overdrive Velocity',
    description: 'Conquer 5 or more daily missions in a single day.',
    icon: 'Clock',
    category: 'Productivity',
    xpReward: 75,
  },
  {
    code: 'HABIT_MASTER',
    name: 'Ritual Architect',
    description: 'Initialize and maintain 3 or more recurring habit protocols.',
    icon: 'Sparkles',
    category: 'Discipline',
    xpReward: 50,
  },
]

export class AchievementService {
  static async seedAchievements() {
    for (const ach of DEFAULT_ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { code: ach.code },
        update: {},
        create: ach,
      })
    }
  }

  static async listAchievements(): Promise<AchievementItem[]> {
    await this.seedAchievements()
    const profile = await prisma.userProfile.findFirst()
    if (!profile) return []

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { xpReward: 'asc' },
    })

    const userUnlocked = await prisma.userAchievement.findMany({
      where: { profileId: profile.id },
    })

    const unlockedMap = new Map<string, string>()
    userUnlocked.forEach((ua: any) => {
      unlockedMap.set(ua.achievementId, ua.unlockedAt.toISOString())
    })

    return allAchievements.map((ach: any) => ({
      id: ach.id,
      code: ach.code,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      category: ach.category,
      xpReward: ach.xpReward,
      isUnlocked: unlockedMap.has(ach.id),
      unlockedAt: unlockedMap.get(ach.id) || null,
    }))
  }

  static async checkAndUnlockAchievements(): Promise<AchievementItem[]> {
    await this.seedAchievements()
    const profile = await prisma.userProfile.findFirst()
    if (!profile) return []

    const unlockedList = await prisma.userAchievement.findMany({
      where: { profileId: profile.id },
      select: { achievement: { select: { code: true } } },
    })
    const unlockedCodes = new Set(unlockedList.map((u: any) => u.achievement.code))

    // Gather telemetry data
    const completedTasksCount = await prisma.task.count({ where: { status: 'COMPLETED' } })
    const completedGoalsCount = await prisma.goal.count({ where: { status: 'COMPLETED' } })
    const habits = await prisma.habit.findMany({
      where: { archived: false },
      include: { logs: true },
    })

    // Calculate max streak across all habits
    let maxHabitStreak = 0
    habits.forEach((h: any) => {
      const dates = new Set(h.logs.filter((l: any) => l.completed).map((l: any) => l.date))
      let streak = 0
      const d = new Date()
      // If today isn't done, start from yesterday
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!dates.has(todayStr)) d.setDate(d.getDate() - 1)

      while (true) {
        const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (dates.has(str)) {
          streak++
          d.setDate(d.getDate() - 1)
        } else {
          break
        }
      }
      if (streak > maxHabitStreak) maxHabitStreak = streak
    })

    // Tasks completed today count
    const today = new Date().toISOString().split('T')[0]
    const completedTodayCount = await prisma.task.count({
      where: {
        status: 'COMPLETED',
        scheduledDate: today,
      },
    })

    const newlyUnlocked: AchievementItem[] = []

    const tryUnlock = async (code: string) => {
      if (unlockedCodes.has(code)) return
      const ach = await prisma.achievement.findUnique({ where: { code } })
      if (!ach) return

      await prisma.userAchievement.create({
        data: {
          profileId: profile.id,
          achievementId: ach.id,
        },
      })

      // Award XP bonus
      await XPService.awardXP(
        ach.xpReward,
        'ACHIEVEMENT',
        ach.id,
        `Trophy Unlocked: ${ach.name}`
      )

      newlyUnlocked.push({
        id: ach.id,
        code: ach.code,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        xpReward: ach.xpReward,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      })
    }

    // 1. First Mission Completed
    if (completedTasksCount >= 1) await tryUnlock('FIRST_MISSION')

    // 2. 7-Day Habit Streak
    if (maxHabitStreak >= 7) await tryUnlock('HABIT_STREAK_7')

    // 3. Main Quest Conquered
    if (completedGoalsCount >= 1) await tryUnlock('MAIN_QUEST_CONQUERED')

    // 4. Over 500 Total XP
    if (profile.totalXp >= 500) await tryUnlock('CENTURY_XP')

    // 5. Level 5 Reached
    if (profile.level >= 5) await tryUnlock('LEVEL_5')

    // 6. Sprint 5 in a single day
    if (completedTodayCount >= 5) await tryUnlock('SPRINT_5')

    // 7. Habit Master (3 or more active habits)
    if (habits.length >= 3) await tryUnlock('HABIT_MASTER')

    return newlyUnlocked
  }
}
