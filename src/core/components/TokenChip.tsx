// One token as a chip in its identity colour, with its ID (#9617) when the tokenizer gives one.
// The same token text has the same colour on every slide, whatever tokenizer produced it.
import { motion } from 'motion/react'
import type { ButtonHTMLAttributes } from 'react'
import { tokenColor } from '../colors'
import { cn } from '../utils/cn'
import { formatTokenDisplay } from '../utils/formatters'

export type ChipSize = 'md' | 'lg'

interface TokenChipProps {
  text: string
  tokenId?: number
  selected?: boolean
  muted?: boolean
  size?: ChipSize
  // Position in a row, for the staggered fade-in when the row first appears.
  order?: number
  onClick?: () => void
  label?: string
  className?: string
}

const STAGGER_S = 0.035
const MAX_STAGGER_S = 0.9
const SIZES: Record<ChipSize, string> = {
  md: 'min-h-11 px-2 text-lg',
  lg: 'min-h-12 px-3 text-2xl',
}

export function chipDelay(order: number): number {
  return Math.min(order * STAGGER_S, MAX_STAGGER_S)
}

export function TokenChip({ text, tokenId, selected, muted, size = 'md', order = 0, onClick, label, className }: TokenChipProps) {
  const color = tokenColor(text)
  const style = muted
    ? { background: '#f4f4f5', borderColor: '#d4d4d8', color: '#52525b' }
    : { background: color.fill, borderColor: selected ? color.text : color.border, color: color.text }
  const body = (
    <>
      <span className="whitespace-pre font-mono font-semibold leading-none">{formatTokenDisplay(text)}</span>
      {tokenId !== undefined && <span className="font-mono text-base leading-none opacity-80">#{tokenId}</span>}
    </>
  )
  const classes = cn(
    'inline-flex items-center gap-1.5 rounded-md border-2 transition-shadow',
    SIZES[size],
    selected && 'shadow-[0_0_0_3px_var(--accent)]',
    muted && 'border-dashed',
    className,
  )
  // A fade only: chips never move on their own after they first show.
  const motionProps = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: chipDelay(order), duration: 0.28 } }
  if (!onClick) return <motion.span {...motionProps} className={classes} style={style} aria-label={label}>{body}</motion.span>
  const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = { type: 'button', 'aria-pressed': selected ?? false, 'aria-label': label, onClick }
  return (
    <motion.button {...motionProps} {...(buttonProps as object)} whileHover={{ y: -2 }} className={cn(classes, 'cursor-pointer')} style={style}>
      {body}
    </motion.button>
  )
}
