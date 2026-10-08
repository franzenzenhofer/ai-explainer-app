// True for components that are part of the very first render after a page load (the server HTML that
// React hydrates). Those render in their final place with no entrance, so nothing visibly jumps after
// the first paint; components that mount later (a new slide, a user action) animate as usual.
import { useState } from 'react'

let appMounted = false

// Called once by App after hydration.
export function markAppMounted(): void {
  appMounted = true
}

export function useFirstPaint(): boolean {
  const [firstPaint] = useState(() => !appMounted)
  return firstPaint
}
