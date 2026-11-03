import path from "node:path";
import fs from "node:fs";
import { app } from "electron";

// Dynamically resolve PrismaClient and Query Engine paths (dev & packaged)
function resolvePrismaModulePath(): string {
  const candidatePaths = [
    path.join(__dirname, "../electron/generated/prisma"),
    path.resolve(process.cwd(), "electron/generated/prisma"),
    process.resourcesPath
      ? path.join(process.resourcesPath, "app.asar.unpacked/electron/generated/prisma")
      : "",
    process.resourcesPath
      ? path.join(process.resourcesPath, "prisma-engine")
      : "",
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return path.resolve(process.cwd(), "electron/generated/prisma");
}

const prismaModulePath = resolvePrismaModulePath();
const { PrismaClient } = require(prismaModulePath);

// Ensure query engine binary is located
const enginePath = path.join(prismaModulePath, "query_engine-windows.dll.node");
if (fs.existsSync(enginePath)) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
}

const isDev = !app || !app.isPackaged;
const rawDbPath = isDev
  ? path.join(process.cwd(), "prisma", "life_os.db")
  : path.join(app.getPath("userData"), "life_os.db");

// Windows SQLite requires forward slashes in file: URIs
const dbPath = rawDbPath.replace(/\\/g, "/");
process.env.DATABASE_URL = `file:${dbPath}`;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

// Seed defaults on initial launch
export async function initializeDatabase() {
  try {
    let settings = await prisma.userSettings.findFirst();
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          theme: "vaporwave",
          startScreen: "dashboard",
          dateFormat: "YYYY-MM-DD",
          timeFormat: "24h",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          notifications: true,
        },
      });
    }

    let profile = await prisma.userProfile.findFirst({
      include: { skills: true },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          name: "Player One",
          title: "Novice Adventurer",
          level: 1,
          currentXp: 0,
          totalXp: 0,
          avatarId: "pixel-avatar-1",
          skills: {
            create: [
              {
                name: "Knowledge",
                level: 1,
                xp: 0,
                icon: "BookOpen",
                color: "#A855F7",
              },
              {
                name: "Discipline",
                level: 1,
                xp: 0,
                icon: "Shield",
                color: "#F472B6",
              },
              {
                name: "Focus",
                level: 1,
                xp: 0,
                icon: "Crosshair",
                color: "#22D3EE",
              },
              {
                name: "Health",
                level: 1,
                xp: 0,
                icon: "Heart",
                color: "#4ADE80",
              },
              {
                name: "Creativity",
                level: 1,
                xp: 0,
                icon: "Sparkles",
                color: "#FACC15",
              },
              {
                name: "Social",
                level: 1,
                xp: 0,
                icon: "Users",
                color: "#FB923C",
              },
            ],
          },
        },
        include: { skills: true },
      });
    }

    // Seed initial schedule samples if empty
    const taskCount = await prisma.task.count();
    if (taskCount === 0) {
      const today = new Date();
      const getOffsetDate = (offsetDays: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split("T")[0];
      };

      await prisma.task.createMany({
        data: [
          {
            title: "Team Stand-up & Daily Sprint",
            scheduledDate: getOffsetDate(0),
            startTime: "09:00",
            endTime: "10:00",
            color: "cyan",
            type: "DAILY_MISSION",
            xpReward: 20,
            status: "TODO",
          },
          {
            title: "Planning & Taken: Architecture Review",
            scheduledDate: getOffsetDate(0),
            startTime: "10:00",
            endTime: "11:00",
            color: "purple",
            type: "DAILY_MISSION",
            xpReward: 25,
            status: "TODO",
          },
          {
            title: "API Integration & Security Audit",
            scheduledDate: getOffsetDate(1),
            startTime: "11:00",
            endTime: "12:30",
            color: "purple",
            type: "DAILY_MISSION",
            xpReward: 35,
            status: "TODO",
          },
          {
            title: "Product Demo & Stakeholder Feedback",
            scheduledDate: getOffsetDate(2),
            startTime: "14:00",
            endTime: "15:30",
            color: "amber",
            type: "DAILY_MISSION",
            xpReward: 30,
            status: "TODO",
          },
          {
            title: "Health Protocol: Workout & Mobility",
            scheduledDate: getOffsetDate(0),
            startTime: "17:00",
            endTime: "18:00",
            color: "green",
            type: "DAILY_MISSION",
            xpReward: 20,
            status: "TODO",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Failed to initialize or seed database:", error);
  }
}
