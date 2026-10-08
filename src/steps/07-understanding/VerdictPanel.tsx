// VerdictPanel - the reader judges the live reply, then sees a note that matches the verdict
import { motion } from 'motion/react'
import type { Experiment, ReaderChoice, Verdict } from './experiments'

const CHOICES: Array<{ choice: ReaderChoice; label: string }> = [
  { choice: 'yes', label: 'Yes' },
  { choice: 'no', label: 'No' },
  { choice: 'unsure', label: 'Not sure' },
]

const VERDICT_STYLE: Record<Verdict, string> = {
  sound: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  unsound: 'border-red-200 bg-red-50 text-red-900',
  unsure: 'border-slate-200 bg-slate-50 text-slate-800',
}

interface VerdictPanelProps {
  experiment: Experiment
  choice: ReaderChoice | null
  verdict: Verdict | null
  checkedAutomatically: boolean
  onChoose: (choice: ReaderChoice) => void
}

export function VerdictPanel({ experiment, choice, verdict, checkedAutomatically, onChoose }: VerdictPanelProps) {
  return (
    <div className="space-y-2">
      {experiment.hint && <p className="text-sm text-slate-600">{experiment.hint}</p>}

      {checkedAutomatically ? (
        <p className="text-sm font-medium text-emerald-800">
          Checked against the arithmetic: the reply contains the correct product.
        </p>
      ) : (
        <fieldset>
          <legend className="text-sm font-medium text-slate-800">{experiment.judgeQuestion}</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {CHOICES.map((option) => (
              <button
                key={option.choice}
                type="button"
                onClick={() => onChoose(option.choice)}
                aria-pressed={choice === option.choice}
                className={`min-h-[44px] min-w-[44px] rounded-lg border px-4 text-base font-medium transition-colors ${
                  choice === option.choice
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {verdict && (
        <motion.div
          className={`rounded-lg border p-3 text-base ${VERDICT_STYLE[verdict]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="status"
        >
          {experiment.notes[verdict]}
        </motion.div>
      )}
    </div>
  )
}
