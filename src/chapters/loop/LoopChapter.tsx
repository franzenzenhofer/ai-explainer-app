// Chapter 9: append and repeat. The live loop with Play, Step, speed and Reset.
import { useAppStore, MAX_SPEED, MIN_SPEED } from '../../store/appStore'
import { LOOP_MODEL } from '../../core/types'
import { Button, ChapterLayout, ControlSlider, VisualFrame, type Provenance } from '../../core/components'
import { GeneratedText } from './GeneratedText'
import { GenerationStatus } from './GenerationStatus'
import { NextCandidates } from './NextCandidates'
import { TokenStream } from './TokenStream'
import { generationPhase, pickNext, resetLoop } from './useGeneration'
import { usePlayback } from './usePlayback'

export const provenance: Provenance = 'real'

const SPEED_STEP = 0.25

function LoopControls() {
    usePlayback(pickNext)
  const isPlaying = useAppStore((s) => s.isPlaying)
  const setIsPlaying = useAppStore((s) => s.setIsPlaying)
  const speed = useAppStore((s) => s.generationSpeed)
  const setSpeed = useAppStore((s) => s.setGenerationSpeed)
  const phase = useAppStore(generationPhase)
  const busy = phase === 'fetching'
  const done = phase === 'limit' || phase === 'ended'
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[auto_minmax(14rem,20rem)] md:items-end md:justify-between">
      <div className="flex flex-wrap gap-2" data-primary-control>
        <Button variant="primary" onClick={() => setIsPlaying(!isPlaying)} disabled={done} className="max-sm:w-full">
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={() => void pickNext()} disabled={isPlaying || busy || done} className="max-sm:flex-1">
          Step
        </Button>
        <Button onClick={resetLoop} className="max-sm:flex-1">Reset</Button>
      </div>
      <ControlSlider
        label="Speed"
        value={speed}
        onChange={setSpeed}
        min={MIN_SPEED}
        max={MAX_SPEED}
        step={SPEED_STEP}
        formatValue={(value) => `${value}x`}
      />
    </div>
  )
}

export function LoopChapter() {
  const appendedCount = useAppStore((s) => s.appended.length)
  const isPlaying = useAppStore((s) => s.isPlaying)
  return (
    <ChapterLayout id="loop">
      <VisualFrame
        title="The text grows one token at a time"
        provenance={provenance}
        caption={`Real: ${LOOP_MODEL.name} output in its own tokens. ${appendedCount} appended so far: the next run reads the prompt plus all of them.`}
      >
        <GeneratedText />
        <div className="mt-6">
          <GenerationStatus />
        </div>
        <h3 className="m-0 mb-2 mt-6 text-base font-semibold">Appended tokens</h3>
        <TokenStream />
        <NextCandidates interactive={!isPlaying} />
      </VisualFrame>
      <LoopControls />
    </ChapterLayout>
  )
}
