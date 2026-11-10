export interface LifePillar {
  id: string
  nameAr: string
  nameEn: string
  category: string
  score: number // 1 to 10
  color: string
  accentColor: string
  iconName: string
}

export interface WheelOfLifeData {
  pillars: LifePillar[]
  priorities: string[] // IDs of top 3 priority pillars
  actionSteps: Record<string, string> // pillarId -> next action step text
  lastUpdated: string
}

export const DEFAULT_PILLARS: LifePillar[] = [
  {
    id: 'spiritual',
    nameAr: 'العلاقة مع الله',
    nameEn: 'Spiritual & Deen',
    category: 'Soul',
    score: 8,
    color: '#10b981', // emerald
    accentColor: '#34d399',
    iconName: 'Moon',
  },
  {
    id: 'quran',
    nameAr: 'القرآن والحكمة',
    nameEn: 'Quran & Wisdom',
    category: 'Soul',
    score: 7,
    color: '#06b6d4', // cyan
    accentColor: '#22d3ee',
    iconName: 'BookOpen',
  },
  {
    id: 'knowledge',
    nameAr: 'العلم والتعلم',
    nameEn: 'Knowledge & Intellect',
    category: 'Mind',
    score: 6,
    color: '#8b5cf6', // purple
    accentColor: '#a78bfa',
    iconName: 'Brain',
  },
  {
    id: 'family',
    nameAr: 'الأسرة والبيت',
    nameEn: 'Family & Home',
    category: 'Heart',
    score: 7,
    color: '#ec4899', // pink
    accentColor: '#f472b6',
    iconName: 'Home',
  },
  {
    id: 'community',
    nameAr: 'الرحم والمجتمع',
    nameEn: 'Community & Kinship',
    category: 'Heart',
    score: 6,
    color: '#3b82f6', // blue
    accentColor: '#60a5fa',
    iconName: 'Users',
  },
  {
    id: 'health',
    nameAr: 'الصحة والبدن',
    nameEn: 'Physical Health',
    category: 'Body',
    score: 8,
    color: '#a3e635', // lime / neon-green
    accentColor: '#bef264',
    iconName: 'Activity',
  },
  {
    id: 'career',
    nameAr: 'العمل والكسب',
    nameEn: 'Career & Craft',
    category: 'Drive',
    score: 7,
    color: '#f59e0b', // amber
    accentColor: '#fbbf24',
    iconName: 'Briefcase',
  },
  {
    id: 'wealth',
    nameAr: 'المال والصدقة',
    nameEn: 'Finances & Charity',
    category: 'Drive',
    score: 6,
    color: '#facc15', // yellow
    accentColor: '#fde047',
    iconName: 'Coins',
  },
  {
    id: 'character',
    nameAr: 'الأخلاق والانضباط',
    nameEn: 'Character & Discipline',
    category: 'Will',
    score: 8,
    color: '#14b8a6', // teal
    accentColor: '#2dd4bf',
    iconName: 'Shield',
  },
  {
    id: 'peace',
    nameAr: 'النفس والراحة',
    nameEn: 'Inner Peace & Rest',
    category: 'Mind',
    score: 6,
    color: '#6366f1', // indigo
    accentColor: '#818cf8',
    iconName: 'Feather',
  },
]

const STORAGE_KEY = 'lifeos_wheel_of_life_data'

export function loadWheelOfLifeData(): WheelOfLifeData {
  if (typeof window === 'undefined') {
    return {
      pillars: DEFAULT_PILLARS,
      priorities: ['quran', 'health', 'career'],
      actionSteps: {
        quran: 'ورد يومي وتدبر جزء',
        health: 'رياضة الصباح ونوم منتظم',
        career: 'إنهاء المشروع البرمجي الأساسي',
      },
      lastUpdated: new Date().toISOString(),
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Merge with default pillars in case new ones were added
      const pillars = DEFAULT_PILLARS.map((def) => {
        const found = parsed.pillars?.find((p: any) => p.id === def.id)
        return found ? { ...def, score: found.score } : def
      })
      return {
        pillars,
        priorities: parsed.priorities || ['quran', 'health', 'career'],
        actionSteps: parsed.actionSteps || {},
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      }
    }
  } catch (err) {
    console.warn('Failed to load Wheel of Life from localStorage', err)
  }

  return {
    pillars: DEFAULT_PILLARS,
    priorities: ['quran', 'health', 'career'],
    actionSteps: {
      quran: 'ورد يومي وتدبر صفحة',
      health: 'مشي 30 دقيقة يومياً',
      career: 'إنجاز مهام اليوم في وقتها',
    },
    lastUpdated: new Date().toISOString(),
  }
}

export function saveWheelOfLifeData(data: WheelOfLifeData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, lastUpdated: new Date().toISOString() })
    )
  } catch (err) {
    console.error('Failed to save Wheel of Life data', err)
  }
}
