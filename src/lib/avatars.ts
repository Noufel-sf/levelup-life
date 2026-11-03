export interface PixelAvatar {
  id: string
  name: string
  role: string
  color: string
  accentClass: string
  borderClass: string
  glowClass: string
  description: string
  svgType: string
}

export interface CharacterTitle {
  id: string
  title: string
  minLevel: number
  tier: 'NOVICE' | 'ADEPT' | 'VETERAN' | 'MASTER' | 'LEGENDARY'
  badgeColor: string
}

export const TITLES: CharacterTitle[] = [
  { id: 'novice', title: 'Novice Adventurer', minLevel: 1, tier: 'NOVICE', badgeColor: '#94a3b8' },
  { id: 'scout', title: 'Apprentice Scout', minLevel: 2, tier: 'NOVICE', badgeColor: '#38bdf8' },
  { id: 'initiate', title: 'Cyber Initiate', minLevel: 3, tier: 'ADEPT', badgeColor: '#22d3ee' },
  { id: 'operative', title: 'Tactical Operative', minLevel: 5, tier: 'ADEPT', badgeColor: '#a3e635' },
  { id: 'knight', title: 'Neon Knight', minLevel: 7, tier: 'VETERAN', badgeColor: '#ec4899' },
  { id: 'mage', title: 'Vaporwave Mage', minLevel: 10, tier: 'VETERAN', badgeColor: '#a855f7' },
  { id: 'master', title: 'Master of Discipline', minLevel: 15, tier: 'MASTER', badgeColor: '#facc15' },
  { id: 'grandmaster', title: 'Grandmaster OS', minLevel: 20, tier: 'MASTER', badgeColor: '#f97316' },
  { id: 'architect', title: 'Ascended Architect', minLevel: 25, tier: 'LEGENDARY', badgeColor: '#e11d48' },
]

export const AVATARS: PixelAvatar[] = [
  {
    id: 'cyber-knight',
    name: 'Cyber Knight',
    role: 'Vanguard Warrior',
    color: '#22d3ee',
    accentClass: 'text-neon-cyan',
    borderClass: 'border-neon-cyan',
    glowClass: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]',
    description: 'Armored vanguard specializing in relentless daily quest execution.',
    svgType: 'knight',
  },
  {
    id: 'vapor-mage',
    name: 'Vapor Mage',
    role: 'Arcane Synthesizer',
    color: '#ec4899',
    accentClass: 'text-neon-pink',
    borderClass: 'border-neon-pink',
    glowClass: 'shadow-[0_0_15px_rgba(236,72,153,0.4)]',
    description: 'Bends probability and harnesses focus flow state through mental discipline.',
    svgType: 'mage',
  },
  {
    id: 'neon-scout',
    name: 'Neon Scout',
    role: 'Agile Recon',
    color: '#a3e635',
    accentClass: 'text-neon-green',
    borderClass: 'border-neon-green',
    glowClass: 'shadow-[0_0_15px_rgba(163,230,53,0.4)]',
    description: 'High-speed habit tracker with unmatched consistency and reaction time.',
    svgType: 'scout',
  },
  {
    id: 'digital-ronin',
    name: 'Digital Ronin',
    role: 'Precision Striker',
    color: '#facc15',
    accentClass: 'text-neon-yellow',
    borderClass: 'border-neon-yellow',
    glowClass: 'shadow-[0_0_15px_rgba(250,204,21,0.4)]',
    description: 'Wanders the digital wasteland cutting down procrastination with a single strike.',
    svgType: 'ronin',
  },
  {
    id: 'pixel-alchemist',
    name: 'Pixel Alchemist',
    role: 'Transmutation Specialist',
    color: '#a855f7',
    accentClass: 'text-primary',
    borderClass: 'border-primary',
    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    description: 'Converts mundane daily chores into concentrated raw XP and level-ups.',
    svgType: 'alchemist',
  },
  {
    id: 'chrono-hacker',
    name: 'Chrono Hacker',
    role: 'Timeline Manipulator',
    color: '#38bdf8',
    accentClass: 'text-sky-400',
    borderClass: 'border-sky-400',
    glowClass: 'shadow-[0_0_15px_rgba(56,189,248,0.4)]',
    description: 'Bends schedule deadlines and synchronizes missions with zero friction.',
    svgType: 'hacker',
  },
  {
    id: 'void-hunter',
    name: 'Void Hunter',
    role: 'Deep Stealth Ops',
    color: '#818cf8',
    accentClass: 'text-indigo-400',
    borderClass: 'border-indigo-400',
    glowClass: 'shadow-[0_0_15px_rgba(129,140,248,0.4)]',
    description: 'Thrives in quiet nocturnal deep work sprints with laser focus.',
    svgType: 'hunter',
  },
  {
    id: 'solar-monk',
    name: 'Solar Monk',
    role: 'Zen Ascendant',
    color: '#fb923c',
    accentClass: 'text-orange-400',
    borderClass: 'border-orange-400',
    glowClass: 'shadow-[0_0_15px_rgba(251,146,60,0.4)]',
    description: 'Channels unshakeable morning momentum and balanced physical vitality.',
    svgType: 'monk',
  },
]

export function getAvatarById(id?: string): PixelAvatar {
  const found = AVATARS.find((a) => a.id === id)
  return found || AVATARS[0]
}
