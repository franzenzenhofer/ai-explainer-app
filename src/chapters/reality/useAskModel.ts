// Asks the live model one question (question-and-answer mode) and keeps the reply and its real tokens.
// A newer question cancels the older one, and leaving the chapter cancels whatever is in flight.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Token } from '../../core/types'
import { generateWithGemini } from '../../services/gemini'

const ANSWER_TOKEN_LIMIT = 50

export type AskStatus = 'idle' | 'asking' | 'answered' | 'failed'

export interface AskState {
  status: AskStatus
  answer: string
  tokens: Token[]
  error: string | null
}

const IDLE: AskState = { status: 'idle', answer: '', tokens: [], error: null }

export function useAskModel() {
  const [state, setState] = useState<AskState>(IDLE)
  const requestRef = useRef(0)

  useEffect(() => () => {
    requestRef.current += 1
  }, [])

  const ask = useCallback(async (question: string) => {
    requestRef.current += 1
    const request = requestRef.current
    setState({ ...IDLE, status: 'asking' })
    const result = await generateWithGemini(question, ANSWER_TOKEN_LIMIT)
    if (request !== requestRef.current) return
    if (result.error) {
      setState({ ...IDLE, status: 'failed', error: result.error })
      return
    }
    setState({ status: 'answered', answer: result.text, tokens: result.tokens, error: null })
  }, [])

  const clear = useCallback(() => {
    requestRef.current += 1
    setState(IDLE)
  }, [])

  return { state, ask, clear }
}
