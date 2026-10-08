// Play mode for the Loop chapter: picks the next token on a timer until the model stops or the demo limit is reached.
import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { generationPhase } from './useGeneration'

// Time between two picks at 1x speed.
const BASE_INTERVAL_MS = 900

export function usePlayback(pickNext: () => Promise<void>) {
  const isPlaying = useAppStore((s) => s.isPlaying)
  const speed = useAppStore((s) => s.generationSpeed)
  const appendedCount = useAppStore((s) => s.appended.length)
  const phase = useAppStore(generationPhase)
  const setIsPlaying = useAppStore((s) => s.setIsPlaying)

  useEffect(() => {
    if (!isPlaying) return
    if (phase === 'limit' || phase === 'ended' || phase === 'error') {
      setIsPlaying(false)
      return
    }
    if (phase === 'fetching') return
    const timer = window.setTimeout(() => void pickNext(), BASE_INTERVAL_MS / speed)
    return () => window.clearTimeout(timer)
  }, [isPlaying, phase, appendedCount, speed, pickNext, setIsPlaying])
}
