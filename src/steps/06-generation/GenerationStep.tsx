// Step 6: Generation - Token by Token (Powered by Real AI!)
import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'motion/react'
import { Play, Pause, RotateCcw, Zap, Sparkles } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { StepLayout, ControlSlider, ProgressBar } from '../../core/components'
import type { Token } from '../../core/types'
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

  const [pendingTokens, setPendingTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tokenIndexRef = useRef(0)
  const intervalRef = useRef<number | null>(null)

  const fetchCompletion = useCallback(async () => {
    const inputText = tokens.map((t) => t.text).join('')
    if (!inputText.trim()) {
      setError('Please enter some text first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await generateWithGemini(inputText, MAX_TOKENS, 'continuation')

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      if (result.tokens.length === 0) {
        setError('Model returned no continuation. Please try again.')
        setIsGenerating(false)
        setIsLoading(false)
        return
      }

      setPendingTokens(result.tokens)
      tokenIndexRef.current = 0
      setIsLoading(false)
      setIsGenerating(true)
    } catch {
      setError('Failed to generate. Please try again.')
      setIsLoading(false)
    }
  }, [tokens, setIsGenerating])

  useEffect(() => {
    if (isGenerating && tokenIndexRef.current < pendingTokens.length) {
      const interval = 1000 / generationSpeed
      intervalRef.current = window.setTimeout(() => {
        const realToken = pendingTokens[tokenIndexRef.current]
        addGeneratedToken({
          id: generatedTokens.length,
          text: realToken.text,
          tokenId: realToken.tokenId,
          colorIndex: realToken.colorIndex,
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
      fetchCompletion()
    } else {
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
      const realToken = pendingTokens[tokenIndexRef.current]
      addGeneratedToken({
        id: generatedTokens.length,
        text: realToken.text,
        tokenId: realToken.tokenId,
        colorIndex: realToken.colorIndex,
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

  // Compact text row for viz-full
  const leftPanel = (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-900">Powered by a Real Language Model</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="rounded-md bg-slate-100 px-2 py-1">Tokens</span>
        <span>&rarr;</span>
        <span className="rounded-md bg-slate-100 px-2 py-1">Embed</span>
        <span>&rarr;</span>
        <span className="rounded-md bg-slate-100 px-2 py-1">Attend</span>
        <span>&rarr;</span>
        <span className="rounded-md bg-slate-100 px-2 py-1">Predict</span>
        <span>&rarr;</span>
        <span className="rounded-md bg-slate-100 px-2 py-1">Sample</span>
        <motion.span
          className="text-slate-400"
          animate={isGenerating ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
        >
          &darr;
        </motion.span>
      </div>
      <span className="text-xs text-orange-600 font-medium">
        Each output token becomes part of the new input!
      </span>
    </div>
  )

  const controls = (
    <div className="flex items-center justify-between">
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
              <Sparkles className="h-4 w-4 animate-spin" /> Calling model...
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
          <p className="text-xs text-red-600 font-medium mb-2">{error}</p>
        )}
        <div className="min-h-[100px] text-lg leading-relaxed">
          <span className="text-slate-500">
            {tokens.map((t) => t.text).join('')}
          </span>
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
              Click &quot;Generate with AI&quot; to see real output
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {generatedTokens.length}
            </div>
            <div className="text-xs text-slate-500">Generated tokens</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {tokens.length + generatedTokens.length}
            </div>
            <div className="text-xs text-slate-500">Total context</div>
          </div>
        </div>
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
      controls={controls}
      educational={stepConfig.educational}
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      layout="viz-full"
    />
  )
}
