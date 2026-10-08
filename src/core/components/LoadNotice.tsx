// What a visual shows while its data file loads, and when the load failed. There is no stand-in data.
import type { LoadState } from '../hooks/useLoaded'

interface LoadNoticeProps {
  state: Exclude<LoadState<unknown>, { status: 'ready' }>
  what: string
}

export function LoadNotice({ state, what }: LoadNoticeProps) {
  const text =
    state.status === 'loading'
      ? `Loading ${what}...`
      : `Could not load ${what}: ${state.message}. Reload the page to try again.`
  return (
    <p role="status" className="m-0 min-h-14 text-lg text-ink-2">
      {text}
    </p>
  )
}
