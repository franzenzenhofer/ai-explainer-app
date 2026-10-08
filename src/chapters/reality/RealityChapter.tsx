// Slide 10: what this means. Experiments with a live model; the reader judges every answer. The old
// "HYPE vs REALITY" list, rewritten without overstatement, fills the answer frame until a question runs.
import { useCallback, useState } from 'react'
import { Button, SlideLayout } from '../../core/components'
import { CustomQuestionForm } from './CustomQuestionForm'
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
  const { state, ask } = useAskModel()
  const [run, setRun] = useState<Run | null>(null)
  const [choice, setChoice] = useState<ReaderChoice | null>(null)
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

  return (
    <SlideLayout id="reality" drawerExtra={<RealitySummary />}>
      <div className="flow-stack grid min-h-0 flex-1 grid-cols-[17rem_minmax(0,1fr)] gap-3">
        <div className="flex min-h-0 flex-col gap-3 rounded-2xl border-2 bg-paper/80 p-3" style={{ borderColor: 'var(--concept-soft)' }}>
          <div data-primary-control className="flex flex-col gap-1">
            <h2 className="m-0 text-base font-bold" style={{ color: 'var(--concept-strong)' }}>Run an experiment</h2>
            <ExperimentPicker selectedId={run?.experimentId ?? null} disabled={asking} onPick={pickExperiment} />
            {run && !asking && <Button onClick={() => start(run)} className="mt-1">Run again</Button>}
          </div>
          <CustomQuestionForm disabled={asking} onAsk={(question) => start({ question, experimentId: null })} />
        </div>
        <LiveAnswer question={run?.question ?? null} experiment={findExperiment(run?.experimentId ?? null)} ask={state} judgement={{ choice, onChoose: setChoice }} />
      </div>
    </SlideLayout>
  )
}
