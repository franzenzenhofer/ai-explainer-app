// Step 6: Generation - Token by Token (Powered by Real Gemini AI!)
import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'motion/react'
import { Play, Pause, RotateCcw, Zap, Sparkles } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { StepLayout, ControlSlider, TokenList, ProgressBar } from '../../core/components'
import { GPT5_SPECS } from '../../core/types'
import type { StepProps } from '../../core/types/step-props'
import { generateWithGemini } from '../../services/gemini'
import { getTokenColor } from '../../core/utils/colors'

const MAX_TOKENS = 30

export function GenerationStep({ stepNumber, totalSteps, stepConfig }: StepProps) {
  const tokens = useAppStore((s) => s.tokens)
  const generatedTokens = useAppStore((s) => s.generatedTokens)
  const addGeneratedToken = useAppStore((s) => s.addGeneratedToken)
  const clearGeneratedTokens = useAppStore((s) => s.clearGeneratedTokens)
  const isGenerating = useAppStore((s) => s.isGenerating)
  const setIsGenerating = useAppStore((s) => s.setIsGenerating)
  const generationSpeed = useAppStore((s) => s.generationSpeed)
  const setGenerationSpeed = useAppStore((s) => s.setGenerationSpeed)

  // Store the pre-fetched tokens from Gemini
  const [pendingTokens, setPendingTokens] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tokenIndexRef = useRef(0)
  const intervalRef = useRef<number | null>(null)

  // Fetch completion from Gemini
  const fetchCompletion = useCallback(async () => {
    const inputText = tokens.map((t) => t.text).join('')
    if (!inputText.trim()) {
      setError('Please enter some text first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await generateWithGemini(inputText, MAX_TOKENS)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      setPendingTokens(result.tokens)
      tokenIndexRef.current = 0
      setIsLoading(false)
      setIsGenerating(true)
    } catch (err) {
      setError('Failed to generate. Please try again.')
      setIsLoading(false)
    }
  }, [tokens, setIsGenerating])

  // Stream tokens one by one
  useEffect(() => {
    if (isGenerating && tokenIndexRef.current < pendingTokens.length) {
      const interval = 1000 / generationSpeed
      intervalRef.current = window.setTimeout(() => {
        const tokenText = pendingTokens[tokenIndexRef.current]
        addGeneratedToken({
          id: generatedTokens.length,
          text: tokenText,
          tokenId: 1000 + tokenIndexRef.current,
          colorIndex: tokenIndexRef.current,
        })
        tokenIndexRef.current++
      }, interval)
    } else if (tokenIndexRef.current >= pendingTokens.length && pendingTokens.length > 0) {
      setIsGenerating(false)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isGenerating, generatedTokens.length, generationSpeed, pendingTokens, addGeneratedToken, setIsGenerating])

  const handleStart = () => {
    if (pendingTokens.length === 0 || generatedTokens.length === 0) {
      // Need to fetch new completion
      fetchCompletion()
    } else {
      // Resume streaming
      setIsGenerating(true)
    }
  }

  const handlePause = () => setIsGenerating(false)

  const handleStep = () => {
    if (pendingTokens.length === 0) {
      fetchCompletion()
      return
    }
    if (tokenIndexRef.current < pendingTokens.length) {
      const tokenText = pendingTokens[tokenIndexRef.current]
      addGeneratedToken({
        id: generatedTokens.length,
        text: tokenText,
        tokenId: 1000 + tokenIndexRef.current,
        colorIndex: tokenIndexRef.current,
      })
      tokenIndexRef.current++
    }
  }

  const handleReset = () => {
    setIsGenerating(false)
    clearGeneratedTokens()
    setPendingTokens([])
    tokenIndexRef.current = 0
    setError(null)
  }

  const progress = pendingTokens.length > 0
    ? generatedTokens.length / pendingTokens.length
    : 0

  const controls = (
    <div className="flex items-center justify-between">
      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={isGenerating ? handlePause : handleStart}
          disabled={isLoading || (generatedTokens.length >= pendingTokens.length && pendingTokens.length > 0)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: stepConfig.accentColor }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" /> Calling Gemini...
            </>
          ) : isGenerating ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> {generatedTokens.length > 0 ? 'Continue' : 'Generate with AI'}
            </>
          )}
        </motion.button>

        <motion.button
          onClick={handleStep}
          disabled={isGenerating || isLoading || (generatedTokens.length >= pendingTokens.length && pendingTokens.length > 0)}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="h-4 w-4" /> Step
        </motion.button>

        <motion.button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </motion.button>
      </div>

      {/* Speed Slider */}
      <div className="w-48">
        <ControlSlider
          label="Speed"
          value={generationSpeed}
          onChange={setGenerationSpeed}
          min={0.5}
          max={5}
          step={0.5}
          formatValue={(v) => `${v}x`}
          accentColor={stepConfig.accentColor}
        />
      </div>
    </div>
  )

  const leftPanel = (
    <div className="flex h-full flex-col gap-4">
      {/* AI Badge */}
      <motion.div
        className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <div>
            <span className="font-semibold text-emerald-900">Powered by Real AI!</span>
            <span className="ml-2 text-sm text-emerald-700">Gemini 2.5 Flash-Lite</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-emerald-700">
          The continuation is generated by a real AI model, then displayed token-by-token to show the generation process.
        </p>
      </motion.div>

      {/* Pipeline Diagram */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-white p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h4 className="mb-3 text-sm font-medium text-slate-500">Autoregressive Loop</h4>
        <div className="flex items-center justify-center gap-2">
          {['Tokens', 'Embed', 'Attend', 'Predict', 'Sample'].map((step, i) => (
            <motion.div
              key={step}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                isGenerating
                  ? 'bg-current/20 text-current'
                  : 'bg-slate-100 text-slate-500'
              }`}
              style={isGenerating ? { color: stepConfig.accentColor } : undefined}
              animate={
                isGenerating
                  ? {
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                repeat: isGenerating ? Infinity : 0,
              }}
            >
              {step}
            </motion.div>
          ))}
          <motion.span
            className="text-slate-400"
            animate={isGenerating ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
          >
            ↻
          </motion.span>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Each new token triggers the full pipeline again
        </p>
      </motion.div>

      {/* Current Input (grows with each generated token!) */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-500">
          Current Input
          <span className="ml-2 text-xs text-orange-600 font-semibold">
            ({tokens.length + generatedTokens.length} tokens)
          </span>
        </h4>
        <p className="text-xs text-orange-600 mb-2">
          ⚠️ KEY INSIGHT: Each output token becomes part of the NEW input!
        </p>
        <div className="max-h-40 overflow-y-auto">
          {tokens.length > 0 || generatedTokens.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {/* Original tokens */}
              {tokens.map((token, i) => (
                <span
                  key={`orig-${i}`}
                  className="rounded px-1.5 py-0.5 text-xs font-mono"
                  style={{
                    backgroundColor: getTokenColor(token.colorIndex) + '20',
                    color: getTokenColor(token.colorIndex),
                  }}
                >
                  {token.text}
                </span>
              ))}
              {/* Generated tokens (now part of input!) */}
              {generatedTokens.map((token, i) => (
                <motion.span
                  key={`gen-${i}`}
                  className="rounded px-1.5 py-0.5 text-xs font-mono ring-2 ring-offset-1"
                  style={{
                    backgroundColor: getTokenColor(token.colorIndex) + '30',
                    color: getTokenColor(token.colorIndex),
                    ringColor: stepConfig.accentColor,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {token.text}
                </motion.span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic">No input tokens</div>
          )}
        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {generatedTokens.length}
            </div>
            <div className="text-xs text-slate-500">Generated tokens</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {GPT5_SPECS.contextOutput.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Max output tokens</div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col gap-4">
      {/* Progress */}
      <ProgressBar
        progress={progress}
        label={`Generation Progress (${generatedTokens.length}/${pendingTokens.length || '?'})`}
        accentColor={stepConfig.accentColor}
      />

      {/* Generated Output */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white p-4">
        {error && (
          <p className="text-xs text-red-600 font-medium mb-2">
            {error}
          </p>
        )}
        <div className="min-h-[100px] text-lg leading-relaxed">
          {/* Original text */}
          <span className="text-slate-500">
            {tokens.map((t) => t.text).join('')}
          </span>

          {/* Generated tokens */}
          {generatedTokens.map((token, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ color: getTokenColor(token.colorIndex) }}
            >
              {token.text}
            </motion.span>
          ))}

          {/* Cursor */}
          {(isGenerating || isLoading || generatedTokens.length < pendingTokens.length) && (
            <motion.span
              className="inline-block w-0.5 h-5 ml-0.5 align-middle"
              style={{ backgroundColor: stepConfig.accentColor }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            />
          )}
        </div>
      </div>

      {/* Token Stream */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-500">Token Stream</h4>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          {generatedTokens.length > 0 ? (
            generatedTokens.map((token, i) => (
              <motion.span
                key={i}
                className="rounded px-2 py-1 font-mono text-xs"
                style={{
                  backgroundColor: getTokenColor(token.colorIndex) + '20',
                  color: getTokenColor(token.colorIndex),
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {token.text}
              </motion.span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">
              Click "Generate with AI" to see real AI output
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <StepLayout
      title={stepConfig.title}
      subtitle={stepConfig.subtitle}
      accentColor={stepConfig.accentColor}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      controls={controls}
      educational={stepConfig.educational}
      stepNumber={stepNumber}
      totalSteps={totalSteps}
    />
  )
}
