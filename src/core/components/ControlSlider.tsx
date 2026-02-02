// ControlSlider - Unified slider component for interactive controls
import { useId } from 'react'
import { cn } from '../utils/cn'

interface ControlSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label: string
  description?: string
  formatValue?: (value: number) => string
  accentColor?: string
  disabled?: boolean
  className?: string
}

export function ControlSlider({
  value,
  onChange,
  min,
  max,
  step = 0.1,
  label,
  description,
  formatValue = (v) => v.toFixed(1),
  accentColor = 'hsl(220, 90%, 56%)',
  disabled = false,
  className,
}: ControlSliderProps) {
  const id = useId()
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium',
            disabled ? 'text-slate-400' : 'text-slate-700'
          )}
        >
          {label}
        </label>
        <span
          className={cn(
            'rounded-md bg-slate-100 px-2 py-0.5 font-mono text-sm',
            disabled ? 'text-slate-400' : 'text-slate-900'
          )}
        >
          {formatValue(value)}
        </span>
      </div>

      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className={cn(
            'w-full appearance-none bg-transparent cursor-pointer',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Track styles
            '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full',
            '[&::-webkit-slider-runnable-track]:bg-slate-200',
            // Thumb styles
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:-mt-1',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
            // Firefox
            '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full',
            '[&::-moz-range-track]:bg-slate-200',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-0'
          )}
          style={{
            // Filled portion of track
            background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${percentage}%, transparent ${percentage}%, transparent 100%)`,
          }}
        />
        {/* Progress fill overlay */}
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>

      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
    </div>
  )
}

// Preset buttons for quick value selection
interface ControlPresetsProps {
  presets: Array<{ label: string; value: number }>
  currentValue: number
  onChange: (value: number) => void
  accentColor?: string
  className?: string
}

export function ControlPresets({
  presets,
  currentValue,
  onChange,
  accentColor = 'hsl(220, 90%, 56%)',
  className,
}: ControlPresetsProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {presets.map(({ label, value }) => {
        const isActive = Math.abs(currentValue - value) < 0.01
        return (
          <button
            key={label}
            onClick={() => onChange(value)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-all',
              'border',
              isActive
                ? 'border-current text-current'
                : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700'
            )}
            style={isActive ? { color: accentColor, borderColor: accentColor } : undefined}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
