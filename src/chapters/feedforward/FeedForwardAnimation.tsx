// The columns of the Feed-forward slide: one column of numbers per token (violet), the number a run
// moved most in green. In the attention view orange lines draw in from earlier columns to later ones.
import { motion } from 'motion/react'
import type { Token } from '../../core/types'
import type { Provenance } from '../../core/components'
import { TokenChip } from '../../core/components/TokenChip'
import { CONCEPT_COLORS } from '../../core/colors'
import type { RowGeometry } from '../attention/useCenters'
import type { AttentionLine } from './columns'

export const provenance: Provenance = 'simulated'

export const ARC_BAND_HEIGHT = 84
const ARC_BASE_RISE = 18
const ARC_RISE_PER_STEP = 12
const ARC_TOP_MARGIN = 4
const LINE_MIN_WIDTH = 1.5
const LINE_WEIGHT_WIDTH = 6
const LINE_STAGGER_S = 0.03
const LINE_BASE_OPACITY = 0.5
const LINE_WEIGHT_OPACITY = 0.5
const LINE_DRAW_S = 0.5
const GLOW_S = 0.9
// The value that fills half a cell; values from the simulation stay within about plus or minus 1.5.
const CELL_SCALE = 1.6
const HALF_PERCENT = 50
const NUMBERS = CONCEPT_COLORS.numbers
const MOVED = CONCEPT_COLORS.feedforward

function Cell({ value, highlighted }: { value: number; highlighted: boolean }) {
  const width = Math.min(1, Math.abs(value) / CELL_SCALE) * HALF_PERCENT
  const left = value >= 0 ? HALF_PERCENT : HALF_PERCENT - width
  return (
    <div className="relative h-4 rounded-sm" style={{ background: NUMBERS.tint }}>
      <div className="absolute inset-y-0 left-1/2 w-0.5" style={{ background: NUMBERS.soft }} />
      <div
        className="absolute inset-y-0.5 rounded-sm transition-all duration-500 motion-reduce:transition-none"
        style={{ left: `${left}%`, width: `${width}%`, background: highlighted ? MOVED.solid : NUMBERS.solid }}
      />
    </div>
  )
}

interface ColumnsProps {
  tokens: Token[]
  columns: number[][]
  // Per column, the index of the number to draw in green, or null for none.
  highlights: Array<number | null>
  runs: number
}

export function Columns({ tokens, columns, highlights, runs }: ColumnsProps) {
  return (
    <>
      {columns.map((column, index) => (
        <motion.div
          key={`${index}-${tokens[index].tokenId}-${runs}`}
          data-slot
          data-column
          className="flex min-w-[4.5rem] flex-col gap-1.5 rounded-xl p-1"
          initial={{ boxShadow: runs > 0 ? `0 0 0 3px ${MOVED.solid}` : '0 0 0 0px transparent' }}
          animate={{ boxShadow: '0 0 0 0px transparent' }}
          transition={{ duration: GLOW_S }}
        >
          <TokenChip text={tokens[index].text} tokenId={tokens[index].tokenId} order={index} className="flex-col items-center gap-0 py-0.5" />
          <div className="flex flex-col gap-1">
            {column.map((value, row) => (
              <Cell key={row} value={value} highlighted={highlights[index] === row} />
            ))}
          </div>
        </motion.div>
      ))}
    </>
  )
}

function arcPath(line: AttentionLine, geometry: RowGeometry): string {
  const x1 = geometry.centers[line.from]
  const x2 = geometry.centers[line.to]
  const rise = Math.min(ARC_BAND_HEIGHT - ARC_TOP_MARGIN, ARC_BASE_RISE + (line.to - line.from) * ARC_RISE_PER_STEP)
  const top = ARC_BAND_HEIGHT - rise
  return `M ${x2} ${ARC_BAND_HEIGHT} C ${x2} ${top}, ${x1} ${top}, ${x1} ${ARC_BAND_HEIGHT}`
}

// The band above the columns where attention lines run between columns.
export function AttentionArcsBand({ geometry, lines }: { geometry: RowGeometry; lines: AttentionLine[] }) {
  const drawable = lines.filter((line) => geometry.centers[line.from] !== undefined && geometry.centers[line.to] !== undefined)
  return (
    <svg width={geometry.width} height={ARC_BAND_HEIGHT} aria-hidden="true" className="block">
      {drawable.map((line, index) => (
        <motion.path
          key={`${line.from}-${line.to}`}
          d={arcPath(line, geometry)}
          fill="none"
          stroke={CONCEPT_COLORS.attention.solid}
          strokeOpacity={LINE_BASE_OPACITY + line.weight * LINE_WEIGHT_OPACITY}
          strokeWidth={LINE_MIN_WIDTH + line.weight * LINE_WEIGHT_WIDTH}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: LINE_DRAW_S, delay: index * LINE_STAGGER_S }}
        />
      ))}
    </svg>
  )
}
