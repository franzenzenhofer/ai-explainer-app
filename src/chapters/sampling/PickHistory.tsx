// "Pick again": five independent weighted rolls over the same list, shown side by side.
import { useState } from 'react'
import type { PredictionCandidate } from '../../core/types'
import { Button } from '../../core/components/Button'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { sampleMany } from '../../model/sampling'

const PICKS_PER_ROLL = 5

interface PickHistoryProps {
  candidates: PredictionCandidate[]
}

interface Roll {
  round: number
  picks: PredictionCandidate[]
}

export function PickHistory({ candidates }: PickHistoryProps) {
  const [roll, setRoll] = useState<Roll | null>(null)
  const pickAgain = () => setRoll((previous) => ({ round: (previous?.round ?? 0) + 1, picks: sampleMany(candidates, PICKS_PER_ROLL) }))

  return (
    <div className="flex flex-col gap-4">
      <div data-primary-control>
        <Button variant="primary" onClick={pickAgain} className="w-full sm:w-auto" disabled={candidates.length === 0}>
          {roll ? 'Pick again' : `Pick ${PICKS_PER_ROLL} times`}
        </Button>
      </div>
      <div aria-live="polite">
        {roll ? (
          <>
            <p className="m-0 mb-2 text-base text-ink-2">Roll {roll.round}: five picks from the same list</p>
            <ol key={roll.round} data-picks aria-label={`Five picks, roll ${roll.round}`} className="m-0 flex list-none flex-wrap gap-2 p-0">
              {roll.picks.map((pick, index) => (
                <li
                  key={`${roll.round}-${index}`}
                  className="tint-accent flex min-h-11 items-center rounded-[3px] border-2 border-accent px-3 text-lg font-semibold text-ink"
                >
                  {formatTokenDisplay(pick.token)}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="m-0 text-base text-ink-2">Each pick is a weighted roll: likely tokens come up often, unlikely ones sometimes.</p>
        )}
      </div>
    </div>
  )
}
