// The halo: a soft pulsing ring in the slide's colour on the one control the reader should use next.
// It sits on the slide's main action until the reader has used it once, then on the Next button.
// Only one halo is shown at a time; it is a box-shadow, so it never changes any size.
import { useAppStore } from '../../store/appStore'
import type { ChapterId } from '../chapters'

export const HALO_CLASS = 'halo'

export interface ActionHalo {
  // The class for the main action: the halo while it is unused, nothing after.
  className: string
  // True while the halo is on the main action.
  active: boolean
  // Call when the reader uses the main action.
  used: () => void
}

export function useActionHalo(id: ChapterId): ActionHalo {
  const done = useAppStore((s) => Boolean(s.haloUsed[id]))
  const markHaloUsed = useAppStore((s) => s.markHaloUsed)
  return { className: done ? '' : HALO_CLASS, active: !done, used: () => markHaloUsed(id) }
}

// The class for the Next button: the halo once the main action has been used.
export function useNextHalo(id: ChapterId): string {
  return useAppStore((s) => (s.haloUsed[id] ? HALO_CLASS : ''))
}
