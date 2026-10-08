// Runs an async loader once when the component mounts and reports loading, ready or error.
import { useEffect, useState } from 'react'

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; value: T }
  | { status: 'error'; message: string }

export function useLoaded<T>(load: () => Promise<T>): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' })
  useEffect(() => {
    let active = true
    load().then(
      (value) => active && setState({ status: 'ready', value }),
      (error: unknown) => active && setState({ status: 'error', message: error instanceof Error ? error.message : String(error) }),
    )
    return () => {
      active = false
    }
  }, [load])
  return state
}
