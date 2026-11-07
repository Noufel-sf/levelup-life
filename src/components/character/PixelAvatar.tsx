import React from 'react'
import { getAvatarById } from '@/lib/avatars'

interface PixelAvatarProps {
  avatarId?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  glow?: boolean
}

const SIZE_MAP = {
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  avatarId,
  size = 'md',
  className = '',
  showBorder = true,
  glow = false,
}) => {
  const avatar = getAvatarById(avatarId)

  const renderAvatarSvg = () => {
    switch (avatar.svgType) {
      case 'knight':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            {/* Helm Base */}
            <rect x="5" y="4" width="14" height="15" fill="#0f172a" />
            <rect x="6" y="3" width="12" height="3" fill="#1e293b" />
            {/* Crest */}
            <rect x="11" y="1" width="2" height="4" fill="#22d3ee" />
            <rect x="10" y="2" width="4" height="1" fill="#22d3ee" />
            {/* Cyber Visor */}
            <rect x="4" y="9" width="16" height="4" fill="#22d3ee" />
            <rect x="5" y="10" width="14" height="2" fill="#e0f2fe" />
            <rect x="8" y="10" width="8" height="2" fill="#ffffff" />
            {/* Faceplate Slots */}
            <rect x="8" y="15" width="2" height="3" fill="#22d3ee" />
            <rect x="11" y="15" width="2" height="3" fill="#22d3ee" />
            <rect x="14" y="15" width="2" height="3" fill="#22d3ee" />
            {/* Shoulder Guards */}
            <rect x="2" y="19" width="6" height="4" fill="#1e293b" />
            <rect x="16" y="19" width="6" height="4" fill="#1e293b" />
          </svg>
        )

      case 'mage':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            {/* Arcane Hood */}
            <polygon points="12,1 4,14 20,14" fill="#4a044e" />
            <polygon points="12,3 6,13 18,13" fill="#701a75" />
            {/* Face Shadow */}
            <rect x="6" y="11" width="12" height="8" fill="#100c1e" />
            {/* Glowing Eyes */}
            <rect x="8" y="13" width="3" height="2" fill="#ec4899" />
            <rect x="13" y="13" width="3" height="2" fill="#ec4899" />
            <rect x="9" y="13.5" width="1" height="1" fill="#fdf2f8" />
            <rect x="14" y="13.5" width="1" height="1" fill="#fdf2f8" />
            {/* Arcane Rune Crest */}
            <rect x="11" y="6" width="2" height="2" fill="#f472b6" />
            {/* Mantle */}
            <rect x="3" y="19" width="18" height="4" fill="#86198f" />
            <rect x="9" y="19" width="6" height="4" fill="#ec4899" />
          </svg>
        )

      case 'scout':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            {/* Tactical Cap/Hood */}
            <rect x="5" y="4" width="14" height="6" fill="#14532d" />
            <rect x="4" y="8" width="16" height="3" fill="#166534" />
            {/* Antenna */}
            <rect x="19" y="1" width="1" height="8" fill="#a3e635" />
            <rect x="18" y="1" width="3" height="2" fill="#bef264" />
            {/* Dual Night-Vision Goggles */}
            <rect x="5" y="10" width="6" height="4" fill="#a3e635" />
            <rect x="13" y="10" width="6" height="4" fill="#a3e635" />
            <rect x="6" y="11" width="4" height="2" fill="#ecfccb" />
            <rect x="14" y="11" width="4" height="2" fill="#ecfccb" />
            {/* Face Mask */}
            <rect x="6" y="14" width="12" height="6" fill="#052e16" />
            <rect x="9" y="16" width="6" height="2" fill="#15803d" />
            {/* Collar */}
            <rect x="3" y="20" width="18" height="3" fill="#166534" />
          </svg>
        )

      case 'ronin':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            {/* Samurai Crest Horns */}
            <polygon points="12,5 7,1 9,6" fill="#facc15" />
            <polygon points="12,5 17,1 15,6" fill="#facc15" />
            <rect x="11" y="4" width="2" height="2" fill="#fef08a" />
            {/* Helmet Dome */}
            <rect x="6" y="6" width="12" height="5" fill="#422006" />
            <rect x="4" y="10" width="16" height="2" fill="#713f12" />
            {/* Shadow Face */}
            <rect x="6" y="11" width="12" height="8" fill="#17120a" />
            {/* Menacing Visor Slits */}
            <polygon points="7,13 11,13 10,14 8,14" fill="#facc15" />
            <polygon points="17,13 13,13 14,14 16,14" fill="#facc15" />
            {/* Mengu Mask */}
            <rect x="7" y="15" width="10" height="4" fill="#854d0e" />
            <rect x="9" y="17" width="6" height="1" fill="#facc15" />
            {/* Armor Neck */}
            <rect x="3" y="19" width="18" height="4" fill="#713f12" />
          </svg>
        )

      case 'alchemist':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            {/* Brimmed Hat */}
            <rect x="2" y="7" width="20" height="3" fill="#3b0764" />
            <rect x="6" y="3" width="12" height="5" fill="#581c87" />
            <rect x="6" y="7" width="12" height="1" fill="#a855f7" />
            {/* Goggles with glowing violet liquid */}
            <circle cx="8.5" cy="12.5" r="2.5" fill="#a855f7" />
            <circle cx="15.5" cy="12.5" r="2.5" fill="#a855f7" />
            <rect x="8" y="12" width="2" height="1" fill="#f3e8ff" />
            <rect x="15" y="12" width="2" height="1" fill="#f3e8ff" />
            {/* Plague Doctor Cyber Beak */}
            <polygon points="10,14 14,14 13,20 11,20" fill="#2e1065" />
            <polygon points="11,16 13,16 12.5,19 11.5,19" fill="#7e22ce" />
            {/* Tube Feeds */}
            <rect x="5" y="16" width="3" height="4" fill="#a855f7" />
            <rect x="16" y="16" width="3" height="4" fill="#a855f7" />
          </svg>
        )

      case 'hacker':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            {/* Massive DJ/Operator Headphones */}
            <rect x="2" y="8" width="4" height="8" fill="#0284c7" />
            <rect x="18" y="8" width="4" height="8" fill="#0284c7" />
            <rect x="3" y="4" width="18" height="2" fill="#0369a1" />
            {/* Matrix Face Grid */}
            <rect x="5" y="6" width="14" height="13" fill="#082f49" />
            {/* Glitch HUD Visor */}
            <rect x="6" y="9" width="12" height="4" fill="#38bdf8" />
            <rect x="7" y="10" width="4" height="1" fill="#ffffff" />
            <rect x="13" y="11" width="3" height="1" fill="#ffffff" />
            {/* Digital Mouth Matrix */}
            <rect x="8" y="15" width="2" height="2" fill="#38bdf8" />
            <rect x="11" y="15" width="2" height="2" fill="#38bdf8" />
            <rect x="14" y="15" width="2" height="2" fill="#38bdf8" />
            {/* Collar */}
            <rect x="4" y="20" width="16" height="3" fill="#0c4a6e" />
          </svg>
        )

      case 'hunter':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            {/* Hood Base */}
            <polygon points="12,2 3,11 21,11" fill="#1e1b4b" />
            <rect x="4" y="10" width="16" height="10" fill="#0f0e26" />
            {/* Tri-Eye Sensor Cluster */}
            <circle cx="8" cy="11" r="1.5" fill="#818cf8" />
            <circle cx="16" cy="11" r="1.5" fill="#818cf8" />
            <circle cx="12" cy="8" r="1.5" fill="#c7d2fe" />
            {/* High-Tech Carbon Face Mask */}
            <rect x="6" y="14" width="12" height="6" fill="#312e81" />
            <line x1="8" y1="16" x2="16" y2="16" stroke="#818cf8" strokeWidth="1" />
            <line x1="9" y1="18" x2="15" y2="18" stroke="#818cf8" strokeWidth="1" />
          </svg>
        )

      case 'monk':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            {/* Radiant Halo Backing */}
            <circle cx="12" cy="11" r="9" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Bald/Zen Head */}
            <rect x="6" y="5" width="12" height="12" rx="4" fill="#431407" />
            {/* Third-Eye Solar Mark */}
            <polygon points="12,6 10,9 12,8 14,9" fill="#f97316" />
            <rect x="11.5" y="7.5" width="1" height="1" fill="#ffedd5" />
            {/* Calm Cyber Eyes */}
            <line x1="8" y1="12" x2="10.5" y2="12" stroke="#fdba74" strokeWidth="1.5" />
            <line x1="13.5" y1="12" x2="16" y2="12" stroke="#fdba74" strokeWidth="1.5" />
            {/* Kasaya Robe */}
            <polygon points="4,24 20,24 16,18 8,18" fill="#c2410c" />
            <line x1="8" y1="18" x2="14" y2="24" stroke="#fb923c" strokeWidth="1.5" />
          </svg>
        )

      default:
        return (
          <div className="w-full h-full bg-secondary flex items-center justify-center font-pixel text-xs text-neon-cyan">
            PX
          </div>
        )
    }
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-[#090714] shrink-0 select-none overflow-hidden ${
        SIZE_MAP[size]
      } ${showBorder ? `border-2 ${avatar.borderClass}` : ''} ${
        glow ? avatar.glowClass : ''
      } ${className}`}
      title={`${avatar.name} // ${avatar.role}`}
    >
      {/* Background Pixel Grid Texture */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:4px_4px] pointer-events-none" />

      {/* SVG Vector Pixel Sprite */}
      <div className="w-full h-full p-1 relative z-10 flex items-center justify-center">
        {renderAvatarSvg()}
      </div>

      {/* Retro scanline overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-20" />
    </div>
  )
}

