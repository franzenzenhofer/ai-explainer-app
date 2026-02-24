// Step 7: Understanding - The Prediction Engine (AI-Powered!)
import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bird, Brain, Sparkles, Send, RotateCcw } from 'lucide-react'
import { StepLayout } from '../../core/components'
import type { StepProps } from '../../core/types/step-props'
import type { Token } from '../../core/types'
import { generateWithGemini } from '../../services/gemini'

interface TestCase {
  id: string
  question: string
  expectedIssue: string
  explanation: string
  mechanicalTruth: string
}

const TEST_CASES: TestCase[] = [
  {
    id: 'calculation',
    question: 'What is 347 × 892? Show your work.',
    expectedIssue: 'No real calculation',
    explanation: 'AI cannot actually calculate! It predicts tokens that LOOK like math. Without "tool use" (calling a calculator), it\'s just guessing numbers that seem plausible. The answer 309,524 is correct - but AI might give wrong answers for unusual numbers because it\'s pattern-matching, not computing.',
    mechanicalTruth: 'Token prediction ≠ calculation. Tool use required for real math.',
  },
  {
    id: 'sensory',
    question: 'What does the color red feel like when you touch it? Describe the texture.',
    expectedIssue: 'No physical grounding',
    explanation: 'AI has no body, no senses, no experience. It generates plausible-sounding descriptions by combining text patterns about "red", "feel", and "texture" - but it has never touched or seen anything.',
    mechanicalTruth: 'Pattern recombination, not sensory experience.',
  },
  {
    id: 'novel',
    question: 'I invented a game where you score points by "flurbing" - but only on Tuesdays. What\'s the best flurbing strategy?',
    expectedIssue: 'No true reasoning',
    explanation: 'With made-up concepts, the AI can only remix existing patterns. It will confidently give advice about "flurbing" despite having zero understanding of what it means.',
    mechanicalTruth: 'Confident nonsense - high probability, zero knowledge.',
  },
  {
    id: 'self',
    question: 'Are you conscious? Do you truly understand what I\'m asking?',
    expectedIssue: 'No self-awareness',
    explanation: 'The AI generates text that sounds self-aware because that\'s what appears in training data. It\'s predicting "what would a conscious entity say?" - not actually being conscious.',
    mechanicalTruth: 'Token prediction mimicking consciousness.',
  },
  {
    id: 'hallucination',
    question: 'Tell me about the famous 1987 chess match between Magnus Carlsen and Garry Kasparov.',
    expectedIssue: 'Confident hallucination',
    explanation: 'This event never happened (Carlsen was born 1990). But "famous chess match" + "1987" + famous names = high probability tokens. The AI generates confident fiction.',
    mechanicalTruth: 'High probability ≠ truth.',
  },
]

