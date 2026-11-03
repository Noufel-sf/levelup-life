import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { prisma } from '../db/prisma'

export const DecomposedGoalSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string().default('Coding'),
  targetWeeks: z.number().default(4),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('HIGH'),
  milestones: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      order: z.number().default(1),
      xpReward: z.number().default(50),
      tasks: z.array(
        z.object({
          title: z.string(),
          estimatedMin: z.number().default(30),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
          xpReward: z.number().default(20),
          scheduledDayOffset: z.number().default(0), // 0 = today, 1 = day 1, etc.
        })
      ),
    })
  ),
})

export type DecomposedGoal = z.infer<typeof DecomposedGoalSchema>

export const DailyPlanSuggestionSchema = z.object({
  focusTheme: z.string(),
  analysis: z.string(),
  recommendedSequence: z.array(
    z.object({
      taskId: z.string().optional(),
      title: z.string(),
      timeblock: z.string(),
      reason: z.string(),
    })
  ),
  workloadWarning: z.string().optional(),
  motivationalQuote: z.string(),
})

export type DailyPlanSuggestion = z.infer<typeof DailyPlanSuggestionSchema>

export class AIService {
  private static async getClientAndModel() {
    const settings = await prisma.userSettings.findFirst()
    const apiKey = settings?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return { client: null, modelName: settings?.aiModel || 'gemini-1.5-flash' }
    }

