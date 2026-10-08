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
      className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label htmlFor={CUSTOM_QUESTION_ID} className="text-base font-semibold text-ink">
          Ask your own question
        </label>
        <input
          id={CUSTOM_QUESTION_ID}
          name="customQuestion"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="For example: Who won the 1987 World Cup?"
          disabled={disabled}
          className="min-h-11 w-full rounded-[3px] border-2 border-ink px-3 text-base text-ink placeholder:text-ink-3 disabled:opacity-60"
        />
      </div>
      <Button type="submit" variant="primary" disabled={disabled || !question.trim()}>
        Ask the model
      </Button>
    </form>
  )
}
