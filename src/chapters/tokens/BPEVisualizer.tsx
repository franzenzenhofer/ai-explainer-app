// Byte pair encoding demo: the merges the real o200k_base tokenizer makes, step by step, computed
// from its merge ranks. Start from the bytes, merge the pair with the lowest rank, repeat. Each merge
// is animated: the right half slides into the left one and the new piece lights up.
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useStepAnimation } from '../../core/hooks/useAnimation'
import { TOKENIZER_SPECS } from '../../core/types'
import { tokenColor } from '../../core/colors'
import { Button, ToggleGroup } from '../../core/components/Button'
import { o200kMergeRanks } from '../../model/mergeRanks'
import { bpeSteps, type BpeStep } from './bpeSteps'
import { mergedPosition, pieceId, pieceKeys } from './bpeKeys'

const DEMO_WORDS = ['Großmutter', 'tokenization', 'understanding'] as const
const STEP_INTERVAL_MS = 1100

function stepText(step: BpeStep, index: number, total: number): string {
  if (!step.merge) return `Start from the ${step.pieces.length} bytes of the word. A letter like ß is two bytes, shown as hex.`
  const { left, right, result, rank } = step.merge
  const last = index === total - 1 ? ` No pair left is a token: this is what ${TOKENIZER_SPECS.name} returns.` : ''
  return `Merge ${index}: "${left.label}" + "${right.label}" = "${result.label}" (ID ${rank.toLocaleString('en-US')}; a lower ID was merged earlier).${last}`
}

function Piece({ label, id, fresh }: { label: string; id: number | undefined; fresh: boolean }) {
  const color = tokenColor(label)
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: fresh ? [1.25, 1] : 1 }}
      exit={{ opacity: 0, scale: 0.3, x: -40, transition: { duration: 0.25 } }}
      transition={{ duration: 0.45 }}
      className="inline-flex min-h-12 items-center gap-1 rounded-md border-2 px-2 font-mono text-xl font-semibold"
      style={{ background: color.fill, borderColor: fresh ? 'var(--concept)' : color.border, color: color.text, boxShadow: fresh ? '0 0 0 4px var(--concept-soft)' : undefined }}
    >
      {label}
      {id !== undefined && <span className="text-base font-normal opacity-80">#{id}</span>}
    </motion.span>
  )
}

export function BPEVisualizer() {
  const [word, setWord] = useState<(typeof DEMO_WORDS)[number]>(DEMO_WORDS[0])
  const ranks = o200kMergeRanks()
  const steps = useMemo(() => bpeSteps(word, ranks), [word, ranks])
  const keys = useMemo(() => pieceKeys(steps), [steps])
  const { currentIndex, isComplete, isRunning, start, stop, reset, stepForward } = useStepAnimation(steps, STEP_INTERVAL_MS)
  const shown = Math.max(0, currentIndex)
  const fresh = mergedPosition(steps, shown)
  const running = isRunning && !isComplete
  const playLabel = currentIndex < 0 ? 'Start' : running ? 'Pause' : 'Again'
  const onPlay = () => (running ? stop() : start())

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3" data-bpe>
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup label="Word" options={DEMO_WORDS.map((value) => ({ value, label: value }))} value={word} onChange={(value) => { reset(); setWord(value) }} />
        <span className="mx-1 h-8 w-px bg-rule" aria-hidden="true" />
        <Button variant="primary" onClick={onPlay}>{playLabel}</Button>
        <Button onClick={stepForward} disabled={isComplete || running}>Next merge</Button>
        <Button onClick={reset}>Reset</Button>
      </div>
      <p className="m-0 min-h-[3rem] text-lg text-ink" aria-live="polite">
        {currentIndex < 0 ? `Press Start to follow the real merges of "${word}", from single bytes to the final tokens.` : stepText(steps[shown], shown, steps.length)}
      </p>
      <div className="flex min-h-0 flex-1 flex-wrap content-center items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4" style={{ borderColor: 'var(--concept-soft)', background: 'var(--concept-tint)' }}>
        <AnimatePresence>
          {steps[shown].pieces.map((piece, index) => (
            <Piece key={keys[shown][index]} label={piece.label} id={pieceId(piece, ranks)} fresh={index === fresh} />
          ))}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="text-base font-semibold text-ink-2">Merge {shown} of {steps.length - 1}</span>
        <span className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--concept-soft)' }}>
          <motion.span className="block h-full rounded-full" style={{ background: 'var(--concept)' }} animate={{ width: `${(shown / Math.max(1, steps.length - 1)) * 100}%` }} />
        </span>
      </div>
    </div>
  )
}
