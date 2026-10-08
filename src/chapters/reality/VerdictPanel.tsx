// VerdictPanel - the reader judges the live reply, then sees a note that matches the verdict.
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
    <div className="mt-2 flex flex-wrap gap-2">
      {CHOICES.map((option) => {
        const chosen = choice === option.choice
        return (
          <button
            key={option.choice}
            type="button"
            onClick={() => onChoose(option.choice)}
            aria-pressed={chosen}
            className={cn(
              'min-h-11 min-w-11 rounded-[3px] border-2 px-4 text-base font-medium text-ink transition-colors',
              chosen ? 'tint-accent border-accent' : 'border-rule bg-paper hover:border-rule-strong',
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
    <div className="space-y-3">
      {experiment.hint && <p className="m-0 text-base text-ink-2">{experiment.hint}</p>}
      {checkedAutomatically ? (
        <p className="m-0 text-base font-semibold text-ink">
          Checked against the arithmetic: the reply contains the correct product.
        </p>
      ) : (
        <fieldset className="m-0 border-0 p-0">
          <legend className="text-base font-semibold text-ink">{experiment.judgeQuestion}</legend>
          <ChoiceButtons choice={choice} onChoose={onChoose} />
        </fieldset>
      )}
      {verdict && (
        <p role="status" className="m-0 rounded-[3px] border-2 border-ink p-4 text-base text-ink">
          {experiment.notes[verdict]}
        </p>
      )}
    </div>
  )
}
