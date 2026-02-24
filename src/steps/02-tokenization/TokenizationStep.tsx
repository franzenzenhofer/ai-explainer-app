// Step 2: Tokenization - Breaking text into tokens
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Scissors, AlertCircle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { StepLayout, TokenList, LabeledCounter } from '../../core/components'
import { MODEL_SPECS } from '../../core/types'
import type { StepProps } from '../../core/types/step-props'
import { tokenize, getTokenStats } from './tokenizer'
import { BPEVisualizer } from './BPEVisualizer'

export function TokenizationStep({ stepNumber, totalSteps, stepConfig }: StepProps) {
  const inputText = useAppStore((s) => s.inputText)
  const tokens = useAppStore((s) => s.tokens)
  const setTokens = useAppStore((s) => s.setTokens)

  const [showBPE, setShowBPE] = useState(true)
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null)

  useEffect(() => {
    const newTokens = tokenize(inputText)
    setTokens(newTokens)
  }, [inputText, setTokens])

  const stats = getTokenStats(inputText, tokens)

  const leftPanel = (
    <div className="space-y-4">
      {/* Original Text with Token Highlights */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-500">Original Text</h3>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-lg leading-relaxed text-slate-900">
          {inputText || (
            <span className="text-slate-400 italic">No input yet. Go back and enter text.</span>
          )}
        </div>
      </div>

      {/* Educational Explanation */}
      <motion.div
        className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-900">What are Tokens?</h4>
            <p className="mt-1 text-sm text-blue-800">
              Language models don&apos;t read letters or words like humans do. Instead, they break text into <strong>tokens</strong> —
              substrings of text that the model has learned are useful. A token might be a whole word like &quot;the&quot;,
              part of a word like &quot;ing&quot;, or even punctuation. For example: &quot;Großmutter&quot; (grandmother)
              becomes two tokens: [&quot;Groß&quot;, &quot;mutter&quot;]. This is why these models sometimes struggle with spelling
              or counting letters — they literally don&apos;t see individual characters!
            </p>
          </div>
        </div>
      </motion.div>

      {/* BPE Demo Toggle */}
      <button
        onClick={() => setShowBPE(!showBPE)}
        className="flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
      >
        <Scissors className="h-4 w-4" />
        {showBPE ? 'Hide' : 'Show'} How Byte-Pair Encoding Works
      </button>

      {/* BPE Visualizer */}
      <AnimatePresence>
        {showBPE && <BPEVisualizer />}
      </AnimatePresence>
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col gap-6">
      {/* Token List */}
      <div className="flex-1">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-500">Tokens</h3>
          <span className="text-xs text-slate-400">Click a token to inspect</span>
        </div>

        {tokens.length > 0 ? (
          <TokenList
            tokens={tokens}
            showIds
            selectedIndex={selectedTokenIdx}
            onTokenClick={setSelectedTokenIdx}
          />
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
            Enter text to see tokens
          </div>
        )}
      </div>

      {/* Statistics */}
      <motion.div
        className="grid grid-cols-4 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LabeledCounter
          value={parseInt(stats.tokenCount.toString())}
          label="Tokens"
          accentColor={stepConfig.accentColor}
        />
        <LabeledCounter
          value={parseInt(stats.wordCount.toString())}
          label="Words"
        />
        <LabeledCounter
          value={parseInt(stats.charCount.toString())}
          label="Chars"
        />
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-slate-900">{stats.avgCharsPerToken}</span>
          <span className="text-xs uppercase tracking-wider text-slate-500">Chars/Token</span>
        </div>
      </motion.div>

      {/* Vocabulary info */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-white p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-slate-500">
          Modern language models use <strong className="text-slate-900">{MODEL_SPECS.vocabulary.toLocaleString()}</strong> unique tokens
          <br />
          <span className="text-xs text-slate-400">Tokenizer: same one used by ChatGPT and similar models</span>
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
      layout="viz-wide"
    />
  )
}
