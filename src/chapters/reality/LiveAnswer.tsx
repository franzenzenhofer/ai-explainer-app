// The live answer: the question, the model's reply, the reply as real tokens, and the reader's verdict.
import type { ReactNode } from 'react'
import { VisualFrame, type Provenance } from '../../core/components'
import type { Token } from '../../core/types'
import { formatTokenDisplay } from '../../core/utils/formatters'
import type { AskState } from './useAskModel'
import type { Experiment, ReaderChoice } from './experiments'
import { resolveVerdict } from './experiments'
import { VerdictPanel } from './VerdictPanel'

export const provenance: Provenance = 'real'

const SHOWN_TOKENS = 40

interface LiveAnswerProps {
  question: string | null
  experiment: Experiment | undefined
  ask: AskState
  judgement: { choice: ReaderChoice | null; onChoose: (choice: ReaderChoice) => void }
}

function AnswerTokens({ tokens }: { tokens: Token[] }) {
  const hidden = tokens.length - SHOWN_TOKENS
  return (
    <div>
      <p className="m-0 text-base text-ink-2">The same reply as {tokens.length} real tokens (a dot is a space):</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {tokens.slice(0, SHOWN_TOKENS).map((token, index) => (
          <span key={index} className="border-b-4 border-ink px-1 text-base text-ink odd:border-rule-strong">
            {formatTokenDisplay(token.text)}
          </span>
        ))}
        {hidden > 0 && <span className="px-1 text-base text-ink-2">and {hidden} more</span>}
      </div>
    </div>
  )
}

function CustomNote() {
  return (
    <p className="m-0 rounded-[3px] border-2 border-ink p-4 text-base text-ink">
      This reply is the continuation the model found likely for your question. Whether it is true is for you to check.
    </p>
  )
}

function AnswerBody({ experiment, ask, judgement }: Omit<LiveAnswerProps, 'question'>): ReactNode {
  if (ask.status === 'asking') return <p className="m-0 text-lg text-ink-2">Asking the model...</p>
  if (ask.status === 'failed') return <p className="m-0 text-lg font-semibold text-ink">The model did not answer: {ask.error}</p>
  if (ask.status !== 'answered') return null
  const verdict = experiment ? resolveVerdict(experiment, ask.answer, judgement.choice) : null
  const checked = experiment ? resolveVerdict(experiment, ask.answer, null) !== null : false
  return (
    <div className="space-y-6">
      <p className="m-0 max-w-prose font-serif text-xl leading-relaxed text-ink">{ask.answer}</p>
      <AnswerTokens tokens={ask.tokens} />
      {experiment ? (
        <VerdictPanel
          experiment={experiment}
          choice={judgement.choice}
          verdict={verdict}
          checkedAutomatically={checked}
          onChoose={judgement.onChoose}
        />
      ) : (
        <CustomNote />
      )}
    </div>
  )
}

export function LiveAnswer({ question, experiment, ask, judgement }: LiveAnswerProps) {
  return (
    <VisualFrame
      title="Live answer"
      provenance={provenance}
      caption="A real language model answers each run, so the same question can get a different reply next time."
    >
      {question ? (
        <div className="space-y-4" aria-live="polite">
          <div>
            <p className="m-0 text-base font-semibold text-ink-2">Question</p>
            <p className="m-0 text-lg text-ink">{question}</p>
          </div>
          <AnswerBody experiment={experiment} ask={ask} judgement={judgement} />
        </div>
      ) : (
        <p className="m-0 text-lg text-ink-2">Pick an experiment below or ask your own question.</p>
      )}
    </VisualFrame>
  )
}
