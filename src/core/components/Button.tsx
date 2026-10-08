// Buttons: rectangular, 44px tall at least, 16px text or more.
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export type ButtonVariant = 'primary' | 'secondary'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-ink bg-ink text-paper hover:bg-ink-2 disabled:border-rule-strong disabled:bg-rule-strong',
  secondary: 'border-ink bg-paper text-ink hover:bg-wash disabled:border-rule-strong disabled:text-ink-3',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'secondary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] border-2 px-5 text-base font-semibold transition-colors disabled:cursor-not-allowed',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}

interface ToggleOption<Value extends string> {
  value: Value
  label: string
}

interface ToggleGroupProps<Value extends string> {
  label: string
  options: ToggleOption<Value>[]
  value: Value
  onChange: (value: Value) => void
}

// A row of buttons where one is chosen; the chosen one carries the chapter accent.
export function ToggleGroup<Value extends string>({ label, options, value, onChange }: ToggleGroupProps<Value>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const chosen = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={chosen}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-11 rounded-[3px] border-2 px-4 text-base font-medium transition-colors',
              chosen ? 'tint-accent border-accent text-ink' : 'border-rule bg-paper text-ink-2 hover:border-rule-strong',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
