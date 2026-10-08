// A live slide never opens empty: when the model has no step for the text so far as the slide opens,
// ask once (one live call, which also returns the next steps), so the candidates are on screen before
// the first press. Only on opening: later new texts are asked about on the next press, as before.
import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { askModel } from './askModel'
import { loopContext } from './useGeneration'

export function usePrefetchStep() {
  useEffect(() => {
    const state = useAppStore.getState()
    const context = loopContext(state)
    if (state.fetchStatus !== 'idle' || state.loopSteps[context] || context.trim() === '') return
    void askModel(context)
  }, [])
}
