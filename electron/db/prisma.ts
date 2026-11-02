import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'

// Dynamically load generated PrismaClient
const prismaModulePath = fs.existsSync(path.join(__dirname, '../electron/generated/prisma'))
  ? path.join(__dirname, '../electron/generated/prisma')
  : path.resolve(process.cwd(), 'electron/generated/prisma')
const { PrismaClient } = require(prismaModulePath)

const isDev = !app || !app.isPackaged
const rawDbPath = isDev
  ? path.join(process.cwd(), 'prisma', 'life_os.db')
  : path.join(app.getPath('userData'), 'life_os.db')

// Windows SQLite requires forward slashes in file: URIs
const dbPath = rawDbPath.replace(/\\/g, '/')
process.env.DATABASE_URL = `file:${dbPath}`

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
})

// Seed defaults on initial launch
export async function initializeDatabase() {
  try {
    let settings = await prisma.userSettings.findFirst()
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          theme: 'vaporwave',
          startScreen: 'dashboard',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          notifications: true,
        },
      })
    }

    let profile = await prisma.userProfile.findFirst({
      include: { skills: true },
    })

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          name: 'Player One',
          title: 'Novice Adventurer',
          level: 1,
          currentXp: 0,
          totalXp: 0,
          avatarId: 'pixel-avatar-1',
          skills: {
            create: [
              { name: 'Knowledge', level: 1, xp: 0, icon: 'BookOpen', color: '#A855F7' },
              { name: 'Discipline', level: 1, xp: 0, icon: 'Shield', color: '#F472B6' },
              { name: 'Focus', level: 1, xp: 0, icon: 'Crosshair', color: '#22D3EE' },
              { name: 'Health', level: 1, xp: 0, icon: 'Heart', color: '#4ADE80' },
              { name: 'Creativity', level: 1, xp: 0, icon: 'Sparkles', color: '#FACC15' },
              { name: 'Social', level: 1, xp: 0, icon: 'Users', color: '#FB923C' },
            ],
          },
        },
        include: { skills: true },
      })
    }
  } catch (error) {
    console.error('Failed to initialize or seed database:', error)
  }
}
