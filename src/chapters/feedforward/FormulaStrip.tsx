// The arithmetic of the feed-forward step as four labelled boxes; during a run they light up in green
// one after the other.
import { Fragment } from 'react'
import { cn } from '../../core/utils/cn'

export const FORMULA_STEPS = ['times matrix 1', 'clip at zero', 'times matrix 2', 'add back']

interface FormulaStripProps {
  // The step running now, or null while idle.
  active: number | null
}

export function FormulaStrip({ active }: FormulaStripProps) {
  return (
    <ol className="m-0 flex list-none items-center gap-1 p-0 max-sm:flex-wrap" aria-label="What one feed-forward run does">
      {FORMULA_STEPS.map((label, index) => {
        const lit = active === index
        const passed = active !== null && index < active
        return (
          <Fragment key={label}>
            {index > 0 && <li aria-hidden="true" className="text-lg font-bold max-sm:hidden text-[var(--concept-strong)]">{'→'}</li>}
            <li
              aria-current={lit ? 'step' : undefined}
              className={cn(
                'flex-1 rounded-xl border-2 max-sm:basis-[45%] px-2 py-1 text-center text-base font-semibold leading-tight transition-colors duration-300',
                lit && 'scale-105 border-[var(--concept)] bg-[var(--concept)] text-paper',
                passed && 'border-[var(--concept)] bg-[var(--concept-tint)] text-[var(--concept-strong)]',
                !lit && !passed && 'border-[var(--concept-soft)] bg-paper text-[var(--concept-strong)]',
              )}
            >
              <span className="mr-1 font-bold">{index + 1}</span>
              {label}
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
