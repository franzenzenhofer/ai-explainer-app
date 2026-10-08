// "Pick 5 times": the button, the five picks dropping into the row in amber, and how many candidates
// the settings kept.
import { AnimatePresence, motion } from 'motion/react'
import { useActionHalo } from '../../core/hooks/useHalo'
import type { PredictionCandidate } from '../../core/types'
import { CONCEPT_COLORS } from '../../core/colors'
import { Button } from '../../core/components/Button'
import { CandidateLabel } from '../scores/CandidateLabel'
import { PICKS_PER_ROLL } from './useRoll'

interface PickRowProps {
  round: number
  picks: PredictionCandidate[]
  rolling: boolean
  onRoll: () => void
}

export function PickRow({ round, picks, rolling, onRoll }: PickRowProps) {
  const halo = useActionHalo('sampling')
  const roll = () => {
    halo.used()
    onRoll()
  }
  const pick = CONCEPT_COLORS.pick
  return (
    <div className="flex min-h-11 items-center gap-3" data-primary-control>
      <Button variant="primary" onClick={roll} disabled={rolling} className={`shrink-0 ${halo.className}`}>
        {round === 0 ? `Pick ${PICKS_PER_ROLL} times` : 'Pick again'}
      </Button>
      {round === 0 ? (
        <p className="m-0 text-base text-ink-2">Each pick is a weighted roll: likely tokens come up often, unlikely ones sometimes.</p>
      ) : (
        <ol key={round} data-picks aria-label={`Five picks, roll ${round}`} aria-live="polite" className="m-0 flex list-none items-center gap-2 p-0">
          <AnimatePresence>
            {picks.map((candidate, index) => (
              <motion.li
                key={`${round}-${index}`}
                initial={{ opacity: 0, y: -18, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex min-h-11 items-center rounded-lg border-2 px-1.5"
                style={{ borderColor: pick.solid, background: pick.tint }}
              >
                <CandidateLabel token={candidate.token} className="max-w-[7rem]" />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </div>
  )
}
