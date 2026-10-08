// SamplingChart - the model's real candidates, kept (rose) or cut (dashed) by the settings, in two
// columns. The bars reshape smoothly when a setting moves; during a roll the highlight runs over the
// kept rows and the landed pick turns amber.
import { CONCEPT_COLORS } from '../../core/colors'
import type { Provenance } from '../../core/components/ProvenanceBadge'
import { formatPercent } from '../../core/utils/formatters'
import { CandidateBar, type BarTone } from '../scores/CandidateBar'
import type { RollFrame } from './rollTimeline'
import type { SamplingRow } from './samplingRows'

export const provenance: Provenance = 'real'

interface SamplingChartProps {
  rows: SamplingRow[]
  frame: RollFrame
}

function toneOf(row: SamplingRow, frame: RollFrame): BarTone {
  if (row.keptProbability === null) return 'cut'
  return frame.landed && frame.highlight === row.candidate.token ? 'picked' : 'probability'
}

export function SamplingChart({ rows, frame }: SamplingChartProps) {
  const max = Math.max(...rows.map((row) => row.keptProbability ?? row.candidate.probability))
  return (
    <ol aria-label="Candidates after the settings" className="m-0 grid list-none grid-flow-col grid-rows-[repeat(10,auto)] gap-x-6 gap-y-0 p-0">
      {rows.map((row, index) => {
        const lit = frame.highlight === row.candidate.token
        return (
          <li
            key={row.candidate.token}
            className="rounded-md px-1 transition-colors"
            style={{ background: lit ? CONCEPT_COLORS.pick.tint : undefined, boxShadow: lit ? `0 0 0 2px ${CONCEPT_COLORS.pick.solid}` : undefined }}
          >
            <CandidateBar
              token={row.candidate.token}
              probability={row.keptProbability ?? row.candidate.probability}
              max={max}
              tone={toneOf(row, frame)}
              value={row.keptProbability === null ? 'cut' : formatPercent(row.keptProbability)}
              order={index}
            />
          </li>
        )
      })}
    </ol>
  )
}
