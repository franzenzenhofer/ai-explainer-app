// Runs the "Pick 5 times" roll: five real weighted rolls over the kept list, played back frame by
// frame (or shown at once when the reader asks for reduced motion).
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { PredictionCandidate } from '../../core/types'
import { sampleMany } from '../../model/sampling'
import { rollTimeline, type RollFrame } from './rollTimeline'

export const PICKS_PER_ROLL = 5
const FRAME_MS = 80

interface Roll {
  round: number
  picks: PredictionCandidate[]
  frames: RollFrame[]
}

const IDLE_FRAME: RollFrame = { highlight: null, landed: false, shown: 0 }

export function useRoll(kept: PredictionCandidate[]) {
  const reduce = useReducedMotion()
  const [roll, setRoll] = useState<Roll | null>(null)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!roll || frame >= roll.frames.length) return
    const timer = window.setTimeout(() => setFrame((value) => value + 1), FRAME_MS)
    return () => window.clearTimeout(timer)
  }, [roll, frame])

  const start = () => {
    const picks = sampleMany(kept, PICKS_PER_ROLL)
    const frames = rollTimeline(kept.map((candidate) => candidate.token), picks.map((pick) => pick.token))
    setRoll((previous) => ({ round: (previous?.round ?? 0) + 1, picks, frames }))
    setFrame(reduce ? frames.length : 0)
  }

  const done = !roll || frame >= roll.frames.length
  const current = done ? { highlight: null, landed: false, shown: roll?.picks.length ?? 0 } : (roll.frames[frame] ?? IDLE_FRAME)
  return { roll, current, rolling: !done, start }
}
