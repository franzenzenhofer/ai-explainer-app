// Debug mode hook for development

import { useCallback, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'

export function useDebug() {
  const debugMode = useAppStore((s) => s.debugMode)
  const toggleDebugMode = useAppStore((s) => s.toggleDebugMode)

  // Keyboard shortcut: Ctrl/Cmd + Shift + D to toggle debug mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggleDebugMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleDebugMode])

  // Conditional logging
  const log = useCallback((message: string, data?: unknown) => {
    if (debugMode || import.meta.env.DEV) {
      console.log(`[AI-Explainer] ${message}`, data ?? '')
    }
  }, [debugMode])

  const warn = useCallback((message: string, data?: unknown) => {
    if (debugMode || import.meta.env.DEV) {
      console.warn(`[AI-Explainer] ${message}`, data ?? '')
    }
  }, [debugMode])

  const error = useCallback((message: string, data?: unknown) => {
    // Always log errors
    console.error(`[AI-Explainer] ${message}`, data ?? '')
  }, [])

  return {
    debugMode,
    toggleDebugMode,
    log,
    warn,
    error,
  }
}
