// Stat tiles for the loop: tokens appended so far (one run each), the length of the text the next run
// reads, and the live calls left this visit. All counted, none estimated.
import { useAppStore } from '../../store/appStore'
import { StatTile } from '../../core/components'
import { callsLeft } from './askModel'
import { loopContext } from './useGeneration'

export function LoopStats() {
  const appended = useAppStore((s) => s.appended.length)
  const characters = useAppStore((s) => loopContext(s).length)
  const used = useAppStore((s) => s.apiCallsUsed)
  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Loop counts">
      <StatTile value={appended} label="Tokens added" />
      <StatTile value={characters} label="Characters" />
      <StatTile value={callsLeft(used)} label="Calls left" />
    </div>
  )
}
