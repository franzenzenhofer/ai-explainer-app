// Step 4: Attention - Context understanding (viz-full layout)
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { AlertCircle, Grid3X3, Layers, Lock, Network } from 'lucide-react'
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

const ATTENTION_WORKFLOW = [
  {
    title: 'Score',
    description: 'Compare the current token to earlier tokens and compute raw relevance scores.',
  },
  {
    title: 'Weight',
    description: 'Convert scores to probabilities. Higher relevance gets higher weight.',
  },
  {
    title: 'Mix',
    description: 'Blend earlier token information by those weights to build context.',
  },
]

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

  // Educational content above the visualization
  const leftPanel = (
    <div className="space-y-2">
      {/* Attention in Plain English */}
      <motion.div
        className="rounded-lg border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 p-2.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-700" />
          <div>
            <h4 className="text-sm font-semibold text-cyan-950">Attention in Plain English</h4>
            <p className="mt-0.5 text-xs text-cyan-900">
              Attention is the model&apos;s relevance system. For each token, it asks:
              &quot;Which earlier tokens matter most right now?&quot;
            </p>
            {/* Score → Weight → Mix workflow */}
            <div className="mt-1.5 grid gap-1.5 sm:grid-cols-3">
              {ATTENTION_WORKFLOW.map((item, index) => (
                <div key={item.title} className="rounded border border-cyan-200 bg-white/90 px-2 py-1.5">
                  <div className="mb-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-cyan-700 text-[9px] font-semibold text-white">
                    {index + 1}
                  </div>
                  <span className="ml-1 text-xs font-semibold text-cyan-900">{item.title}</span>
                  <div className="text-[11px] leading-tight text-cyan-800">{item.description}</div>
                </div>
              ))}
            </div>
            <p className="mt-1.5 rounded border border-cyan-200 bg-white/80 px-2 py-1.5 text-xs text-cyan-900">
              <strong>Example:</strong> In &quot;The cat sat on the mat because <em>it</em> was tired,&quot;
              the token <strong>it</strong> gives a higher attention weight to <strong>cat</strong> than <strong>mat</strong>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Heads + Causal Mask — side by side */}
      <div className="grid gap-2 sm:grid-cols-2">
        <motion.div
          className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-700" />
            <h4 className="text-xs font-semibold text-indigo-900">Attention Heads</h4>
          </div>
          <p className="text-[11px] leading-snug text-indigo-800">
            Each head is one independent attention lens. Multiple heads run in parallel and learn different patterns
            (pronouns, local grammar, long-range references), then their outputs are combined.
          </p>
        </motion.div>

        <motion.div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="mb-1 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-700" />
            <h4 className="text-xs font-semibold text-emerald-900">Causal Mask</h4>
          </div>
          <p className="text-[11px] leading-snug text-emerald-800">
            The model cannot peek ahead. At position <em>t</em>, a token can attend only to tokens at positions
            &lt;= <em>t</em>. Future-token weights are forced to zero.
          </p>
        </motion.div>
      </div>

      {/* Token selector */}
      <div>
        <h3 className="mb-1 text-xs font-medium text-slate-500">Choose a Query Token</h3>
        {tokens.length > 0 ? (
          <TokenList
            tokens={tokens}
            selectedIndex={selectedQueryToken}
            onTokenClick={setSelectedQueryToken}
          />
        ) : (
          <div className="text-xs text-slate-400 italic">No tokens available</div>
        )}
      </div>

      {/* Attention Distribution for Selected Token */}
      {selectedQueryToken !== null && queryAttention.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-slate-200 bg-white p-2.5"
        >
          <h4 className="mb-1.5 text-xs font-medium text-slate-500">
            Top attention targets for &quot;{tokens[selectedQueryToken]?.text}&quot;:
          </h4>
          <div className="space-y-1">
            {queryAttention.slice(0, 5).map(({ keyIdx, weight }, i) => (
              <div key={keyIdx} className="flex items-center gap-2">
                <span
                  className="w-16 truncate rounded px-1.5 py-0.5 text-[11px] font-mono"
                  style={{
                    backgroundColor: getTokenColor(tokens[keyIdx]?.colorIndex || 0) + '20',
                    color: getTokenColor(tokens[keyIdx]?.colorIndex || 0),
                  }}
                >
                  {tokens[keyIdx]?.text}
                </span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: stepConfig.accentColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${weight * 100}%` }}
                    transition={{ delay: i * 0.1 }}
                  />
                </div>
                <span className="w-12 text-right text-[11px] text-slate-500">
                  {(weight * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )

  // Controls with sliders + view toggle
  const controls = (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[180px]">
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
      <div className="flex-1 min-w-[180px]">
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
    <div className="flex h-full flex-col gap-1.5">
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

      {/* Attention Pattern Info */}
      <motion.div
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="mb-0.5 text-xs font-medium text-slate-700">
          {viewMode === 'heatmap' ? 'Patterns to Look For' : 'Interpreting Attention Lines'}
        </h4>
        <p className="mb-1.5 text-[11px] text-slate-500">
          {viewMode === 'heatmap'
            ? 'Different heads can specialize in different patterns. Common examples:'
            : 'Line thickness encodes weight: thicker means stronger contribution from that key token.'}
        </p>
        {viewMode === 'heatmap' && (
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
            {ATTENTION_PATTERNS.map((pattern) => (
              <div key={pattern.name} className="rounded border border-slate-200 bg-white px-1.5 py-1">
                <div className="text-[11px] font-semibold text-slate-800">{pattern.name}</div>
                <div className="text-[10px] leading-tight text-slate-600">{pattern.description}</div>
                <div className="mt-0.5 text-[10px] italic text-slate-400">{pattern.example}</div>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'network' && (
          <div className="space-y-0.5 text-[11px] text-slate-600">
            <p>&bull; <strong>Click a token</strong> to set it as the query token</p>
            <p>&bull; <strong>Thick lines</strong> = stronger weight from key token to query token</p>
            <p>&bull; <strong>Thin lines</strong> = weaker weight</p>
            <p>&bull; Use sliders to compare how the same sentence changes across heads/layers</p>
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
      layout="viz-full"
    />
  )
}
