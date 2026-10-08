// Chapter 1: the token machine, live. Press, a real model picks the next token and it joins the text.
import { useAppStore } from '../../store/appStore'
import { LOOP_MODEL } from '../../core/types'
import { Button, ChapterLayout, VisualFrame, type Provenance } from '../../core/components'
import { getChapter } from '../../core/chapters'
import { ChapterLink } from '../../core/navigation/ChapterLink'
import { GeneratedText } from '../loop/GeneratedText'
import { GenerationStatus } from '../loop/GenerationStatus'
import { NextCandidates } from '../loop/NextCandidates'
import { generationPhase, pickNext, resetLoop } from '../loop/useGeneration'
import { LoopDiagram } from './LoopDiagram'

export const provenance: Provenance = 'real'

function HomeControls() {
    const phase = useAppStore(generationPhase)
  return (
    <div className="mt-6 flex flex-wrap gap-2" data-primary-control>
      <Button
        variant="primary"
        onClick={() => void pickNext()}
        disabled={phase === 'fetching' || phase === 'limit' || phase === 'ended'}
        className="max-sm:w-full"
      >
        Pick the next token
      </Button>
      <ChapterLink
        chapter={getChapter('tokens')}
        className="inline-flex min-h-11 items-center justify-center rounded-[3px] border-2 border-ink px-5 text-base font-semibold text-ink no-underline hover:bg-wash max-sm:flex-1"
      >
        Edit text
      </ChapterLink>
      {phase !== 'empty' && (
        <Button onClick={resetLoop} className="max-sm:flex-1">Start over</Button>
      )}
    </div>
  )
}

export function HomeChapter() {
  return (
    <ChapterLayout id="home">
      <VisualFrame
        title="Text so far"
        provenance={provenance}
        caption={`Real: ${LOOP_MODEL.name} picks each token and reports the probabilities of its top ${LOOP_MODEL.candidatesPerStep} candidates. One call returns up to ${LOOP_MODEL.stepsPerCall} steps, so most presses need no new call.`}
      >
        <GeneratedText />
        <NextCandidates interactive />
        <div className="mt-4">
          <GenerationStatus />
        </div>
      </VisualFrame>
      <HomeControls />
      <LoopDiagram />
    </ChapterLayout>
  )
}
