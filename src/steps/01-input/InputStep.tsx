// Step 1: Input - Prompt Entry
import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Type, Hash, Puzzle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { StepLayout, LabeledCounter } from '../../core/components'
import type { StepProps } from '../../core/types/step-props'
import { SamplePrompts } from './SamplePrompts'
import { tokenize } from '../02-tokenization/tokenizer'

function countWords(text: string): number {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).length
}

export function InputStep({ stepNumber, totalSteps, stepConfig }: StepProps) {
  const inputText = useAppStore((s) => s.inputText)
  const setInputText = useAppStore((s) => s.setInputText)

  // Use REAL tiktoken tokenization - same tokenizer used throughout the app (DRY)
  const tokenCount = useMemo(() => tokenize(inputText).length, [inputText])

  const charCount = inputText.length
  const wordCount = countWords(inputText)

  const leftPanel = (
    <div className="flex h-full flex-col gap-2">
      {/* Text Input */}
      <div className="relative flex-1">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your prompt here..."
          className="h-full w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          autoFocus
        />

        {/* Animated cursor when empty */}
        {!inputText && (
          <motion.div
            className="pointer-events-none absolute left-4 top-4 h-6 w-0.5 bg-blue-500"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          />
        )}
      </div>

      {/* Sample Prompts */}
      <SamplePrompts onSelect={setInputText} />
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      {/* Stats Display */}
      <motion.div
        className="grid grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LabeledCounter
          value={charCount}
          label="Characters"
          icon={<Type className="h-5 w-5" />}
          accentColor={stepConfig.accentColor}
        />
        <LabeledCounter
          value={wordCount}
          label="Words"
          icon={<Hash className="h-5 w-5" />}
          accentColor={stepConfig.accentColor}
        />
        <LabeledCounter
          value={tokenCount}
          label="Tokens"
          icon={<Puzzle className="h-5 w-5" />}
          accentColor={stepConfig.accentColor}
        />
      </motion.div>

      {/* Pipeline Preview */}
      <motion.div
        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="mb-2 text-center text-xs font-medium text-slate-500">
          The AI Pipeline
        </h3>
        <div className="flex items-center gap-2">
          {['Tokenize', 'Embed', 'Attend', 'Predict', 'Generate', 'Output'].map((step, i) => (
            <motion.div
              key={step}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                {step}
              </div>
              {i < 5 && (
                <span className="text-slate-400">→</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Hint */}
      <motion.p
        className="max-w-md text-center text-sm text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Enter any text to see how a language model processes it step by step.
        <br />
        Try the examples below or write your own!
      </motion.p>
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
