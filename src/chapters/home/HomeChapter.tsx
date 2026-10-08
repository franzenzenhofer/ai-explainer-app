// Chapter 1: the token machine, live. Press, a real model continues the text, one token joins the end.
import { useAppStore } from '../../store/appStore'
import { Button, ChapterLayout, VisualFrame, type Provenance } from '../../core/components'
import { getChapter } from '../../core/chapters'
import { ChapterLink } from '../../core/navigation/ChapterLink'
import { GeneratedText } from '../loop/GeneratedText'
import { GenerationStatus } from '../loop/GenerationStatus'
import { generationPhase, useGeneration } from '../loop/useGeneration'
import { LoopDiagram } from './LoopDiagram'

export const provenance: Provenance = 'real'

function HomeControls() {
  const { pickNext, reset } = useGeneration()
  const phase = useAppStore(generationPhase)
  return (
    <div className="mt-6 flex flex-wrap gap-2" data-primary-control>
      <Button
        variant="primary"
        onClick={() => void pickNext()}
        disabled={phase === 'fetching' || phase === 'limit'}
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
        <Button onClick={reset} className="max-sm:flex-1">Start over</Button>
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
        caption="Real model output: one call returns the whole continuation, each press shows its next token."
      >
        <GeneratedText />
        <div className="mt-6 border-t border-rule pt-4">
          <h3 className="m-0 text-base font-semibold">What could come next</h3>
          <p className="m-0 mt-1 text-base text-ink-2">
            Candidates are not available for this model: it does not report its probabilities.{' '}
            <ChapterLink chapter={getChapter('scores')} className="text-ink underline underline-offset-4">
              See what such a list looks like
            </ChapterLink>
            .
          </p>
        </div>
        <div className="mt-4">
          <GenerationStatus />
        </div>
      </VisualFrame>
      <HomeControls />
      <LoopDiagram />
    </ChapterLayout>
  )
}
