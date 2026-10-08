// Step-by-step animation hook

import { useState, useCallback, useRef, useEffect } from 'react'

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
