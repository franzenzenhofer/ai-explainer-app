// VerdictPanel - the reader judges the live reply, then sees a note that matches the verdict.
import { motion } from 'motion/react'
import { cn } from '../../core/utils/cn'
import type { Experiment, ReaderChoice, Verdict } from './experiments'

const CHOICES: Array<{ choice: ReaderChoice; label: string }> = [
  { choice: 'yes', label: 'Yes' },
  { choice: 'no', label: 'No' },
  { choice: 'unsure', label: 'Not sure' },
]

interface VerdictPanelProps {
  experiment: Experiment
  choice: ReaderChoice | null
  verdict: Verdict | null
  checkedAutomatically: boolean
  onChoose: (choice: ReaderChoice) => void
}

function ChoiceButtons({ choice, onChoose }: Pick<VerdictPanelProps, 'choice' | 'onChoose'>) {
  return (
    <div className="flex shrink-0 gap-2">
      {CHOICES.map((option) => {
        const chosen = choice === option.choice
        return (
          <button
            key={option.choice}
            type="button"
            onClick={() => onChoose(option.choice)}
            aria-pressed={chosen}
            className={cn(
              'min-h-11 min-w-11 rounded-lg border-2 px-3 text-base font-semibold transition-colors',
              chosen ? 'border-[var(--accent)] bg-[var(--accent)] text-paper' : 'border-[var(--concept-soft)] bg-paper text-ink hover:border-[var(--accent)]',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function VerdictPanel({ experiment, choice, verdict, checkedAutomatically, onChoose }: VerdictPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      {checkedAutomatically ? (
        <p className="m-0 text-base font-semibold text-ink">Checked against the arithmetic: the reply contains the correct product.</p>
      ) : (
        <fieldset className="m-0 flex items-center justify-between gap-3 border-0 p-0">
          <legend className="sr-only">{experiment.judgeQuestion}</legend>
          <p aria-hidden="true" className="m-0 text-base font-bold text-ink">
            Your verdict: {experiment.judgeQuestion}
          </p>
          <ChoiceButtons choice={choice} onChoose={onChoose} />
        </fieldset>
      )}
      {verdict && (
        <motion.p
          key={verdict}
          ref={(node) => node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })}
          role="status"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-0 rounded-xl border-2 p-3 text-base text-ink"
          style={{ borderColor: 'var(--concept-soft)', background: 'var(--concept-tint)' }}
        >
          {experiment.hint && <span className="font-semibold">{experiment.hint} </span>}
          {experiment.notes[verdict]}
        </motion.p>
      )}
    </div>
  )
}
