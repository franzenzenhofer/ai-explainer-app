// Chapter 8: rolling the dice. The model's real top candidates, reshaped and cut by three settings of
// the picker in the browser, then rolled five times at once.
import { useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import { ChapterLayout, VisualFrame } from '../../core/components'
import { LOOP_MODEL } from '../../core/types'
import { formatPercent } from '../../core/utils/formatters'
import { applySampling } from '../../model/sampling'
import type { LoopStep } from '../../model/loopSteps'
import { LiveListGate } from '../loop/LiveListGate'
import { PickHistory } from './PickHistory'
import { SamplingChart, provenance } from './SamplingChart'
import { SamplingControls } from './SamplingControls'
import { samplingRows } from './samplingRows'

// The visual's provenance, re-exported so this chapter's VisualFrame declares it too.
export { provenance }

const CAPTION = `Real: the probabilities are ${LOOP_MODEL.name}'s own top ${LOOP_MODEL.candidatesPerStep}; the settings and the rolls run here in your browser on those numbers, with the probability left outside the list ignored. The settings belong to the picker; they do not change the model.`

function Picker({ step }: { step: LoopStep }) {
  const temperature = useAppStore((s) => s.temperature)
  const topK = useAppStore((s) => s.topK)
  const topP = useAppStore((s) => s.topP)
  const raw = step.candidates
  const kept = useMemo(() => applySampling(raw, { temperature, topK, topP }), [raw, temperature, topK, topP])
  const rows = samplingRows(raw, kept, raw.length)
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <p className="m-0 mb-4 text-lg" aria-live="polite">
          {kept.length} of {raw.length} candidates kept. The model puts {formatPercent(step.tailProbability)} on everything else; it is not in the roll.
        </p>
        <SamplingChart rows={rows} />
      </div>
      <div className="flex flex-col gap-10">
        <PickHistory candidates={kept} />
        <SamplingControls candidateCount={raw.length} />
      </div>
    </div>
  )
}

export function SamplingChapter() {
  const context = useAppStore((s) => s.inputText)
  return (
    <ChapterLayout id="sampling">
      <VisualFrame title="The list after the settings" provenance={provenance} caption={CAPTION}>
        <LiveListGate context={context}>{(step) => <Picker step={step} />}</LiveListGate>
      </VisualFrame>
    </ChapterLayout>
  )
}
