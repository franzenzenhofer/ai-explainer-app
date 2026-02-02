// Step 5: Prediction - Calculating probabilities
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { AlertCircle, Thermometer, Filter, Percent, BarChart3, Network } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { StepLayout, ControlSlider, ControlPresets } from '../../core/components'
import { GPT5_SPECS } from '../../core/types'
import type { StepProps } from '../../core/types/step-props'
import { generatePredictions } from './sampling'
import { ProbabilityChart } from './ProbabilityChart'
import { PredictionNetwork } from './PredictionNetwork'

const TEMPERATURE_PRESETS = [
  { label: 'Greedy', value: 0 },
  { label: 'Low', value: 0.5 },
  { label: 'Medium', value: 1.0 },
  { label: 'High', value: 1.5 },
  { label: 'Max', value: 2.0 },
]

export function PredictionStep({ stepNumber, totalSteps, stepConfig }: StepProps) {
  const tokens = useAppStore((s) => s.tokens)
  const predictions = useAppStore((s) => s.predictions)
  const setPredictions = useAppStore((s) => s.setPredictions)
  const temperature = useAppStore((s) => s.temperature)
  const setTemperature = useAppStore((s) => s.setTemperature)
  const topK = useAppStore((s) => s.topK)
  const setTopK = useAppStore((s) => s.setTopK)
  const topP = useAppStore((s) => s.topP)
  const setTopP = useAppStore((s) => s.setTopP)
  const [viewMode, setViewMode] = useState<'chart' | 'network'>('network')

  // Generate predictions when parameters change
  useEffect(() => {
    const newPredictions = generatePredictions(tokens, temperature, topK, topP)
    setPredictions(newPredictions)
  }, [tokens, temperature, topK, topP, setPredictions])

  const controls = (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <ControlSlider
            label="Temperature"
            value={temperature}
            onChange={setTemperature}
            min={0}
            max={2}
            step={0.1}
            formatValue={(v) => v.toFixed(1)}
            description="Lower = more deterministic, Higher = more creative"
            accentColor={stepConfig.accentColor}
          />
          <ControlPresets
            presets={TEMPERATURE_PRESETS}
            currentValue={temperature}
            onChange={setTemperature}
            accentColor={stepConfig.accentColor}
          />
        </div>

        <ControlSlider
          label="Top-K"
          value={topK}
          onChange={setTopK}
          min={1}
          max={100}
          step={1}
          formatValue={(v) => v.toString()}
          description="Only consider top K most likely tokens"
          accentColor={stepConfig.accentColor}
        />

        <ControlSlider
          label="Top-P (Nucleus)"
          value={topP}
          onChange={setTopP}
          min={0.1}
          max={1.0}
          step={0.05}
          formatValue={(v) => v.toFixed(2)}
          description="Consider tokens until cumulative probability reaches P"
          accentColor={stepConfig.accentColor}
        />
      </div>
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
            <h4 className="font-semibold text-blue-900">How does AI choose the next word?</h4>
            <p className="mt-1 text-sm text-blue-800">
              The AI calculates a <strong>probability</strong> for each of the {GPT5_SPECS.vocabulary.toLocaleString()} possible tokens
              in its vocabulary. Think of it like a weighted dice - some outcomes are more likely than others.
              <strong> Temperature</strong> controls creativity: low = predictable, high = more random.
              <strong> Top-K</strong> limits choices to the K most likely tokens.
              <strong> Top-P</strong> limits choices until cumulative probability reaches P%.
              Try the sliders below to see how these affect the output!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sampling Explanation */}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <h4 className="font-medium text-slate-700">Temperature = {temperature}</h4>
          </div>
          <p className="text-sm text-slate-500">
            {temperature === 0
              ? 'Greedy: Always picks the highest probability token.'
              : temperature < 0.7
                ? 'Conservative: Slight variation, mostly predictable.'
                : temperature < 1.3
                  ? 'Balanced: Mix of predictability and creativity.'
                  : 'Creative: High randomness, more surprising outputs.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-slate-700">Top-K = {topK}</h4>
          </div>
          <p className="text-sm text-slate-500">
            Only the top {topK} most likely tokens are considered.
            {topK < 10 ? ' Very focused output.' : topK < 50 ? ' Balanced selection.' : ' Wide variety possible.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-green-500" />
            <h4 className="font-medium text-slate-700">Top-P = {topP.toFixed(2)}</h4>
          </div>
          <p className="text-sm text-slate-500">
            Consider tokens until cumulative probability reaches {(topP * 100).toFixed(0)}%.
            {topP < 0.5 ? ' Very restrictive.' : topP < 0.9 ? ' Nucleus sampling.' : ' Nearly all tokens eligible.'}
          </p>
        </div>
      </div>
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col gap-3">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('network')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === 'network' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Network className="h-3 w-3" /> Network
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === 'chart' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="h-3 w-3" /> Chart
          </button>
        </div>
        <span className="text-xs text-slate-500">
          {viewMode === 'network' ? 'Context → Predictions' : 'Top 20 probabilities'}
        </span>
      </div>

      {/* Visualization */}
      <div className="flex-1 min-h-[300px]">
        {viewMode === 'chart' ? (
          <ProbabilityChart predictions={predictions.slice(0, 20)} accentColor={stepConfig.accentColor} />
        ) : (
          <PredictionNetwork inputTokens={tokens} predictions={predictions.slice(0, 10)} accentColor={stepConfig.accentColor} />
        )}
      </div>

      {/* Stats */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-slate-900">{predictions.length}</div>
            <div className="text-[10px] text-slate-500">Candidates</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">
              {predictions[0] ? (predictions[0].probability * 100).toFixed(1) + '%' : '—'}
            </div>
            <div className="text-[10px] text-slate-500">Top probability</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{GPT5_SPECS.vocabulary.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Total vocabulary</div>
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
    />
  )
}
