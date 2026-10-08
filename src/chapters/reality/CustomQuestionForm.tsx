// Ask your own question; the reply runs through the same live model as the experiments.
import { useState } from 'react'
import { Button } from '../../core/components'

export const CUSTOM_QUESTION_ID = 'custom-question'

interface CustomQuestionFormProps {
  disabled: boolean
  onAsk: (question: string) => void
}

export function CustomQuestionForm({ disabled, onAsk }: CustomQuestionFormProps) {
  const [question, setQuestion] = useState('')
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (question.trim()) onAsk(question.trim())
      }}
      className="flex flex-col gap-1"
    >
      <label htmlFor={CUSTOM_QUESTION_ID} className="text-base font-bold" style={{ color: 'var(--concept-strong)' }}>
        Or ask your own question
      </label>
      <div className="flex gap-2">
        <input
          id={CUSTOM_QUESTION_ID}
          name="customQuestion"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Type a question"
          disabled={disabled}
          className="min-h-11 min-w-0 flex-1 rounded-lg border-2 border-[var(--concept-soft)] bg-paper px-3 text-base text-ink placeholder:text-ink-3 focus:border-[var(--accent)] disabled:opacity-60"
        />
        <Button type="submit" variant="primary" disabled={disabled || !question.trim()}>
          Ask
        </Button>
      </div>
    </form>
  )
}
