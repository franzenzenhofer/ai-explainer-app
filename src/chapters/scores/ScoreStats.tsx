// Three honest stat tiles next to the chart (the old app's tiles, counting up): how many candidates
// are shown, the top token's probability, and what all other tokens of the vocabulary get together.
import { StatTile } from '../../core/components'
import { formatPercent } from '../../core/utils/formatters'
import type { LoopStep } from '../../model/loopSteps'

export function ScoreStats({ step }: { step: LoopStep }) {
  return (
    <div className="flex w-40 shrink-0 flex-col gap-2">
      <StatTile value={step.candidates.length} label="shown" />
      <StatTile value={step.candidates[0]?.probability ?? 0} label="top token" format={formatPercent} />
      <StatTile value={step.tailProbability} label="all others" format={formatPercent} />
    </div>
  )
}
