// Chapter 8: rolling the dice. The same illustrative list, reshaped and cut by three settings of
// the picker, then rolled five times at once.
import { useMemo } from 'react'
import { usePredictions, useTokens } from '../../core/hooks/useDerived'
import { ChapterLayout, VisualFrame } from '../../core/components'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { illustrativeDistribution } from '../../model/distribution'
import { PickHistory } from './PickHistory'
import { SamplingChart, provenance } from './SamplingChart'
import { SamplingControls } from './SamplingControls'
import { samplingRows } from './samplingRows'

// The visual's provenance, re-exported so this chapter's VisualFrame declares it too.
export { provenance }

const ROWS_SHOWN = 20

export function SamplingChapter() {
  const tokens = useTokens()
  const kept = usePredictions()
  const raw = useMemo(() => illustrativeDistribution(tokens, tokens.length - 1), [tokens])
  const rows = samplingRows(raw, kept, ROWS_SHOWN)
  const last = formatTokenDisplay(tokens[tokens.length - 1]?.text ?? '')

  return (
    <ChapterLayout id="sampling">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <VisualFrame
          title="The list after the settings"
          provenance={provenance}
          caption={`Simulated: the illustrative list of ${raw.length} candidates after "${last}", not a model. The settings belong to the picker; they do not change the model.`}
        >
          <p className="m-0 mb-4 text-lg" aria-live="polite">
            {kept.length} of {raw.length} candidates kept. The most likely {ROWS_SHOWN} are shown.
          </p>
          <SamplingChart rows={rows} />
        </VisualFrame>
        <div className="flex flex-col gap-10">
          <PickHistory candidates={kept} />
          <SamplingControls candidateCount={raw.length} />
        </div>
      </div>
    </ChapterLayout>
  )
}
