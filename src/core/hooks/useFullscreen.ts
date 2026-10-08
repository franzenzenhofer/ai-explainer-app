// Whether the page is in browser full screen right now (for the button label).
import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}

export function useIsFullscreen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.fullscreenElement !== null,
    () => false,
  )
}