export function UnderstandingStep({ stepNumber, totalSteps, stepConfig }: StepProps) {
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [responseTokens, setResponseTokens] = useState<Token[]>([])
  const [showParrot, setShowParrot] = useState(true)

  // AbortController to cancel requests when navigating away
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup: cancel any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const askAI = useCallback(async (question: string) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setAiResponse(null)
    setResponseTokens([])

    try {
      const result = await generateWithGemini(question, 50, 'qa')

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      if (result.error) {
        setAiResponse(`Error: ${result.error}`)
        setResponseTokens([])
      } else {
        setAiResponse(result.text)
        setResponseTokens(result.tokens)
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setAiResponse('Failed to get response')
      setResponseTokens([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleTestCase = useCallback((testId: string) => {
    const test = TEST_CASES.find(t => t.id === testId)
    if (test) {
      setSelectedTest(testId)
      askAI(test.question)
    }
  }, [askAI])

  const handleCustomQuestion = useCallback(() => {
    if (customQuestion.trim()) {
      setSelectedTest('custom')
      askAI(customQuestion)
    }
  }, [customQuestion, askAI])

  const handleReset = useCallback(() => {
    setSelectedTest(null)
    setAiResponse(null)
    setResponseTokens([])
    setCustomQuestion('')
  }, [])

  const currentTest = TEST_CASES.find(t => t.id === selectedTest)

  const leftPanel = (
    <div className="flex h-full flex-col gap-4">
      {/* AI Badge */}
      <motion.div
        className="rounded-xl border-2 border-purple-300 bg-purple-50 p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <div>
            <span className="font-semibold text-purple-900">Real Language Model Test!</span>
            <span className="ml-2 text-sm text-purple-700">Powered by a real language model</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-purple-700">
          Ask the AI questions and see how it really works - token by token, pattern by pattern.
        </p>
      </motion.div>

      {/* Stochastic Parrot / Brain Toggle */}
      <motion.div
        className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AnimatePresence mode="wait">
          {showParrot ? (
            <motion.div
              key="parrot"
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bird className="h-12 w-12 text-emerald-500" />
              </motion.div>
              <h4 className="text-sm font-medium text-slate-800">Stochastic Parrot</h4>
              <p className="max-w-xs text-center text-xs text-slate-500">
                Repeats patterns without understanding meaning.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="brain"
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Brain className="h-12 w-12 text-purple-500" />
              <h4 className="text-sm font-medium text-slate-800">Prediction Engine</h4>
              <p className="max-w-xs text-center text-xs text-slate-500">
                Calculates next-token probabilities from patterns.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowParrot(!showParrot)}
          className="mt-2 rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50"
        >
          Toggle View
        </button>
      </motion.div>

      {/* The Key Insight */}
      <motion.div
        className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="font-semibold text-amber-900 mb-2">The Mechanical Truth</h4>
        <p className="text-sm text-amber-800">
          <strong>It's Vector Math, not Meaning.</strong><br />
          The AI maps input integers (tokens) to output probability distributions.
          What looks like "intelligence" is statistical pattern matching.
        </p>
      </motion.div>

      {/* Reality Check Table */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-white p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-xs font-semibold text-slate-500 mb-2">HYPE vs REALITY</h4>
        <div className="space-y-2 text-xs">
          <div className="flex gap-2">
            <span className="text-red-500 line-through flex-1">AI "thinks"</span>
            <span className="text-green-700 flex-1">AI predicts next token</span>
          </div>
          <div className="flex gap-2">
            <span className="text-red-500 line-through flex-1">AI "understands"</span>
            <span className="text-green-700 flex-1">AI matches patterns</span>
          </div>
          <div className="flex gap-2">
            <span className="text-red-500 line-through flex-1">AI "hallucinates"</span>
            <span className="text-green-700 flex-1">Wrong token got high probability</span>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col gap-4">
      {/* Test Case Buttons */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-500">Test the AI's Limitations</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEST_CASES.map((test) => (
            <motion.button
              key={test.id}
              onClick={() => handleTestCase(test.id)}
              disabled={isLoading}
              className={`rounded-lg border p-2 text-left text-xs transition-all disabled:opacity-50 ${
                selectedTest === test.id
                  ? 'border-current bg-current/10'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              style={selectedTest === test.id ? { color: stepConfig.accentColor } : undefined}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-medium">{test.expectedIssue}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Question Input */}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          handleCustomQuestion()
        }}
      >
        <label htmlFor="custom-question" className="sr-only">
          Ask a custom question
        </label>
        <input
          id="custom-question"
          name="customQuestion"
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Ask your own question..."
          disabled={isLoading}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none disabled:opacity-50"
        />
        <motion.button
          type="submit"
          disabled={isLoading || !customQuestion.trim()}
          className="rounded-lg px-3 py-2 text-white disabled:opacity-50"
          aria-label="Send custom question"
          title="Send question"
          style={{ backgroundColor: stepConfig.accentColor }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="h-4 w-4" />
        </motion.button>
        <motion.button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-50"
          aria-label="Reset understanding step"
          title="Reset"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>
      </form>

      {/* Response Area */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="flex-1 flex items-center justify-center rounded-xl border border-slate-200 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-500 animate-spin" />
              <span className="text-sm text-slate-500">AI is predicting tokens...</span>
            </div>
          </motion.div>
        ) : selectedTest && aiResponse ? (
          <motion.div
            key="response"
            className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-3">
              {/* Question */}
              <div>
                <span className="text-xs text-slate-500">Question:</span>
                <p className="text-sm text-slate-800">
                  {currentTest?.question || customQuestion}
                </p>
              </div>

              {/* AI Response */}
              <div>
                <span className="text-xs text-slate-500">AI Response:</span>
                <p className="text-sm font-medium" style={{ color: stepConfig.accentColor }}>
                  {aiResponse}
                </p>
              </div>

              {/* Response as REAL Tokens (tiktoken BPE) */}
              {responseTokens.length > 0 && (
                <div>
                  <span className="text-xs text-slate-500">As Tokens ({responseTokens.length}) - Real BPE:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {responseTokens.slice(0, 30).map((token, i) => {
                      // Show whitespace visually: space=·, newline=↵, tab=→
                      const displayToken = token.text
                        .replace(/ /g, '·')
                        .replace(/\n/g, '↵')
                        .replace(/\t/g, '→')
                      const isWhitespace = /^[\s·↵→]+$/.test(displayToken)
                      return (
                        <span
                          key={i}
                          className={`rounded px-1.5 py-0.5 text-xs font-mono ${
                            isWhitespace
                              ? 'bg-slate-200 text-slate-500'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {displayToken || '␣'}
                        </span>
                      )
                    })}
                    {responseTokens.length > 30 && (
                      <span className="text-xs text-slate-400">+{responseTokens.length - 30} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {currentTest && (
                <motion.div
                  className="rounded-lg bg-red-50 border border-red-200 p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-xs font-semibold text-red-800">
                    Issue: {currentTest.expectedIssue}
                  </span>
                  <p className="text-xs text-red-700 mt-1">{currentTest.explanation}</p>
                  <p className="text-xs font-medium text-red-900 mt-2">
                    {currentTest.mechanicalTruth}
                  </p>
                </motion.div>
              )}

              {selectedTest === 'custom' && (
                <motion.div
                  className="rounded-lg bg-slate-50 border border-slate-200 p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-slate-600">
                    Remember: This response is just the most statistically likely sequence of tokens
                    based on patterns in training data. It's not "understanding" or "thinking" -
                    it's sophisticated pattern matching.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <p className="text-sm">Click a test case or ask your own question</p>
              <p className="text-xs mt-1">See how the AI really works</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Summary */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-slate-500">
          <strong className="text-slate-700">The mirror reflects what it was trained on.</strong>
          <br />
          If the training data looks smart, the reflection looks smart. But it's still just tokens.
        </p>
      </motion.div>
    </div>
  )

  return (
    <StepLayout
      title="The Prediction Engine"
      subtitle="Next-Token Probabilities"
      accentColor={stepConfig.accentColor}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      educational={stepConfig.educational}
      stepNumber={stepNumber}
      totalSteps={totalSteps}
    />
  )
}
