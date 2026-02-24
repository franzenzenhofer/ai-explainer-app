// Step 4: Attention - Context understanding (viz-full layout)
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Grid3X3, Network } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { StepLayout, ControlSlider, TokenList } from '../../core/components'
import { MODEL_SPECS } from '../../core/types'
import type { StepProps } from '../../core/types/step-props'
import {
  generateAttentionWeights,
  getQueryAttention,
  ATTENTION_PATTERNS,
} from './attention'
import { AttentionHeatmap } from './AttentionHeatmap'
import { AttentionNetwork } from './AttentionNetwork'
import { getTokenColor } from '../../core/utils/colors'

export function AttentionStep({ stepNumber, totalSteps, stepConfig }: StepProps) {
  const tokens = useAppStore((s) => s.tokens)
  const attentionWeights = useAppStore((s) => s.attentionWeights)
  const setAttentionWeights = useAppStore((s) => s.setAttentionWeights)
  const selectedLayer = useAppStore((s) => s.selectedLayer)
  const setSelectedLayer = useAppStore((s) => s.setSelectedLayer)
  const selectedHead = useAppStore((s) => s.selectedHead)
  const setSelectedHead = useAppStore((s) => s.setSelectedHead)
  const selectedQueryToken = useAppStore((s) => s.selectedQueryToken)
  const setSelectedQueryToken = useAppStore((s) => s.setSelectedQueryToken)
  const [viewMode, setViewMode] = useState<'heatmap' | 'network'>('heatmap')

  // Generate attention weights when tokens/layer/head change
  useEffect(() => {
    const weights = generateAttentionWeights(tokens, selectedLayer, selectedHead)
    setAttentionWeights([weights])
  }, [tokens, selectedLayer, selectedHead, setAttentionWeights])

  const currentWeights = attentionWeights[0] || []

  // Get attention for selected query token
  const queryAttention = useMemo(() => {
    if (selectedQueryToken === null) return []
    return getQueryAttention(currentWeights, selectedQueryToken)
  }, [currentWeights, selectedQueryToken])

  // Compact educational text (leftPanel in viz-full = text row above viz)
  const leftPanel = (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        Every token looks at every other token and decides: <strong>&quot;Which ones matter most right now?&quot;</strong>
        {' '}In &quot;The cat sat on the mat because <em>it</em> was tired,&quot; the token &quot;it&quot; pays most attention to &quot;cat.&quot;
      </p>
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span className="rounded-md bg-cyan-50 px-2 py-1 font-medium text-cyan-800">
          1 Score (compare)
        </span>
        <span className="text-slate-400">&rarr;</span>
        <span className="rounded-md bg-cyan-50 px-2 py-1 font-medium text-cyan-800">
          2 Weight (normalize)
        </span>
        <span className="text-slate-400">&rarr;</span>
        <span className="rounded-md bg-cyan-50 px-2 py-1 font-medium text-cyan-800">
          3 Mix (blend)
        </span>
      </div>

      {/* Token selector row */}
      <div>
        <span className="mr-2 text-xs font-medium text-slate-500">Select a token:</span>
        {tokens.length > 0 ? (
          <TokenList
            tokens={tokens}
            selectedIndex={selectedQueryToken}
            onTokenClick={setSelectedQueryToken}
          />
        ) : (
          <span className="text-xs text-slate-400 italic">No tokens available</span>
        )}
      </div>
    </div>
  )

  // Controls with sliders + view toggle
  const controls = (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex-1 min-w-[200px]">
        <ControlSlider
          label="Layer"
          value={selectedLayer}
          onChange={setSelectedLayer}
          min={0}
          max={MODEL_SPECS.layers - 1}
          step={1}
          formatValue={(v) => `${v + 1} / ${MODEL_SPECS.layers}`}
          accentColor={stepConfig.accentColor}
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <ControlSlider
          label="Attention Head"
          value={selectedHead}
          onChange={setSelectedHead}
          min={0}
          max={MODEL_SPECS.headsPerLayer - 1}
          step={1}
          formatValue={(v) => `${v + 1} / ${MODEL_SPECS.headsPerLayer}`}
          accentColor={stepConfig.accentColor}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('heatmap')}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            viewMode === 'heatmap'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Grid3X3 className="h-3 w-3" />
          Heatmap
        </button>
        <button
          onClick={() => setViewMode('network')}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            viewMode === 'network'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Network className="h-3 w-3" />
          Network
        </button>
      </div>
    </div>
  )

  // Full-width visualization
  const rightPanel = (
    <div className="flex h-full flex-col gap-3">
      {/* Attention Visualization */}
      <div className="flex-1">
        {viewMode === 'heatmap' ? (
          <AttentionHeatmap
            tokens={tokens}
            weights={currentWeights}
            selectedQuery={selectedQueryToken}
            onCellClick={(query) => setSelectedQueryToken(query)}
          />
        ) : (
          <AttentionNetwork
            tokens={tokens}
            weights={currentWeights}
            selectedQuery={selectedQueryToken}
            onTokenClick={setSelectedQueryToken}
            accentColor={stepConfig.accentColor}
          />
        )}
      </div>

      {/* Top attention targets for selected token */}
      {selectedQueryToken !== null && queryAttention.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-3"
        >
          <h4 className="mb-2 text-xs font-medium text-slate-500">
            Top attention for &quot;{tokens[selectedQueryToken]?.text}&quot;:
          </h4>
          <div className="flex flex-wrap gap-3">
            {queryAttention.slice(0, 5).map(({ keyIdx, weight }, i) => (
              <div key={keyIdx} className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-mono"
                  style={{
                    backgroundColor: getTokenColor(tokens[keyIdx]?.colorIndex || 0) + '20',
                    color: getTokenColor(tokens[keyIdx]?.colorIndex || 0),
                  }}
                >
                  {tokens[keyIdx]?.text}
                </span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: stepConfig.accentColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${weight * 100}%` }}
                    transition={{ delay: i * 0.05 }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  {(weight * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Compact pattern info */}
      <div className="text-xs text-slate-500">
        <strong>Patterns:</strong>{' '}
        {ATTENTION_PATTERNS.map((p, i) => (
          <span key={p.name}>
            {p.name}{i < ATTENTION_PATTERNS.length - 1 ? ' · ' : ''}
          </span>
        ))}
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
      layout="viz-full"
    />
  )
}
