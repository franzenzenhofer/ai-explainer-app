// The lens picker: four named attention patterns instead of numbered heads, each linked to where the
// pattern is documented, and the button that opens the known head types.
import { useAppStore } from '../../store/appStore'
import { SOURCES } from '../../core/chapters'
import { ToggleGroup } from '../../core/components'
import { LENSES } from '../../model/attention'

interface LensPickerProps {
  onShowHeadTypes: () => void
}

export function LensPicker({ onShowHeadTypes }: LensPickerProps) {
  const selectedLens = useAppStore((s) => s.selectedLens)
  const setSelectedLens = useAppStore((s) => s.setSelectedLens)
  const lens = LENSES.find((candidate) => candidate.id === selectedLens) ?? LENSES[0]
  return (
    <div className="flex flex-col gap-1" data-primary-control>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-bold text-[var(--concept-strong)]">Pattern:</span>
        <ToggleGroup
          label="Attention lens"
          options={LENSES.map((candidate) => ({ value: candidate.id, label: candidate.name }))}
          value={selectedLens}
          onChange={setSelectedLens}
        />
      </div>
      <div className="flex items-center gap-3">
        <p className="m-0 min-w-0 flex-1 text-base leading-snug text-ink-2">
          {lens.description} Found in:{' '}
          <a href={SOURCES[lens.source].url} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4">
            {SOURCES[lens.source].label}
          </a>
        </p>
        <button
          type="button"
          onClick={onShowHeadTypes}
          className="min-h-11 shrink-0 rounded-lg border-2 border-[var(--concept-strong)] px-3 text-base font-semibold text-[var(--concept-strong)] hover:bg-[var(--concept-tint)]"
        >
          Known head types
        </button>
      </div>
    </div>
  )
}
