// Chapter 10: what this means. Experiments with a live model; the reader judges every answer.
import { useCallback, useRef, useState } from 'react'
import { Button, SlideLayout } from '../../core/components'
import { CUSTOM_QUESTION_ID, CustomQuestionForm } from './CustomQuestionForm'
import { ExperimentPicker } from './ExperimentPicker'
import { LiveAnswer } from './LiveAnswer'
import { RealitySummary } from './RealitySummary'
import { findExperiment, type ReaderChoice } from './experiments'
import { useAskModel } from './useAskModel'

interface Run {
  question: string
  experimentId: string | null
}

export function RealityChapter() {
  const { state, ask, clear } = useAskModel()
  const [run, setRun] = useState<Run | null>(null)
  const [choice, setChoice] = useState<ReaderChoice | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const asking = state.status === 'asking'

  const start = useCallback((next: Run) => {
    setRun(next)
    setChoice(null)
    void ask(next.question)
  }, [ask])

  const pickExperiment = (id: string) => {
    const experiment = findExperiment(id)
    if (experiment) start({ question: experiment.question, experimentId: id })
  }

  const anotherExperiment = () => {
    clear()
    setRun(null)
    pickerRef.current?.scrollIntoView({ block: 'center' })
    pickerRef.current?.querySelector('button')?.focus()
  }

  return (
    <SlideLayout id="reality" drawerExtra={<RealitySummary />}>
      <LiveAnswer
        question={run?.question ?? null}
        experiment={findExperiment(run?.experimentId ?? null)}
        ask={state}
        judgement={{ choice, onChoose: setChoice }}
      />
      {run && !asking && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => start(run)}>Run again</Button>
          <Button onClick={anotherExperiment}>Another experiment</Button>
          <Button onClick={() => document.getElementById(CUSTOM_QUESTION_ID)?.focus()}>Ask your own</Button>
        </div>
      )}
      <div ref={pickerRef} className="mt-10" data-primary-control>
        <h2 className="m-0 mb-3 text-lg font-semibold text-ink">Experiments</h2>
        <ExperimentPicker selectedId={run?.experimentId ?? null} disabled={asking} onPick={pickExperiment} />
      </div>
      <div className="mt-8">
        <CustomQuestionForm disabled={asking} onAsk={(question) => start({ question, experimentId: null })} />
      </div>
    </SlideLayout>
  )
}
