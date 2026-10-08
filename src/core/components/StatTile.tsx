// A big number with a label under it, counting up in the slide's colour (old stat tiles).
import { CountUp } from './CountUp'

interface StatTileProps {
  value: number
  label: string
  format?: (value: number) => string
}

const wholeNumber = (value: number) => Math.round(value).toLocaleString('en-US')

export function StatTile({ value, label, format = wholeNumber }: StatTileProps) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-xl border-2 bg-paper px-3 py-1.5" style={{ borderColor: 'var(--concept-soft)' }}>
      <span className="text-[1.75rem] font-extrabold leading-tight" style={{ color: 'var(--concept-strong)' }}>
        <CountUp value={value} format={format} />
      </span>
      <span className="text-center text-base font-semibold uppercase tracking-wide text-ink-2">{label}</span>
    </div>
  )
}
