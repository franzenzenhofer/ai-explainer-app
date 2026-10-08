// The experiment cards: each one is a question with a known catch. Picking one asks the live model.
import { FlaskConical } from 'lucide-react'
import { useActionHalo } from '../../core/hooks/useHalo'
import { cn } from '../../core/utils/cn'
import { EXPERIMENTS } from './experiments'

interface ExperimentPickerProps {
  selectedId: string | null
  disabled: boolean
  onPick: (id: string) => void
}

export function ExperimentPicker({ selectedId, disabled, onPick }: ExperimentPickerProps) {
  const halo = useActionHalo('reality')
  return (
    <div role="group" aria-label="Experiments" className="flex flex-col gap-2">
      {EXPERIMENTS.map((experiment, index) => {
        const chosen = experiment.id === selectedId
        return (
          <button
            key={experiment.id}
            type="button"
            aria-pressed={chosen}
            aria-label={`${experiment.label}: ${experiment.question}`}
            title={experiment.question}
            disabled={disabled}
            onClick={() => {
              halo.used()
              onPick(experiment.id)
            }}
            className={cn(
              index === 0 && halo.className,
              'flex min-h-11 items-center gap-2 rounded-lg border-2 px-3 text-left text-base font-semibold transition hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:cursor-not-allowed disabled:opacity-60',
              chosen ? 'border-[var(--accent)] bg-[var(--accent)] text-paper' : 'border-[var(--concept-soft)] bg-paper text-ink hover:border-[var(--accent)]',
            )}
          >
            <FlaskConical aria-hidden="true" size={18} className="shrink-0" />
            {experiment.label}
          </button>
        )
      })}
    </div>
  )
}
