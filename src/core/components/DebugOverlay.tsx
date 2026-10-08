// DebugOverlay - developer panel, toggled from the store with Cmd/Ctrl + Shift + D.
import type { ReactNode } from 'react'
import { useDebug } from '../hooks/useDebug'
import { useAppStore } from '../../store/appStore'
import { selectTokens } from '../../store/selectors'

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd className="m-0 max-w-[12rem] truncate text-ink">{value}</dd>
    </div>
  )
}

export function DebugOverlay() {
  const { debugMode, toggleDebugMode } = useDebug()
  const state = useAppStore()
  if (!debugMode) return null
  return (
    <aside aria-label="Debug state" className="fixed bottom-4 right-4 z-50 w-80 border-2 border-ink bg-paper p-4 text-base">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold">Debug</span>
        <button type="button" onClick={toggleDebugMode} className="min-h-11 px-3 underline">Close</button>
      </div>
      <dl className="m-0 space-y-1">
        <Row label="chapter" value={state.chapterId ?? 'initial'} />
        <Row label="tokens" value={selectTokens(state).length} />
        <Row label="selected token" value={state.selectedTokenIndex ?? 'none'} />
        <Row label="lens" value={state.selectedLens} />
        <Row label="block" value={state.selectedBlock} />
        <Row label="temperature / top-k / top-p" value={`${state.temperature} / ${state.topK} / ${state.topP}`} />
        <Row label="appended pieces" value={state.appended.length} />
        <Row label="known steps" value={Object.keys(state.loopSteps).length} />
        <Row label="calls used" value={state.apiCallsUsed} />
      </dl>
    </aside>
  )
}
