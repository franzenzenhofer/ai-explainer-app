// SemanticSpace - 2D visualization of token embeddings
import { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { scaleLinear } from 'd3-scale'
import type { Token } from '../../core/types'
import { getTokenColor } from '../../core/utils/colors'
import { get2DPosition } from './embeddings'
import { cn } from '../../core/utils/cn'

interface SemanticSpaceProps {
  tokens: Token[]
  selectedIndex: number | null
  onTokenClick: (index: number | null) => void
}

export function SemanticSpace({ tokens, selectedIndex, onTokenClick }: SemanticSpaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: Math.max(250, rect.height),
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Calculate positions for tokens
  const tokenPositions = useMemo(() => {
    const padding = 40
    const xScale = scaleLinear()
      .domain([0, 1])
      .range([padding, dimensions.width - padding])
    const yScale = scaleLinear()
      .domain([0, 1])
      .range([padding, dimensions.height - padding])

    return tokens.map((token) => {
      const [x, y] = get2DPosition(token.text, token.tokenId)
      return {
        token,
        x: xScale(x),
        y: yScale(y),
      }
    })
  }, [tokens, dimensions])

  if (tokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
        No tokens to visualize
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
      onClick={() => onTokenClick(null)}
    >
      {/* Grid Background */}
      <svg className="absolute inset-0" width="100%" height="100%">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(0,0,0,0.05)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* NOTE: Lines removed - they were confusing without similarity scores.
          Token positions already show semantic relationships (nearby = similar).
          Token-to-token relationships are shown in the Attention step. */}

      {/* Token Points */}
      {tokenPositions.map(({ token, x, y }, index) => {
        const isSelected = index === selectedIndex
        const color = getTokenColor(token.colorIndex)

        return (
          <motion.div
            key={token.id}
            className={cn(
              'absolute flex cursor-pointer items-center justify-center',
              'transition-transform hover:z-10'
            )}
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isSelected ? 1.5 : 1,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
              delay: index * 0.03,
            }}
            whileHover={{ scale: isSelected ? 1.5 : 1.2 }}
            onClick={(e) => {
              e.stopPropagation()
              onTokenClick(isSelected ? null : index)
            }}
          >
            {/* Outer glow when selected */}
            {isSelected && (
              <motion.div
                className="absolute h-12 w-12 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Token pill - shows full text */}
            <div
              className={cn(
                'relative flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-semibold shadow-lg whitespace-nowrap',
                isSelected && 'ring-2 ring-white'
              )}
              style={{
                backgroundColor: color,
                color: 'white',
                minWidth: '24px',
              }}
            >
              {token.text.trim() || '␣'}
            </div>

            {/* Label on hover/selected */}
            {isSelected && (
              <motion.div
                className="absolute left-full ml-2 whitespace-nowrap rounded bg-white shadow-md px-2 py-1 text-xs text-slate-700 border border-slate-200"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {token.text}
              </motion.div>
            )}
          </motion.div>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[10px] text-slate-500 border border-slate-200">
        {tokens.length} tokens · Nearby = similar meaning
      </div>
    </div>
  )
}
