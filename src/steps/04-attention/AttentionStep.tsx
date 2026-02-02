// Step 4: Attention - Context understanding
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { AlertCircle, Grid3X3, Network } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { StepLayout, ControlSlider, TokenList } from '../../core/components'
import { GPT5_SPECS } from '../../core/types'
import type { StepProps } from '../../core/types/step-props'
import { generateAttentionWeights, getQueryAttention, ATTENTION_PATTERNS } from './attention'
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
    setAttentionWeights([weights]) // Wrap in array for now (could support multiple layers)
  }, [tokens, selectedLayer, selectedHead, setAttentionWeights])

  const currentWeights = attentionWeights[0] || []

  // Get attention for selected query token
  const queryAttention = useMemo(() => {
    if (selectedQueryToken === null) return []
    return getQueryAttention(currentWeights, selectedQueryToken)
  }, [currentWeights, selectedQueryToken])

  const controls = (
    <div className="grid grid-cols-2 gap-6">
      <ControlSlider
        label="Layer"
        value={selectedLayer}
        onChange={setSelectedLayer}
        min={0}
        max={GPT5_SPECS.layers - 1}
        step={1}
        formatValue={(v) => `${v + 1} / ${GPT5_SPECS.layers}`}
        description={`GPT-5 has ${GPT5_SPECS.layers} transformer layers`}
        accentColor={stepConfig.accentColor}
      />
      <ControlSlider
        label="Attention Head"
        value={selectedHead}
        onChange={setSelectedHead}
        min={0}
        max={GPT5_SPECS.headsPerLayer - 1}
        step={1}
        formatValue={(v) => `${v + 1} / ${GPT5_SPECS.headsPerLayer}`}
        description={`${GPT5_SPECS.headsPerLayer} parallel attention heads per layer`}
        accentColor={stepConfig.accentColor}
      />
    </div>
  )

  const leftPanel = (
    <div className="flex h-full flex-col gap-4">
      {/* Educational Explanation */}
      <motion.div
        className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-900">What is Attention?</h4>
            <p className="mt-1 text-sm text-blue-800">
              <strong>Self-Attention</strong> is like a group conversation where everyone can hear everyone else simultaneously.
              Unlike reading word-by-word, the AI processes ALL tokens at once. Each token asks: "Which other tokens are relevant to understanding ME?"
            </p>
            <p className="mt-2 text-sm text-blue-800">
              <strong>Example:</strong> In "The cat sat on the mat because <em>it</em> was tired" - the word "it" needs to figure out
              what it refers to. Through attention, "it" can "look at" both "cat" and "mat" and learn (from training) that "it" most likely refers to "cat"
              (the one that can be tired). The heatmap shows these attention weights - darker = stronger connection.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Query Token Selection */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-500">
          Select Query Token
        </h3>
        {tokens.length > 0 ? (
          <TokenList
            tokens={tokens}
            selectedIndex={selectedQueryToken}
            onTokenClick={setSelectedQueryToken}
          />
        ) : (
          <div className="text-sm text-slate-400 italic">No tokens available</div>
        )}
      </div>

      {/* Attention Distribution for Selected Token */}
      {selectedQueryToken !== null && queryAttention.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <h4 className="mb-3 text-sm font-medium text-slate-500">
            "{tokens[selectedQueryToken]?.text}" attends to:
          </h4>
          <div className="space-y-2">
            {queryAttention.slice(0, 5).map(({ keyIdx, weight }, i) => (
              <div key={keyIdx} className="flex items-center gap-3">
                <span
                  className="w-20 truncate rounded px-2 py-1 text-xs font-mono"
                  style={{
                    backgroundColor: getTokenColor(tokens[keyIdx]?.colorIndex || 0) + '20',
                    color: getTokenColor(tokens[keyIdx]?.colorIndex || 0),
                  }}
                >
                  {tokens[keyIdx]?.text}
                </span>
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: stepConfig.accentColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${weight * 100}%` }}
                    transition={{ delay: i * 0.1 }}
                  />
                </div>
                <span className="w-14 text-right text-xs text-slate-500">
                  {(weight * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col gap-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
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
        <div className="text-xs text-slate-500">
          {viewMode === 'heatmap' ? 'Row = Query, Column = Key' : 'Click token to see attention'}
        </div>
      </div>

      {/* Attention Visualization */}
      <div className="flex-1">
        <p className="text-xs text-orange-600 font-medium mb-2">
          ⚠️ SIMPLIFICATION: Real GPT-5 computes {GPT5_SPECS.layers} layers × {GPT5_SPECS.headsPerLayer} heads = <strong>{(GPT5_SPECS.layers * GPT5_SPECS.headsPerLayer).toLocaleString()} attention patterns simultaneously</strong>.
          We show 1 pattern at a time - use the sliders above to explore different layer/head combinations.
        </p>
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

      {/* Attention Pattern Info */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="mb-1 text-sm font-medium text-slate-700">
          {viewMode === 'heatmap' ? 'What Patterns Can You See?' : 'Attention Lines Show Probability'}
        </h4>
        <p className="mb-3 text-xs text-slate-500">
          {viewMode === 'heatmap'
            ? 'Different attention heads learn different patterns. Look for these in the heatmap above:'
            : 'Line thickness = how much that token "attends to" another token. Thicker = higher probability weight.'}
        </p>
        {viewMode === 'heatmap' && (
          <div className="grid grid-cols-2 gap-2">
            {ATTENTION_PATTERNS.map((pattern) => (
              <div key={pattern.name} className="rounded bg-white p-2 border border-slate-200">
                <div className="text-xs font-semibold text-slate-800">{pattern.name}</div>
                <div className="text-[10px] text-slate-600 leading-relaxed">{pattern.description}</div>
                <div className="text-[10px] text-slate-400 italic mt-1">{pattern.example}</div>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'network' && (
          <div className="text-xs text-slate-600 space-y-1">
            <p>• <strong>Click a token</strong> to see what it attends to</p>
            <p>• <strong>Thick lines</strong> = strong attention (high probability)</p>
            <p>• <strong>Thin lines</strong> = weak attention (low probability)</p>
            <p>• This is how the AI calculates which tokens are relevant to each other</p>
          </div>
        )}
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
    />
  )
}
