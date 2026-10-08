// A labelled range slider with its value shown next to the label; 16px text, 44px tall.
import { useId } from 'react'
import { cn } from '../utils/cn'

interface ControlSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  label: string
  description?: string
  formatValue: (value: number) => string
}

export function ControlSlider({ value, onChange, min, max, step, label, description, formatValue }: ControlSliderProps) {
  const id = useId()
  const descriptionId = useId()
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-base font-semibold text-ink">{label}</label>
        <output htmlFor={id} className="text-lg font-semibold tabular-nums text-ink">{formatValue(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={description ? descriptionId : undefined}
        onChange={(event) => onChange(parseFloat(event.target.value))}
      />
      {description && <p id={descriptionId} className="m-0 text-base text-ink-2">{description}</p>}
    </div>
  )
}

interface ControlPresetsProps {
  label: string
  presets: Array<{ label: string; value: number }>
  currentValue: number
  onChange: (value: number) => void
}

const SAME_VALUE_TOLERANCE = 0.01

export function ControlPresets({ label, presets, currentValue, onChange }: ControlPresetsProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {presets.map((preset) => {
        const active = Math.abs(currentValue - preset.value) < SAME_VALUE_TOLERANCE
        return (
          <button
            key={preset.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(preset.value)}
            className={cn(
              'min-h-11 rounded-[3px] border-2 px-3 text-base font-medium',
              active ? 'tint-accent border-accent text-ink' : 'border-rule text-ink-2 hover:border-rule-strong',
            )}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}
