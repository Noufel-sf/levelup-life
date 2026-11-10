import React, { useState } from 'react'
import { LifePillar } from '@/lib/wheelOfLife'

interface WheelOfLifeChartProps {
  pillars: LifePillar[]
  size?: number
  isCompact?: boolean
  isBlankMode?: boolean
  onPillarClick?: (pillar: LifePillar) => void
  highlightPillarId?: string
}

export const WheelOfLifeChart: React.FC<WheelOfLifeChartProps> = ({
  pillars,
  size = 480,
  isCompact = false,
  isBlankMode = false,
  onPillarClick,
  highlightPillarId,
}) => {
  const [hoveredPillarId, setHoveredPillarId] = useState<string | null>(null)

  const numSlices = pillars.length
  if (numSlices === 0) return null

  // Geometry calculations
  const cx = size / 2
  const cy = size / 2
  const maxRadius = isCompact ? size * 0.42 : size * 0.33
  const labelRadius = maxRadius + (isCompact ? 18 : 28)
  const anglePerSlice = (2 * Math.PI) / numSlices
  // Start so the first slice is centered at top (12 o'clock)
  const startAngleOffset = -Math.PI / 2 - anglePerSlice / 2

  // Average Score
  const totalScore = pillars.reduce((sum, p) => sum + p.score, 0)
  const avgScore = (totalScore / numSlices).toFixed(1)

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          {/* Subtle Cyber Grid Glow */}
          <radialGradient id="wheelCoreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#100b1d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#100b1d" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* Background Ambient Circle */}
        <circle
          cx={cx}
          cy={cy}
          r={maxRadius}
          fill="url(#wheelCoreGradient)"
          stroke="#403052"
          strokeWidth="1.5"
        />

        {/* 10 Concentric Rings (Levels 1 to 10) */}
        {Array.from({ length: 10 }).map((_, idx) => {
          const level = idx + 1
          const r = (level / 10) * maxRadius
          const isOuter = level === 10
          return (
            <g key={`ring-${level}`}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={isOuter ? '#22d3ee' : '#332448'}
                strokeWidth={isOuter ? 1.5 : 0.8}
                strokeDasharray={isOuter ? undefined : '2 3'}
                opacity={isOuter ? 0.7 : 0.55}
              />
              {/* Level numbers along vertical axis in full mode */}
              {!isCompact && (level % 2 === 0 || level === 5 || level === 10) && (
                <text
                  x={cx + 3}
                  y={cy - r + 3}
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="monospace"
                  opacity={0.65}
                >
                  {level}
                </text>
              )}
            </g>
          )
        })}

        {/* Radial Spokes / Division Lines */}
        {Array.from({ length: numSlices }).map((_, idx) => {
          const angle = startAngleOffset + idx * anglePerSlice
          const x2 = cx + maxRadius * Math.cos(angle)
          const y2 = cy + maxRadius * Math.sin(angle)
          return (
            <line
              key={`spoke-${idx}`}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="#38294e"
              strokeWidth="1"
              opacity={0.7}
            />
          )
        })}

        {/* Slices: Filled Sectors Based on Rating (1 to 10) */}
        {!isBlankMode &&
          pillars.map((pillar, idx) => {
            const startAngle = startAngleOffset + idx * anglePerSlice
            const endAngle = startAngle + anglePerSlice
            const scoreRadius = Math.max((pillar.score / 10) * maxRadius, 6)

            const x1 = cx + scoreRadius * Math.cos(startAngle)
            const y1 = cy + scoreRadius * Math.sin(startAngle)
            const x2 = cx + scoreRadius * Math.cos(endAngle)
            const y2 = cy + scoreRadius * Math.sin(endAngle)

            // SVG Path for sector (Center -> Start Point -> Arc -> End Point -> Close to Center)
            const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${scoreRadius} ${scoreRadius} 0 0 1 ${x2} ${y2} Z`

            const isHovered = hoveredPillarId === pillar.id
            const isHighlighted = highlightPillarId === pillar.id

            return (
              <g
                key={pillar.id}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredPillarId(pillar.id)}
                onMouseLeave={() => setHoveredPillarId(null)}
                onClick={() => onPillarClick?.(pillar)}
              >
                {/* Sector Fill with Emerald/Cyber Theme */}
                <path
                  d={pathData}
                  fill={pillar.color}
                  fillOpacity={isHovered || isHighlighted ? 0.75 : 0.42}
                  stroke={pillar.accentColor || pillar.color}
                  strokeWidth={isHovered || isHighlighted ? 2.5 : 1.2}
                  style={{
                    filter:
                      isHovered || isHighlighted
                        ? `drop-shadow(0 0 8px ${pillar.color})`
                        : undefined,
                    transition: 'all 0.25s ease-out',
                  }}
                />

                {/* Outer Arc Highlight */}
                <path
                  d={`M ${x1} ${y1} A ${scoreRadius} ${scoreRadius} 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={pillar.accentColor || pillar.color}
                  strokeWidth={isHovered || isHighlighted ? 3.5 : 2}
                  strokeLinecap="round"
                />
              </g>
            )
          })}

        {/* Perimeter Labels (Full View Only) */}
        {!isCompact &&
          pillars.map((pillar, idx) => {
            const midAngle = startAngleOffset + (idx + 0.5) * anglePerSlice
            const lx = cx + labelRadius * Math.cos(midAngle)
            const ly = cy + labelRadius * Math.sin(midAngle)

            const isHovered = hoveredPillarId === pillar.id
            const isHighlighted = highlightPillarId === pillar.id

            // Text alignment based on horizontal position
            let textAnchor: 'middle' | 'start' | 'end' = 'middle'
            if (Math.cos(midAngle) > 0.25) textAnchor = 'start'
            else if (Math.cos(midAngle) < -0.25) textAnchor = 'end'

            return (
              <g
                key={`label-${pillar.id}`}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onPillarClick?.(pillar)}
                onMouseEnter={() => setHoveredPillarId(pillar.id)}
                onMouseLeave={() => setHoveredPillarId(null)}
              >
                {/* Primary Arabic Title */}
                <text
                  x={lx}
                  y={ly - 4}
                  textAnchor={textAnchor}
                  fill={isHovered || isHighlighted ? '#22d3ee' : '#f8fafc'}
                  fontSize="10"
                  fontWeight="bold"
                  className="font-mono transition-colors"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 6px #22d3ee)' : undefined,
                  }}
                >
                  {pillar.nameAr}
                </text>

                {/* Score Pill Text */}
                <text
                  x={lx}
                  y={ly + 8}
                  textAnchor={textAnchor}
                  fill={isHovered || isHighlighted ? pillar.accentColor : '#94a3b8'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {isBlankMode ? '—/10' : `${pillar.score}/10`}
                </text>
              </g>
            )
          })}

        {/* Center Bullseye Hub */}
        <circle
          cx={cx}
          cy={cy}
          r={isCompact ? 16 : 22}
          fill="#100b1d"
          stroke="#22d3ee"
          strokeWidth="2"
          className="shadow-lg"
          style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' }}
        />
        <circle cx={cx} cy={cy} r={isCompact ? 5 : 7} fill="#ec4899" />
      </svg>

      {/* Central Metric Badge in Compact Mode (For Dashboard Home) */}
      {isCompact && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="font-pixel text-[13px] text-neon-cyan font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
            {avgScore}
          </span>
          <span className="text-[7px] font-mono uppercase text-muted-foreground tracking-widest">
            BALANCE
          </span>
        </div>
      )}
    </div>
  )
}
