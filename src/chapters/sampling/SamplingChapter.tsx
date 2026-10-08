// Slide 8: rolling the dice. The model's real top candidates, reshaped and cut by three settings of
// the picker in the browser, then rolled five times with the roll played back on the bars.
import { useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import { SlideLayout, VisualFrame } from '../../core/components'
import { LOOP_MODEL } from '../../core/types'
import { applySampling } from '../../model/sampling'
import type { LoopStep } from '../../model/loopSteps'
import { LiveListGate } from '../loop/LiveListGate'
import { PickRow } from './PickRow'
import { SamplingChart, provenance } from './SamplingChart'
import { SamplingControls, TemperaturePresets } from './SamplingControls'
import { samplingRows } from './samplingRows'
import { useRoll } from './useRoll'

// The visual's provenance, re-exported so this chapter's VisualFrame declares it too.
export { provenance }

const CAPTION = `Real: the probabilities are ${LOOP_MODEL.name}'s own top ${LOOP_MODEL.candidatesPerStep}; the settings and the rolls run here in your browser on those numbers, with the probability left outside the list (all other tokens) not in the roll. The settings belong to the picker; they do not change the model.`

function Picker({ step }: { step: LoopStep }) {
  const temperature = useAppStore((s) => s.temperature)
  const topK = useAppStore((s) => s.topK)
  const topP = useAppStore((s) => s.topP)
  const raw = step.candidates
  const kept = useMemo(() => applySampling(raw, { temperature, topK, topP }), [raw, temperature, topK, topP])
  const rows = samplingRows(raw, kept, raw.length)
  const { roll, current, rolling, start } = useRoll(kept)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-base text-ink" aria-live="polite">
          <span className="font-bold" style={{ color: 'var(--concept-strong)' }}>{kept.length} of {raw.length} kept</span> by the settings.
        </p>
        <TemperaturePresets />
      </div>
      <SamplingChart rows={rows} frame={current} />
      <PickRow round={roll?.round ?? 0} picks={roll?.picks.slice(0, current.shown) ?? []} rolling={rolling} onRoll={start} />
      <SamplingControls candidateCount={raw.length} />
    </div>
  )
}

export function SamplingChapter() {
  const context = useAppStore((s) => s.inputText)
  return (
    <SlideLayout id="sampling">
      <VisualFrame title="The list after the settings, and the roll" provenance={provenance} caption={CAPTION}>
        <LiveListGate context={context}>{(step) => <Picker step={step} />}</LiveListGate>
      </VisualFrame>
    </SlideLayout>
  )
}
