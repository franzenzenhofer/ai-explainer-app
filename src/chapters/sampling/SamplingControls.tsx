// The three settings of the picker in one row: temperature, top-k, top-p, each with a live one-line
// reading of what the current value does, and the temperature presets.
import { useAppStore } from '../../store/appStore'
import { ControlPresets, ControlSlider } from '../../core/components/ControlSlider'

const TEMPERATURE = { min: 0, max: 2, step: 0.1 }
const TOP_K = { min: 1, step: 1 }
const TOP_P = { min: 0.1, max: 1, step: 0.05 }
const LOW_TEMPERATURE = 0.7
const HIGH_TEMPERATURE = 1.2
const PERCENT = 100

const TEMPERATURE_PRESETS = [
  { label: 'Greedy', value: 0 },
  { label: 'Low', value: 0.5 },
  { label: 'Medium', value: 1 },
  { label: 'High', value: 1.5 },
  { label: 'Max', value: 2 },
]

export function temperatureMeaning(temperature: number): string {
  if (temperature === 0) return 'Greedy: always the top one.'
  if (temperature < LOW_TEMPERATURE) return 'Low: a sharper list.'
  if (temperature <= HIGH_TEMPERATURE) return 'Balanced: close to the model.'
  return 'High: a flatter list.'
}

// The temperature presets of the old app: Greedy, Low, Medium, High, Max.
export function TemperaturePresets() {
  const temperature = useAppStore((s) => s.temperature)
  const setTemperature = useAppStore((s) => s.setTemperature)
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-base font-semibold text-ink-2">Temperature:</span>
      <ControlPresets label="Temperature presets" presets={TEMPERATURE_PRESETS} currentValue={temperature} onChange={setTemperature} />
    </div>
  )
}

export function SamplingControls({ candidateCount }: { candidateCount: number }) {
  const temperature = useAppStore((s) => s.temperature)
  const setTemperature = useAppStore((s) => s.setTemperature)
  const topK = useAppStore((s) => s.topK)
  const setTopK = useAppStore((s) => s.setTopK)
  const topP = useAppStore((s) => s.topP)
  const setTopP = useAppStore((s) => s.setTopP)
  const k = Math.min(topK, candidateCount)
  return (
    <div className="grid grid-cols-3 gap-4">
      <ControlSlider label="Temperature" value={temperature} onChange={setTemperature} {...TEMPERATURE} formatValue={(v) => v.toFixed(1)} description={temperatureMeaning(temperature)} />
      <ControlSlider label="Top-k" value={k} onChange={setTopK} min={TOP_K.min} max={candidateCount} step={TOP_K.step} formatValue={(v) => v.toFixed(0)} description={`Keeps the ${k} most likely.`} />
      <ControlSlider label="Top-p" value={topP} onChange={setTopP} {...TOP_P} formatValue={(v) => v.toFixed(2)} description={`Keeps top tokens up to ${Math.round(topP * PERCENT)}%.`} />
    </div>
  )
}
