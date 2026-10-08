// Debug mode: Ctrl/Cmd + Shift + D toggles the debug overlay.

import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'

export function useDebug() {
  const debugMode = useAppStore((s) => s.debugMode)
  const toggleDebugMode = useAppStore((s) => s.toggleDebugMode)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        toggleDebugMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleDebugMode])

  return { debugMode, toggleDebugMode }
}
