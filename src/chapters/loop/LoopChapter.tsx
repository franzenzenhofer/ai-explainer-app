// Slide 9: append and repeat. The old generation phase animation, extended: every run lights the
// stages in their colours, the pick flies to the end of the text, with Play, Step, Reset and Speed.
import { useEffect, useRef } from 'react'
import { useActionHalo } from '../../core/hooks/useHalo'
import { useAppStore, MAX_SPEED, MIN_SPEED } from '../../store/appStore'
import { LOOP_MODEL } from '../../core/types'
import { Button, ControlSlider, SlideLayout, VisualFrame, type Provenance } from '../../core/components'
import { CandidateBars, CandidateBarsSkeleton } from './CandidateBars'
import { FlightLayer } from './FlightLayer'
import { GeneratedText } from './GeneratedText'
import { GenerationStatus } from './GenerationStatus'
import { LoopStats } from './LoopStats'
import { PhaseStrip } from './PhaseStrip'
import { TokenStream } from './TokenStream'
import { cancelRun, resetMachine, runPick, useRunStore } from './runStore'
import { generationPhase } from './useGeneration'
import { usePlayback } from './usePlayback'
import { useRunView } from './useRunView'
import { usePrefetchStep } from './usePrefetchStep'

export const provenance: Provenance = 'real'

const SPEED_STEP = 0.25
const CAPTION = `Real: ${LOOP_MODEL.name} output in its own tokens, with its real probabilities. The lit stages are a depiction of one run; the model ran them on its server.`

function LoopControls() {
  usePlayback()
  const isPlaying = useAppStore((s) => s.isPlaying)
  const setIsPlaying = useAppStore((s) => s.setIsPlaying)
  const speed = useAppStore((s) => s.generationSpeed)
  const setSpeed = useAppStore((s) => s.setGenerationSpeed)
  const phase = useAppStore(generationPhase)
  const running = useRunStore((s) => s.stage !== null)
  const done = phase === 'limit' || phase === 'ended'
  const stepBlocked = isPlaying || running || phase === 'fetching' || done
  const halo = useActionHalo('loop')
  const togglePlay = () => {
    halo.used()
    setIsPlaying(!isPlaying)
  }
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2" data-primary-control>
      <div className="flex gap-2">
        <Button variant="primary" onClick={togglePlay} disabled={done} className={`min-w-24 ${halo.className}`}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={() => void runPick()} disabled={stepBlocked}>Step</Button>
        <Button onClick={resetMachine}>Reset</Button>
      </div>
      <div className="w-72 max-w-full">
        <ControlSlider label="Speed" value={speed} onChange={setSpeed} min={MIN_SPEED} max={MAX_SPEED} step={SPEED_STEP} formatValue={(value) => `${value}x`} />
      </div>
    </div>
  )
}

function LatestCandidates() {
  const view = useRunView()
  return (
    <div className="min-w-0">
      <h3 className="m-0 mb-1 text-base font-bold" style={{ color: 'var(--concept-strong)' }}>{view === null ? `${LOOP_MODEL.name} is thinking...` : view.kind === 'next' ? 'What the model predicts next' : 'Latest step: top candidates'}</h3>
      {view ? <CandidateBars view={view} /> : <CandidateBarsSkeleton />}
    </div>
  )
}

export function LoopChapter() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => cancelRun, [])
  usePrefetchStep()
  return (
    <SlideLayout id="loop">
      <VisualFrame title="The text grows one token at a time" provenance={provenance} caption={CAPTION}>
        <div ref={root} className="relative flex min-h-0 flex-1 flex-col gap-2">
          <LoopControls />
          <PhaseStrip />
          <GenerationStatus className="m-0 min-h-6 text-base font-medium text-ink" />
          <GeneratedText className="min-h-20 flex-1" />
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="m-0 text-base font-bold" style={{ color: 'var(--concept-strong)' }}>Token stream</h3>
              <div className="max-h-20 overflow-y-auto">
                <TokenStream />
              </div>
              <LoopStats />
            </div>
            <LatestCandidates />
          </div>
          <FlightLayer rootRef={root} />
        </div>
      </VisualFrame>
    </SlideLayout>
  )
}
