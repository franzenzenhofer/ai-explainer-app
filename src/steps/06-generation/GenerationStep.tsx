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

type Phase = 'processing' | 'calculating' | 'choosing' | 'reveal' | null

const PHASE_STYLES: Record<NonNullable<Phase>, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
  processing: {
    label: 'Processing input...',
    dotClass: 'bg-blue-500',
    textClass: 'text-blue-700',
    bgClass: 'border-blue-200 bg-blue-50',
  },
  calculating: {
    label: 'Calculating next possible tokens...',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    bgClass: 'border-amber-200 bg-amber-50',
  },
  choosing: {
    label: 'Choosing next token...',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    bgClass: 'border-emerald-200 bg-emerald-50',
  },
  reveal: {
    label: '', // filled dynamically with token text
    dotClass: 'bg-violet-500',
    textClass: 'text-violet-700',
    bgClass: 'border-violet-300 bg-violet-50',
  },
}

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
  const [phase, setPhase] = useState<Phase>(null)
  const [revealText, setRevealText] = useState<string>('')
  const [revealColor, setRevealColor] = useState<number>(0)
  const tokenIndexRef = useRef(0)
  const phaseTimeoutsRef = useRef<number[]>([])

  const clearPhaseTimeouts = useCallback(() => {
    phaseTimeoutsRef.current.forEach(clearTimeout)
    phaseTimeoutsRef.current = []
  }, [])

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

  // 4-phase cycle: processing → calculating → choosing → reveal token → add to stream
  useEffect(() => {
    clearPhaseTimeouts()

    if (!isGenerating || tokenIndexRef.current >= pendingTokens.length) {
      if (tokenIndexRef.current >= pendingTokens.length && pendingTokens.length > 0) {
        setIsGenerating(false)
        setPhase(null)
      }
      return
    }

    const totalInterval = 1000 / generationSpeed
    const step = totalInterval / 5 // 5 steps: 3 phases + reveal + add

    const nextToken = pendingTokens[tokenIndexRef.current]

    setPhase('processing')

    const t1 = window.setTimeout(() => setPhase('calculating'), step)
    const t2 = window.setTimeout(() => setPhase('choosing'), step * 2)
    const t3 = window.setTimeout(() => {
      setRevealText(nextToken.text)
      setRevealColor(nextToken.colorIndex)
      setPhase('reveal')
    }, step * 3)
    const t4 = window.setTimeout(() => {
      addGeneratedToken({
        id: generatedTokens.length,
        text: nextToken.text,
        tokenId: nextToken.tokenId,
        colorIndex: nextToken.colorIndex,
      })
      tokenIndexRef.current++
      setPhase(null)
    }, step * 4)

    phaseTimeoutsRef.current = [t1, t2, t3, t4]
    return clearPhaseTimeouts
  }, [isGenerating, generatedTokens.length, generationSpeed, pendingTokens, addGeneratedToken, setIsGenerating, clearPhaseTimeouts])

  const handleStart = () => {
    if (pendingTokens.length === 0 || generatedTokens.length === 0) {
      fetchCompletion()
    } else {
      setIsGenerating(true)
    }
  }

  const handlePause = () => {
    setIsGenerating(false)
    setPhase(null)
  }

  const handleStep = () => {
    if (pendingTokens.length === 0) {
      fetchCompletion()
      return
    }
    if (tokenIndexRef.current < pendingTokens.length) {
      const next = pendingTokens[tokenIndexRef.current]
      addGeneratedToken({
        id: generatedTokens.length,
        text: next.text,
        tokenId: next.tokenId,
        colorIndex: next.colorIndex,
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
    setPhase(null)
  }

  const progress = pendingTokens.length > 0 ? generatedTokens.length / pendingTokens.length : 0
  const showCursor = isGenerating || isLoading ||
    (pendingTokens.length > 0 && generatedTokens.length < pendingTokens.length)

  const leftPanel = <GenerationPipeline isGenerating={isGenerating} />

  const controls = (
    <GenerationControls
      isGenerating={isGenerating}
      isLoading={isLoading}
      isDone={generatedTokens.length >= pendingTokens.length && pendingTokens.length > 0}
      generationSpeed={generationSpeed}
      hasTokens={generatedTokens.length > 0}
      accentColor={stepConfig.accentColor}
      onStart={handleStart}
      onPause={handlePause}
      onStep={handleStep}
      onReset={handleReset}
      onSpeedChange={setGenerationSpeed}
    />
  )

  const rightPanel = (
    <div className="flex h-full flex-col gap-2">
      <ProgressBar
        progress={progress}
        label={`Generation Progress (${generatedTokens.length}/${pendingTokens.length || '?'})`}
        accentColor={stepConfig.accentColor}
      />

      {/* Generated Output */}
      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white p-3">
        {error && <p className="text-xs text-red-600 font-medium mb-2">{error}</p>}
        <div className="min-h-[100px] text-lg leading-relaxed">
          <span className="text-slate-500">{tokens.map((t) => t.text).join('')}</span>
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
          {showCursor && (
            <motion.span
              className="ml-1 inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 align-middle text-[11px] font-medium text-emerald-700"
              animate={{ opacity: [0.6, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
            >
              &rarr; requesting next token
            </motion.span>
          )}
        </div>
      </div>

      {/* Phase status line — full width, fixed height, no layout shifts */}
      <PhaseStatusLine phase={phase} revealText={revealText} revealColor={revealColor} />

      {/* Token Stream */}
      <div>
        <h4 className="mb-1 text-sm font-medium text-slate-500">Token Stream</h4>
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
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
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-center gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">{generatedTokens.length}</div>
            <div className="text-xs text-slate-500">Generated tokens</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{tokens.length + generatedTokens.length}</div>
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

// --- Sub-components ---

function PhaseStatusLine({ phase, revealText, revealColor }: {
  phase: Phase
  revealText: string
  revealColor: number
}) {
  if (!phase) return <div className="h-7" /> // stable placeholder — no layout shift

  const style = PHASE_STYLES[phase]

  return (
    <div className={`flex h-7 items-center gap-2 rounded-md border px-2.5 transition-colors duration-150 ${style.bgClass}`}>
      <span className={`h-2 w-2 rounded-full ${style.dotClass} animate-pulse`} />
      {phase === 'reveal' ? (
        <span className="text-xs font-medium">
          <span className={style.textClass}>Next token: </span>
          <span
            className="inline-block rounded px-1.5 py-0.5 font-mono font-bold"
            style={{
              backgroundColor: getTokenColor(revealColor) + '25',
              color: getTokenColor(revealColor),
            }}
          >
            {revealText}
          </span>
        </span>
      ) : (
        <span className={`text-xs font-medium ${style.textClass}`}>{style.label}</span>
      )}
    </div>
  )
}

function GenerationPipeline({ isGenerating }: { isGenerating: boolean }) {
  return (
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
}

function GenerationControls({
  isGenerating, isLoading, isDone, generationSpeed, hasTokens, accentColor,
  onStart, onPause, onStep, onReset, onSpeedChange,
}: {
  isGenerating: boolean
  isLoading: boolean
  isDone: boolean
  generationSpeed: number
  hasTokens: boolean
  accentColor: string
  onStart: () => void
  onPause: () => void
  onStep: () => void
  onReset: () => void
  onSpeedChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <motion.button
          onClick={isGenerating ? onPause : onStart}
          disabled={isLoading || isDone}
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <><Sparkles className="h-4 w-4 animate-spin" /> Calling model...</>
          ) : isGenerating ? (
            <><Pause className="h-4 w-4" /> Pause</>
          ) : (
            <><Play className="h-4 w-4" /> {hasTokens ? 'Continue' : 'Generate with AI'}</>
          )}
        </motion.button>
        <motion.button
          onClick={onStep}
          disabled={isGenerating || isLoading || isDone}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="h-4 w-4" /> Step
        </motion.button>
        <motion.button
          onClick={onReset}
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
          onChange={onSpeedChange}
          min={0.5}
          max={5}
          step={0.5}
          formatValue={(v) => `${v}x`}
          accentColor={accentColor}
        />
      </div>
    </div>
  )
}
