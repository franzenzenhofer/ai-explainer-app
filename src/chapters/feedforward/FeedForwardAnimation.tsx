// The columns of the Feed-forward chapter: one column of numbers per token. In the feed-forward
// view no line joins two columns; in the attention view curved lines run from earlier columns
// into later ones and cross each other.
import type { Token } from '../../core/types'
import type { Provenance } from '../../core/components'
import { formatTokenInline } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'
import type { AttentionLine } from './columns'

export const provenance: Provenance = 'simulated'

const COLUMN_WIDTH = 76
const COLUMN_GAP = 8
const ARC_BAND_HEIGHT = 104
const ARC_BASE_RISE = 22
const ARC_RISE_PER_STEP = 14
const ARC_TOP_MARGIN = 6
const LINE_MIN_WIDTH = 1.5
const LINE_WEIGHT_WIDTH = 6
const LINE_BASE_OPACITY = 0.5
const LINE_WEIGHT_OPACITY = 0.5
// The value that fills half a cell; values from the simulation stay within about plus or minus 1.5.
const CELL_SCALE = 1.6
const HALF_PERCENT = 50

const columnCentre = (index: number) => index * (COLUMN_WIDTH + COLUMN_GAP) + COLUMN_WIDTH / 2
const rowWidth = (count: number) => count * (COLUMN_WIDTH + COLUMN_GAP) - COLUMN_GAP

function Cell({ value, highlighted }: { value: number; highlighted: boolean }) {
  const width = Math.min(1, Math.abs(value) / CELL_SCALE) * HALF_PERCENT
  const left = value >= 0 ? HALF_PERCENT : HALF_PERCENT - width
  return (
    <div className="relative h-5 bg-wash">
      <div className="absolute inset-y-0 left-1/2 w-px bg-rule-strong" />
      <div
        className={cn(
          'absolute inset-y-0.5 transition-all duration-500 motion-reduce:transition-none',
          highlighted ? 'bg-accent' : 'bg-ink',
        )}
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  )
}

interface ColumnsProps {
  tokens: Token[]
  columns: number[][]
  // Per column, the index of the number to draw in the accent, or null for none.
  highlights: Array<number | null>
}

export function Columns({ tokens, columns, highlights }: ColumnsProps) {
  return (
    <div className="flex" style={{ gap: COLUMN_GAP, width: rowWidth(tokens.length) }}>
      {columns.map((column, index) => (
        <div key={`${index}-${tokens[index].tokenId}`} data-column className="flex flex-col" style={{ width: COLUMN_WIDTH }}>
          <span className="truncate whitespace-pre border-b-4 border-ink pb-1 text-center text-base" title={tokens[index].text}>
            {formatTokenInline(tokens[index].text)}
          </span>
          <div className="mt-2 flex flex-col gap-1">
            {column.map((value, row) => (
              <Cell key={row} value={value} highlighted={highlights[index] === row} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function arcPath(line: AttentionLine): string {
  const x1 = columnCentre(line.from)
  const x2 = columnCentre(line.to)
  const rise = Math.min(ARC_BAND_HEIGHT - ARC_TOP_MARGIN, ARC_BASE_RISE + (line.to - line.from) * ARC_RISE_PER_STEP)
  const top = ARC_BAND_HEIGHT - rise
  return `M ${x1} ${ARC_BAND_HEIGHT} C ${x1} ${top}, ${x2} ${top}, ${x2} ${ARC_BAND_HEIGHT}`
}

interface AttentionArcsBandProps {
  count: number
  lines: AttentionLine[]
}

// The band above the columns where attention lines run from earlier columns into later ones.
export function AttentionArcsBand({ count, lines }: AttentionArcsBandProps) {
  const width = rowWidth(count)
  return (
    <svg width={width} height={ARC_BAND_HEIGHT} viewBox={`0 0 ${width} ${ARC_BAND_HEIGHT}`} aria-hidden="true" className="block">
      {lines.map((line) => (
        <path
          key={`${line.from}-${line.to}`}
          d={arcPath(line)}
          fill="none"
          stroke="var(--accent)"
          strokeOpacity={LINE_BASE_OPACITY + line.weight * LINE_WEIGHT_OPACITY}
          strokeWidth={LINE_MIN_WIDTH + line.weight * LINE_WEIGHT_WIDTH}
        />
      ))}
    </svg>
  )
}
