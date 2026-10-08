// Buttons: rectangular, 44px tall at least, 16px text or more.
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export type ButtonVariant = 'primary' | 'secondary'

// Primary buttons are filled in the slide's concept colour; secondary ones are white.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-[var(--accent)] bg-[var(--accent)] text-paper hover:opacity-90 disabled:border-rule-strong disabled:bg-rule-strong',
  secondary: 'border-ink/20 bg-paper text-ink hover:border-ink/50 disabled:border-rule disabled:text-ink-3',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'secondary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 px-4 text-base font-semibold transition-colors disabled:cursor-not-allowed',
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

// A row of buttons where one is chosen; the chosen one is filled in the slide's colour.
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
              'min-h-11 rounded-lg border-2 px-3 text-base font-semibold transition-colors',
              chosen ? 'border-[var(--accent)] bg-[var(--accent)] text-paper' : 'border-ink/15 bg-paper text-ink-2 hover:border-ink/40',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
