// Play mode for the Loop slide: starts the next animated run a short pause after the last one ended,
// until the model stops, the demo limit is reached or a call fails. The pause shrinks with speed.
import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { generationPhase } from './useGeneration'
import { runPick, useRunStore } from './runStore'

// Pause between two runs at 1x speed.
const PAUSE_MS = 450

export function usePlayback() {
  const isPlaying = useAppStore((s) => s.isPlaying)
  const speed = useAppStore((s) => s.generationSpeed)
  const appendedCount = useAppStore((s) => s.appended.length)
  const phase = useAppStore(generationPhase)
  const setIsPlaying = useAppStore((s) => s.setIsPlaying)
  const running = useRunStore((s) => s.stage !== null)

  useEffect(() => {
    if (!isPlaying) return
    if (phase === 'limit' || phase === 'ended' || phase === 'error') {
      setIsPlaying(false)
      return
    }
    if (phase === 'fetching' || running) return
    const timer = window.setTimeout(() => void runPick(), PAUSE_MS / speed)
    return () => window.clearTimeout(timer)
  }, [isPlaying, phase, appendedCount, speed, running, setIsPlaying])
}
