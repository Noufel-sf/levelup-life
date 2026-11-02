import { prisma } from '../db/prisma'

export class XPService {
  /**
   * Progressive XP curve:
   * Level 1: 0 XP
   * Level 2: 100 XP
   * Level 3: 250 XP
   * Level 4: 450 XP
   * Level 5: 700 XP
   * Level 6: 1000 XP
   * Level N: previous + 50 * (N) or formula: 25 * (N - 1) * (N + 2) roughly
   */
  static getRequiredXpForNextLevel(currentLevel: number): number {
    return 100 + (currentLevel - 1) * 75
  }

  static getLevelTitle(level: number): string {
    if (level < 3) return "Novice Adventurer"
    if (level < 6) return "Apprentice Scout"
    if (level < 10) return "Cyber Knight"
    if (level < 15) return "Vaporwave Mage"
    if (level < 20) return "Master of Discipline"
    return "Grandmaster OS"
  }

  /**
   * Award XP to user, record transaction, and calculate potential level ups.
   */
  static async awardXP(
    amount: number,
    sourceType: string,
    sourceId: string,
    description: string,
    skillId?: string | null
  ) {
    return await prisma.$transaction(async (tx) => {
      let profile = await tx.userProfile.findFirst({
        include: { skills: true },
      })

      if (!profile) {
        throw new Error("User profile not found")
      }

      // Check for duplicate transaction
      const existingTx = await tx.xPTransaction.findFirst({
        where: { sourceType, sourceId },
      })
      if (existingTx) {
        return profile // Don't award twice
      }

      // 1. Record transaction
      await tx.xPTransaction.create({
        data: {
          profileId: profile.id,
          amount,
          sourceType,
          sourceId,
          description,
        },
      })

      // 2. Calculate level progression
      let newTotalXp = profile.totalXp + amount
      let newCurrentXp = profile.currentXp + amount
      let newLevel = profile.level
      let requiredForNext = this.getRequiredXpForNextLevel(newLevel)

      while (newCurrentXp >= requiredForNext) {
        newCurrentXp -= requiredForNext
        newLevel += 1
        requiredForNext = this.getRequiredXpForNextLevel(newLevel)
      }

      // 3. Update skill if applicable
      if (skillId) {
        const skill = await tx.skill.findUnique({ where: { id: skillId } })
        if (skill) {
          const updatedSkillXp = skill.xp + amount
          const skillLevel = Math.floor(updatedSkillXp / 100) + 1
          await tx.skill.update({
            where: { id: skillId },
            data: { xp: updatedSkillXp, level: skillLevel },
          })
        }
      }

      // 4. Update Profile
      const updatedProfile = await tx.userProfile.update({
        where: { id: profile.id },
        data: {
          currentXp: newCurrentXp,
          totalXp: newTotalXp,
          level: newLevel,
          title: this.getLevelTitle(newLevel),
        },
        include: { skills: true },
      })

      return updatedProfile
    })
  }
}

