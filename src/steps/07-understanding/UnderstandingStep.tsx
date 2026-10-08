// Step 7: Reality Check
import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bird, Brain, Sparkles, Send, RotateCcw } from 'lucide-react'
import { StepLayout } from '../../core/components'
import type { StepProps } from '../../core/types/step-props'
import type { Token } from '../../core/types'
import { generateWithGemini } from '../../services/gemini'
import { EXPERIMENTS, findExperiment, resolveVerdict, type ReaderChoice } from './experiments'
import { VerdictPanel } from './VerdictPanel'

export function UnderstandingStep({ stepNumber, totalSteps, stepConfig }: StepProps) {
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [responseTokens, setResponseTokens] = useState<Token[]>([])
  const [showParrot, setShowParrot] = useState(true)
  const [choice, setChoice] = useState<ReaderChoice | null>(null)

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
    setChoice(null)
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
    const test = findExperiment(testId)
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
    setChoice(null)
    setCustomQuestion('')
  }, [])

  const currentTest = findExperiment(selectedTest)
  const computedVerdict = currentTest && aiResponse ? resolveVerdict(currentTest, aiResponse, null) : null
  const verdict = currentTest && aiResponse ? resolveVerdict(currentTest, aiResponse, choice) : null

  const leftPanel = (
    <div className="flex h-full flex-col gap-2">
      {/* AI Badge */}
      <motion.div
        className="rounded-lg border-2 border-purple-300 bg-purple-50 px-2.5 py-2"
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
        className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5"
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
              <h4 className="text-sm font-medium text-slate-800">Next-token predictor</h4>
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
        className="rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-sm font-semibold text-amber-900 mb-1">The Mechanical Truth</h4>
        <p className="text-xs text-amber-800">
          <strong>It's Vector Math, not Meaning.</strong><br />
          The AI maps input integers (tokens) to output probability distributions.
          What looks like "intelligence" is statistical pattern matching.
        </p>
      </motion.div>

      {/* Reality Check Table */}
      <motion.div
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-[11px] font-semibold text-slate-500 mb-1">HYPE vs REALITY</h4>
        <div className="space-y-1 text-xs">
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
    <div className="flex h-full flex-col gap-2">
      {/* Test Case Buttons */}
      <div>
        <h3 className="mb-1 text-xs font-medium text-slate-500">Test the AI</h3>
        <div className="grid grid-cols-2 gap-2">
          {EXPERIMENTS.map((test) => (
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
              <span className="font-medium">{test.label}</span>
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
            className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-2">
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

              {currentTest && (
                <VerdictPanel
                  experiment={currentTest}
                  choice={choice}
                  verdict={verdict}
                  checkedAutomatically={computedVerdict !== null}
                  onChoose={setChoice}
                />
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
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center"
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
      title={stepConfig.title}
      subtitle={stepConfig.subtitle}
      accentColor={stepConfig.accentColor}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      educational={stepConfig.educational}
      stepNumber={stepNumber}
      totalSteps={totalSteps}
    />
  )
}