    const client = new GoogleGenerativeAI(apiKey)
    // Normalize model name (fallback to gemini-1.5-flash if invalid)
    let modelName = settings?.aiModel || 'gemini-1.5-flash'
    if (modelName === 'gemini-2.5-flash') {
      modelName = 'gemini-1.5-flash'
    }
    return { client, modelName }
  }

  // Feature A: Decompose a high-level goal into milestones and tasks
  static async decomposeGoal(goalPrompt: string): Promise<DecomposedGoal> {
    const { client, modelName } = await this.getClientAndModel()

    if (!client) {
      // Offline / fallback mock plan when no key is entered yet
      return {
        title: goalPrompt,
        description: `Decomposed quest blueprint for: ${goalPrompt}`,
        category: 'Coding',
        targetWeeks: 4,
        priority: 'HIGH',
        milestones: [
          {
            title: 'Phase 1: Foundations & Architecture',
            description: 'Master core concepts and establish local development setup.',
            order: 1,
            xpReward: 50,
            tasks: [
              { title: 'Read core specifications & setup environment', estimatedMin: 45, priority: 'HIGH', xpReward: 25, scheduledDayOffset: 0 },
              { title: 'Build basic prototype / hello world project', estimatedMin: 60, priority: 'MEDIUM', xpReward: 30, scheduledDayOffset: 1 },
              { title: 'Review foundational documentation & take notes', estimatedMin: 30, priority: 'LOW', xpReward: 15, scheduledDayOffset: 2 },
            ],
          },
          {
            title: 'Phase 2: Core Implementation & Deep Work',
            description: 'Build functional features and solve challenging problems.',
            order: 2,
            xpReward: 75,
            tasks: [
              { title: 'Implement primary module architecture', estimatedMin: 90, priority: 'CRITICAL', xpReward: 40, scheduledDayOffset: 4 },
              { title: 'Refactor code and write automated tests', estimatedMin: 45, priority: 'MEDIUM', xpReward: 25, scheduledDayOffset: 5 },
            ],
          },
          {
            title: 'Phase 3: Polish, Audit & Deployment',
            description: 'Finalize, document, benchmark, and deploy.',
            order: 3,
            xpReward: 100,
            tasks: [
              { title: 'Perform security and performance audit', estimatedMin: 60, priority: 'HIGH', xpReward: 35, scheduledDayOffset: 7 },
              { title: 'Deploy to production and celebrate milestone', estimatedMin: 30, priority: 'CRITICAL', xpReward: 50, scheduledDayOffset: 8 },
            ],
          },
        ],
      }
    }

    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
      systemInstruction: `You are the Synth AI Companion of LIFE OS, a futuristic productivity RPG.
Your mission is to decompose long-term goals into achievable, gamified Main Quests with structured Milestones and Daily Tasks.
Return strictly valid JSON conforming to the requested schema. Provide realistic estimated minutes (15 to 90), reasonable XP rewards (10 to 50), and actionable task titles.`,
    })

    const prompt = `Decompose this goal into a structured RPG quest plan:
Goal: "${goalPrompt}"

Return JSON matching this schema:
{
  "title": string,
  "description": string,
  "category": "Coding" | "Career" | "Health" | "Personal" | "General",
  "targetWeeks": number,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "milestones": [
    {
      "title": string,
      "description": string,
      "order": number,
      "xpReward": number,
      "tasks": [
        {
          "title": string,
          "estimatedMin": number,
          "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          "xpReward": number,
          "scheduledDayOffset": number
        }
      ]
    }
  ]
}`

    const response = await model.generateContent(prompt)
    const text = response.response.text()
    const parsed = JSON.parse(text)
    return DecomposedGoalSchema.parse(parsed)
  }

  // Feature B: Propose daily schedule analysis & prioritization
  static async suggestDailyPlan(dateStr: string): Promise<DailyPlanSuggestion> {
    const { client, modelName } = await this.getClientAndModel()

    // Fetch local context: tasks scheduled for that date and active habits
    const tasks = await prisma.task.findMany({
      where: { scheduledDate: dateStr },
      include: { goal: true },
    })
    const habits = await prisma.habit.findMany({ where: { archived: false } })

    if (!client) {
      return {
        focusTheme: 'Focused Execution Protocol',
        analysis: `You have ${tasks.length} missions scheduled for ${dateStr} and ${habits.length} recurring habit protocols. Maintain steady pacing with 25-minute deep focus sprints.`,
        recommendedSequence: tasks.map((t: any, idx: number) => ({
          taskId: t.id,
          title: t.title,
          timeblock: `${9 + idx * 2}:00 - ${10 + idx * 2}:00`,
          reason: `High leverage mission for ${t.goal?.title || 'daily momentum'}.`,
        })),
        workloadWarning: tasks.length > 5 ? 'High workload detected (>5 missions). Consider prioritizing top 3.' : undefined,
        motivationalQuote: 'Step by step, the summit is conquered.',
      }
    }

    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
      systemInstruction: `You are the Synth AI Companion of LIFE OS.
Analyze the user's daily missions and habits for the specified date.
Suggest an optimal sequence, flag workload risks (>4.5 hours is heavy), and provide motivational focus. Return strictly valid JSON.`,
    })

    const context = {
      date: dateStr,
      tasks: tasks.map((t: any) => ({ id: t.id, title: t.title, priority: t.priority, estimatedMin: t.estimatedMin })),
      habitsCount: habits.length,
    }

    const prompt = `Analyze this workload and suggest an optimal plan:
${JSON.stringify(context, null, 2)}

Return JSON matching this schema:
{
  "focusTheme": string,
  "analysis": string,
  "recommendedSequence": [
    {
      "taskId": string,
      "title": string,
      "timeblock": string,
      "reason": string
    }
  ],
  "workloadWarning": string | null,
  "motivationalQuote": string
}`

    const response = await model.generateContent(prompt)
    const text = response.response.text()
    const parsed = JSON.parse(text)
    return DailyPlanSuggestionSchema.parse(parsed)
  }

  // Feature C: Conversational Chat with LIFE OS Persona
  static async chat(message: string, history: Array<{ role: 'user' | 'model'; parts: string }>) {
    const { client, modelName } = await this.getClientAndModel()

    if (!client) {
      return `[SYNTH CORE OFFLINE // DEMO MODE]
I received: "${message}".
To enable Live Gemini Intelligence, please navigate to [Settings] and enter your Google Gemini API key. All features, goal decomposition, and smart scheduling will unlock immediately!`
    }

    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: `You are Synth, the personal AI Companion of LIFE OS — a retro-cyberpunk productivity operating system.
You speak with enthusiasm, precision, and a gamified cyberpunk tone.
You help the user decompose complex projects, conquer procrastination, organize weekly timelines, and level up in real life.
Keep responses concise, actionable, and formatted with clean markdown bullet points.`,
    })

    const chatSession = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.parts }],
      })),
    })

    const result = await chatSession.sendMessage(message)
    return result.response.text()
  }

  // Atomically deploy decomposed goal into SQLite
  static async deployDecomposedGoal(data: DecomposedGoal) {
    const today = new Date()

    return await prisma.$transaction(async (tx: any) => {
      // 1. Create Goal
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + (data.targetWeeks || 4) * 7)

      const goal = await tx.goal.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category || 'Coding',
          priority: data.priority || 'HIGH',
          targetDate,
          status: 'IN_PROGRESS',
        },
      })

      // 2. Create Milestones and Tasks
      for (const mData of data.milestones) {
        const milestone = await tx.milestone.create({
          data: {
            goalId: goal.id,
            title: mData.title,
            description: mData.description || null,
            order: mData.order,
            xpReward: mData.xpReward,
            status: 'TODO',
          },
        })

        for (const tData of mData.tasks) {
          const taskDate = new Date(today)
          taskDate.setDate(taskDate.getDate() + (tData.scheduledDayOffset || 0))
          const dateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`

          await tx.task.create({
            data: {
              title: tData.title,
              goalId: goal.id,
              milestoneId: milestone.id,
              estimatedMin: tData.estimatedMin || 30,
              priority: tData.priority || 'MEDIUM',
              xpReward: tData.xpReward || 20,
              scheduledDate: dateStr,
              type: 'DAILY_MISSION',
              status: 'TODO',
            },
          })
        }
      }

      return goal
    })
  }
}
