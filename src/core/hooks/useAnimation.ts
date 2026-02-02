// Animation control hook

import { useState, useCallback, useRef, useEffect } from 'react'

interface AnimationState {
  isPlaying: boolean
  progress: number
  speed: number
}

export function useAnimation(duration = 1000) {
  const [state, setState] = useState<AnimationState>({
    isPlaying: false,
    progress: 0,
    speed: 1,
  })

  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedProgressRef = useRef<number>(0)

  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp
    }

    const elapsed = (timestamp - startTimeRef.current) * state.speed
    const progress = Math.min(1, pausedProgressRef.current + elapsed / duration)

    setState((prev) => ({ ...prev, progress }))

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setState((prev) => ({ ...prev, isPlaying: false }))
    }
  }, [duration, state.speed])

  const play = useCallback(() => {
    if (state.isPlaying) return
    startTimeRef.current = 0
    setState((prev) => ({ ...prev, isPlaying: true }))
    animationRef.current = requestAnimationFrame(animate)
  }, [animate, state.isPlaying])

  const pause = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    pausedProgressRef.current = state.progress
    setState((prev) => ({ ...prev, isPlaying: false }))
  }, [state.progress])

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    startTimeRef.current = 0
    pausedProgressRef.current = 0
    setState({ isPlaying: false, progress: 0, speed: state.speed })
  }, [state.speed])

  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }))
  }, [])

  const setProgress = useCallback((progress: number) => {
    pausedProgressRef.current = Math.max(0, Math.min(1, progress))
    setState((prev) => ({ ...prev, progress: pausedProgressRef.current }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return {
    ...state,
    play,
    pause,
    reset,
    setSpeed,
    setProgress,
    toggle: state.isPlaying ? pause : play,
  }
}

// Hook for step-by-step animation
export function useStepAnimation<T>(items: T[], interval = 500) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const start = useCallback(() => {
    setCurrentIndex(0)
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setCurrentIndex(-1)
  }, [stop])

  const stepForward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))
  }, [items.length])

  const stepBackward = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  useEffect(() => {
    if (isRunning && currentIndex < items.length - 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= items.length - 1) {
            setIsRunning(false)
            return prev
          }
          return prev + 1
        })
      }, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, currentIndex, items.length, interval])

  const visibleItems = items.slice(0, Math.max(0, currentIndex + 1))
  const currentItem = currentIndex >= 0 ? items[currentIndex] : null
  const isComplete = currentIndex >= items.length - 1

  return {
    currentIndex,
    currentItem,
    visibleItems,
    isRunning,
    isComplete,
    start,
    stop,
    reset,
    stepForward,
    stepBackward,
  }
}
