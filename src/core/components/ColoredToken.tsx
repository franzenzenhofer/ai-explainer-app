// ColoredToken - Token badge with persistent color
import { motion } from 'motion/react'
import { cn } from '../utils/cn'
import { getTokenColor, getTokenBgColor } from '../utils/colors'
import { formatTokenDisplay } from '../utils/formatters'
import { tokenAppear } from '../utils/animations'

interface ColoredTokenProps {
  text: string
  colorIndex: number
  tokenId?: number
  showId?: boolean
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  onClick?: () => void
  className?: string
  animate?: boolean
}

export function ColoredToken({
  text,
  colorIndex,
  tokenId,
  showId = false,
  size = 'md',
  selected = false,
  onClick,
  className,
  animate = true,
}: ColoredTokenProps) {
  const color = getTokenColor(colorIndex)
  const bgColor = getTokenBgColor(colorIndex, selected ? 0.4 : 0.15)
  const displayText = formatTokenDisplay(text)

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const Component = animate ? motion.span : 'span'
  const animationProps = animate ? { variants: tokenAppear, initial: 'initial', animate: 'animate' } : {}

  return (
    <Component
      {...animationProps}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-mono transition-all',
        'border hover:scale-105',
        onClick && 'cursor-pointer',
        selected && 'ring-2 ring-offset-1 ring-offset-white',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: bgColor,
        borderColor: color + '40',
        color: color,
        ...(selected ? { ringColor: color } : {}),
      }}
      onClick={onClick}
    >
      <span className="truncate max-w-[120px]">{displayText}</span>
      {showId && tokenId !== undefined && (
        <span
          className="text-[0.65em] opacity-60"
          style={{ color }}
        >
          #{tokenId}
        </span>
      )}
    </Component>
  )
}

// Token list container with staggered animation
interface TokenListProps {
  tokens: Array<{ text: string; tokenId: number; colorIndex: number }>
  showIds?: boolean
  size?: 'sm' | 'md' | 'lg'
  selectedIndex?: number | null
  onTokenClick?: (index: number) => void
  className?: string
}

export function TokenList({
  tokens,
  showIds = false,
  size = 'md',
  selectedIndex,
  onTokenClick,
  className,
}: TokenListProps) {
  return (
    <motion.div
      className={cn('flex flex-wrap gap-2', className)}
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: { staggerChildren: 0.03 }
        }
      }}
    >
      {tokens.map((token, index) => (
        <ColoredToken
          key={index}
          text={token.text}
          colorIndex={token.colorIndex}
          tokenId={token.tokenId}
          showId={showIds}
          size={size}
          selected={selectedIndex === index}
          onClick={onTokenClick ? () => onTokenClick(index) : undefined}
        />
      ))}
    </motion.div>
  )
}
