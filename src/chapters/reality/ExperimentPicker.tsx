// The experiment cards: each one is a question with a known catch. Picking one asks the live model.
import { cn } from '../../core/utils/cn'
import { EXPERIMENTS } from './experiments'

interface ExperimentPickerProps {
  selectedId: string | null
  disabled: boolean
  onPick: (id: string) => void
}

export function ExperimentPicker({ selectedId, disabled, onPick }: ExperimentPickerProps) {
  return (
    <div role="group" aria-label="Experiments" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {EXPERIMENTS.map((experiment) => {
        const chosen = experiment.id === selectedId
        return (
          <button
            key={experiment.id}
            type="button"
            aria-pressed={chosen}
            disabled={disabled}
            onClick={() => onPick(experiment.id)}
            className={cn(
              'flex min-h-11 flex-col items-start gap-1 rounded-[3px] border-2 p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              chosen ? 'tint-accent border-accent' : 'border-rule bg-paper hover:border-rule-strong',
            )}
          >
            <span className="text-base font-semibold text-ink">{experiment.label}</span>
            <span className="text-base text-ink-2">{experiment.question}</span>
          </button>
        )
      })}
    </div>
  )
}
