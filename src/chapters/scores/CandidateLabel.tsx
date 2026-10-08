// A candidate token as a compact chip in its identity colour (the same colour as on every slide).
// Compact because the chart rows are 22px tall; the live model reports no token IDs, so none is shown.
import { tokenColor } from '../../core/colors'
import { cn } from '../../core/utils/cn'
import { formatTokenDisplay } from '../../core/utils/formatters'

interface CandidateLabelProps {
  token: string
  className?: string
}

export function CandidateLabel({ token, className }: CandidateLabelProps) {
  const color = tokenColor(token)
  const label = formatTokenDisplay(token)
  return (
    <span
      title={label}
      className={cn('inline-block max-w-full truncate rounded border-2 px-1.5 font-mono text-base font-semibold leading-[18px]', className)}
      style={{ background: color.fill, borderColor: color.border, color: color.text }}
    >
      {label}
    </span>
  )
}
