// Plays the four steps of one feed-forward run one after the other, then calls onDone (which applies
// the run). step is null while idle.
import { useEffect, useRef, useState } from 'react'

export const RUN_STEP_COUNT = 4
const STEP_MS = 420

export function useRunSteps(onDone: () => void) {
  const [step, setStep] = useState<number | null>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])
  useEffect(() => {
    if (step === null) return
    const timer = window.setTimeout(() => {
      if (step < RUN_STEP_COUNT - 1) {
        setStep(step + 1)
        return
      }
      setStep(null)
      done.current()
    }, STEP_MS)
    return () => window.clearTimeout(timer)
  }, [step])
  const start = () => setStep((current) => current ?? 0)
  return { step, start }
}
