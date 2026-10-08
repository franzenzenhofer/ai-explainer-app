// The lens picker: four named attention patterns instead of numbered heads. Each says what it shows
// and links to where the pattern is documented.
import { useAppStore } from '../../store/appStore'
import { SOURCES } from '../../core/chapters'
import { ToggleGroup } from '../../core/components'
import { LENSES } from '../../model/attention'

export function LensPicker() {
  const selectedLens = useAppStore((s) => s.selectedLens)
  const setSelectedLens = useAppStore((s) => s.setSelectedLens)
  const lens = LENSES.find((candidate) => candidate.id === selectedLens) ?? LENSES[0]
  return (
    <div>
      <p className="m-0 mb-2 text-base font-semibold">Lens: one pattern a head can learn</p>
      <ToggleGroup
        label="Attention lens"
        options={LENSES.map((candidate) => ({ value: candidate.id, label: candidate.name }))}
        value={selectedLens}
        onChange={setSelectedLens}
      />
      <p className="m-0 mt-3 text-base text-ink-2">
        {lens.description} Found in:{' '}
        <a href={SOURCES[lens.source].url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-ink underline underline-offset-4">
          {SOURCES[lens.source].label}
        </a>
      </p>
    </div>
  )
}
