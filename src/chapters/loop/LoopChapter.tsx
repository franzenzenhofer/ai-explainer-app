// Chapter 9: append and repeat. The live loop with Play, Step, speed and Reset.
import { useAppStore, MAX_SPEED, MIN_SPEED } from '../../store/appStore'
import { useGeneratedTokens, useTokens } from '../../core/hooks/useDerived'
import { Button, ChapterLayout, ControlSlider, VisualFrame, type Provenance } from '../../core/components'
import { GeneratedText } from './GeneratedText'
import { GenerationStatus } from './GenerationStatus'
import { TokenStream } from './TokenStream'
import { generationPhase, useGeneration } from './useGeneration'
import { usePlayback } from './usePlayback'

export const provenance: Provenance = 'real'

const SPEED_STEP = 0.25

function LoopControls() {
  const { pickNext, reset } = useGeneration()
  usePlayback(pickNext)
  const isPlaying = useAppStore((s) => s.isPlaying)
  const setIsPlaying = useAppStore((s) => s.setIsPlaying)
  const speed = useAppStore((s) => s.generationSpeed)
  const setSpeed = useAppStore((s) => s.setGenerationSpeed)
  const phase = useAppStore(generationPhase)
  const busy = phase === 'fetching'
  const done = phase === 'limit'
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[auto_minmax(14rem,20rem)] md:items-end md:justify-between">
      <div className="flex flex-wrap gap-2" data-primary-control>
        <Button variant="primary" onClick={() => setIsPlaying(!isPlaying)} disabled={done} className="max-sm:w-full">
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={() => void pickNext()} disabled={isPlaying || busy || done} className="max-sm:flex-1">
          Step
        </Button>
        <Button onClick={reset} className="max-sm:flex-1">Reset</Button>
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
  const prompt = useTokens()
  const generated = useGeneratedTokens()
  return (
    <ChapterLayout id="loop">
      <VisualFrame
        title="The text grows one token at a time"
        provenance={provenance}
        caption={`Real model output, cut into real o200k_base tokens. ${prompt.length} tokens in, ${generated.length} appended: the next run reads ${prompt.length + generated.length} tokens.`}
      >
        <GeneratedText />
        <div className="mt-6">
          <GenerationStatus />
        </div>
        <h3 className="m-0 mb-2 mt-6 text-base font-semibold">Appended tokens</h3>
        <TokenStream />
      </VisualFrame>
      <LoopControls />
    </ChapterLayout>
  )
}
