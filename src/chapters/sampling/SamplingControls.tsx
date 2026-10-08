// The three settings of the picker, stacked: temperature (with presets), top-k, top-p.
import { useAppStore } from '../../store/appStore'
import { ControlPresets, ControlSlider } from '../../core/components/ControlSlider'

const TEMPERATURE = { min: 0, max: 2, step: 0.1 }
const TOP_K = { min: 1, step: 1 }
const TOP_P = { min: 0.1, max: 1, step: 0.05 }

const TEMPERATURE_PRESETS = [
  { label: 'Greedy', value: 0 },
  { label: 'Low', value: 0.5 },
  { label: 'Medium', value: 1 },
  { label: 'High', value: 1.5 },
  { label: 'Max', value: 2 },
]

interface SamplingControlsProps {
  candidateCount: number
}

export function SamplingControls({ candidateCount }: SamplingControlsProps) {
  const temperature = useAppStore((s) => s.temperature)
  const setTemperature = useAppStore((s) => s.setTemperature)
  const topK = useAppStore((s) => s.topK)
  const setTopK = useAppStore((s) => s.setTopK)
  const topP = useAppStore((s) => s.topP)
  const setTopP = useAppStore((s) => s.setTopP)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlSlider
          label="Temperature"
          value={temperature}
          onChange={setTemperature}
          {...TEMPERATURE}
          formatValue={(v) => v.toFixed(1)}
          description="Low sharpens the top of the list, high flattens it. 0 always takes the top token."
        />
        <ControlPresets label="Temperature presets" presets={TEMPERATURE_PRESETS} currentValue={temperature} onChange={setTemperature} />
      </div>
      <ControlSlider
        label="Top-k"
        value={Math.min(topK, candidateCount)}
        onChange={setTopK}
        min={TOP_K.min}
        max={candidateCount}
        step={TOP_K.step}
        formatValue={(v) => v.toFixed(0)}
        description="Keep only the k most likely tokens."
      />
      <ControlSlider
        label="Top-p"
        value={topP}
        onChange={setTopP}
        {...TOP_P}
        formatValue={(v) => v.toFixed(2)}
        description="Keep the smallest set of top tokens whose probabilities add up to p."
      />
    </div>
  )
}
