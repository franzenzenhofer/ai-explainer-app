// True once the saved prompt, settings and real steps are back from localStorage. Anything that asks the
// live model on its own waits for this, so it never asks about the default text or a text already known.
import { useSyncExternalStore } from 'react'
import { useAppStore } from './appStore'

export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
    () => false,
  )
}
