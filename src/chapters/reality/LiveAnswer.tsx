// The live answer: the question, the model's reply, the reply as real o200k_base tokens fading in one
// by one, and the reader's verdict.
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { TokenChip, VisualFrame, type Provenance } from '../../core/components'
import type { Token } from '../../core/types'
import { TOKENIZER_SPECS } from '../../core/types'
import type { AskState } from './useAskModel'
import type { Experiment, ReaderChoice } from './experiments'
import { resolveVerdict } from './experiments'
import { RealitySummary } from './RealitySummary'
import { VerdictPanel } from './VerdictPanel'

export const provenance: Provenance = 'real'

interface LiveAnswerProps {
  question: string | null
  experiment: Experiment | undefined
  ask: AskState
  judgement: { choice: ReaderChoice | null; onChoose: (choice: ReaderChoice) => void }
}

function AnswerTokens({ tokens }: { tokens: Token[] }) {
  return (
    <div>
      <p className="m-0 text-base font-bold" style={{ color: 'var(--concept-strong)' }}>
        The same reply as {tokens.length} tokens ({TOKENIZER_SPECS.name}, the tokenizer of the Tokens slide):
      </p>
      <div data-scroll-ok className="mt-1 flex max-h-[5.75rem] flex-wrap gap-1 overflow-y-auto pr-1">
        {tokens.map((token, index) => (
          <TokenChip key={`${index}-${token.tokenId}`} text={token.text} tokenId={token.tokenId} order={index} />
        ))}
      </div>
    </div>
  )
}

const CUSTOM_NOTE = 'This reply is the continuation the model found likely for your question. Whether it is true is for you to check.'

function AnswerBody({ experiment, ask, judgement }: Omit<LiveAnswerProps, 'question'>): ReactNode {
  if (ask.status === 'asking') {
    return (
      <motion.p className="m-0 text-xl font-semibold" style={{ color: 'var(--concept-strong)' }} animate={{ opacity: [0.4, 1] }} transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}>
        Asking the live model...
      </motion.p>
    )
  }
  if (ask.status === 'failed') return <p className="m-0 text-lg font-semibold text-ink">The model did not answer: {ask.error}</p>
  if (ask.status !== 'answered') return null
  const verdict = experiment ? resolveVerdict(experiment, ask.answer, judgement.choice) : null
  const checked = experiment ? resolveVerdict(experiment, ask.answer, null) !== null : false
  return (
    <div className="flex flex-col gap-2">
      <motion.p data-scroll-ok initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="m-0 max-h-[8rem] overflow-y-auto rounded-xl border-l-4 py-1 pl-3 pr-1 text-lg leading-snug text-ink" style={{ borderColor: 'var(--concept)', background: 'var(--concept-tint)' }}>
        {ask.answer}
      </motion.p>
      <AnswerTokens tokens={ask.tokens} />
      {experiment ? (
        <VerdictPanel experiment={experiment} choice={judgement.choice} verdict={verdict} checkedAutomatically={checked} onChoose={judgement.onChoose} />
      ) : (
        <p className="m-0 rounded-xl border-2 p-3 text-base text-ink" style={{ borderColor: 'var(--concept-soft)' }}>{CUSTOM_NOTE}</p>
      )}
    </div>
  )
}

function Waiting() {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div>
        <p className="m-0 text-xl font-bold" style={{ color: 'var(--concept-strong)' }}>Pick an experiment or ask your own question.</p>
        <p className="m-0 text-base text-ink-2">
          A real language model answers live. You see its reply, the same reply cut into tokens, and you judge whether it is right.
        </p>
      </div>
      <RealitySummary />
    </div>
  )
}

export function LiveAnswer({ question, experiment, ask, judgement }: LiveAnswerProps) {
  return (
    <VisualFrame title="Live answer" provenance={provenance} caption="A real language model answers each run, so the same question can get a different reply next time.">
      {question ? (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className="m-0 text-base text-ink-2">
            <span className="font-bold text-ink">Question: </span>
            {question}
          </p>
          <AnswerBody experiment={experiment} ask={ask} judgement={judgement} />
        </div>
      ) : (
        <Waiting />
      )}
    </VisualFrame>
  )
}
