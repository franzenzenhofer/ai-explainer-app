// Slide 1: the token machine, live. Press: a real model picks the next token, the stages light up in
// their colours, the candidates grow as rose bars, the pick is framed amber and flies to the end.
import { useEffect, useRef } from 'react'
import { useActionHalo } from '../../core/hooks/useHalo'
import { useAppStore } from '../../store/appStore'
import { LOOP_MODEL } from '../../core/types'
import { Button, SlideLayout, VisualFrame, type Provenance } from '../../core/components'
import { getChapter } from '../../core/chapters'
import { ChapterLink } from '../../core/navigation/ChapterLink'
import { CandidateColumns } from '../loop/CandidateColumns'
import { CandidateSkeleton } from '../loop/CandidateSkeleton'
import { FlightLayer } from '../loop/FlightLayer'
import { GeneratedText } from '../loop/GeneratedText'
import { GenerationStatus } from '../loop/GenerationStatus'
import { PhaseStrip } from '../loop/PhaseStrip'
import { cancelRun, resetMachine, runPick, useRunStore } from '../loop/runStore'
import { useRunView } from '../loop/useRunView'
import { usePrefetchStep } from '../loop/usePrefetchStep'
import { generationPhase } from '../loop/useGeneration'

export const provenance: Provenance = 'real'

const CAPTION = `Real: ${LOOP_MODEL.name} picks each token and reports the probabilities of its top ${LOOP_MODEL.candidatesPerStep} candidates. One call returns up to ${LOOP_MODEL.stepsPerCall} steps, so most presses need no new call. The lit stages are a depiction: the model ran them on its server.`

function HomeControls() {
  const phase = useAppStore(generationPhase)
  const running = useRunStore((s) => s.stage !== null)
  const halo = useActionHalo('home')
  const pick = () => {
    halo.used()
    void runPick()
  }
  return (
    <div className="flex flex-wrap items-center gap-2" data-primary-control>
      <Button variant="primary" className={halo.className} onClick={pick} disabled={running || phase === 'fetching' || phase === 'limit' || phase === 'ended'}>
        Pick the next token
      </Button>
      <ChapterLink
        chapter={getChapter('tokens')}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-ink/20 bg-paper px-4 text-base font-semibold text-ink no-underline hover:border-ink/50"
      >
        Edit text
      </ChapterLink>
      <Button onClick={resetMachine} disabled={phase === 'empty' || phase === 'fetching'}>Start over</Button>
    </div>
  )
}

function Candidates() {
  const view = useRunView()
  const replaceLastPiece = useAppStore((s) => s.replaceLastPiece)
  const error = useAppStore((s) => (s.fetchStatus === 'error' ? s.fetchError : null))
  if (!view) return <CandidateSkeleton error={error} />
  return <CandidateColumns view={view} onChoose={view.kind === 'added' ? replaceLastPiece : null} />
}

export function HomeChapter() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => cancelRun, [])
  usePrefetchStep()
  return (
    <SlideLayout id="home">
      <VisualFrame title="The token machine, live" provenance={provenance} caption={CAPTION}>
        <div ref={root} className="relative flex min-h-0 flex-1 flex-col gap-1.5">
          <PhaseStrip />
          <GeneratedText className="min-h-[5rem] flex-1" />
          <Candidates />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <HomeControls />
            <GenerationStatus className="m-0 min-w-0 flex-1 text-base text-ink" />
          </div>
          <FlightLayer rootRef={root} />
        </div>
      </VisualFrame>
    </SlideLayout>
  )
}
