// One row of a probability chart: the candidate chip, a bar that grows in, and the percentage.
// Shared by Scores and Sampling. Rose = probability, amber = picked, grey = all other tokens,
// dashed = cut by the sampling settings.
import { motion } from 'motion/react'
import { CONCEPT_COLORS } from '../../core/colors'
import { cn } from '../../core/utils/cn'
import { CandidateLabel } from './CandidateLabel'

export type BarTone = 'probability' | 'picked' | 'tail' | 'cut'

interface CandidateBarProps {
  token: string | null
  probability: number
  // The probability that fills the whole track.
  max: number
  tone: BarTone
  value: string
  order: number
}

const FULL = 100
const MIN_WIDTH = 0.8
const STAGGER_S = 0.03
const TAIL_LABEL = 'All other tokens'

const FILL: Record<BarTone, string> = {
  probability: CONCEPT_COLORS.scores.solid,
  picked: CONCEPT_COLORS.pick.solid,
  tail: CONCEPT_COLORS.text.soft,
  cut: 'transparent',
}

export function barWidth(probability: number, max: number): number {
  return Math.max(MIN_WIDTH, max > 0 ? (probability / max) * FULL : 0)
}

export function CandidateBar({ token, probability, max, tone, value, order }: CandidateBarProps) {
  const cut = tone === 'cut'
  return (
    <div className="grid h-[22px] grid-cols-[7.5rem_minmax(0,1fr)_3.75rem] items-center gap-2">
      {token === null ? <span className="truncate text-base font-semibold text-ink-2">{TAIL_LABEL}</span> : <CandidateLabel token={token} className={cn(cut && 'opacity-50 line-through')} />}
      <span className="relative block h-4 rounded-sm" style={{ background: CONCEPT_COLORS.scores.tint }}>
        <motion.span
          className={cn('absolute inset-y-0 left-0 block rounded-sm', cut && 'border-2 border-dashed')}
          style={{ background: FILL[tone], borderColor: cut ? CONCEPT_COLORS.scores.soft : undefined }}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth(probability, max)}%` }}
          transition={{ delay: order * STAGGER_S, duration: 0.5, ease: 'easeOut' }}
        />
      </span>
      <span className={cn('text-right text-base font-semibold tabular-nums leading-none', cut ? 'text-ink-3' : 'text-ink')}>{value}</span>
    </div>
  )
}
