// Step 3: Embeddings - Words become vectors
import { useEffect } from 'react'
import { motion } from 'motion/react'
import { AlertCircle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { StepLayout, TokenList } from '../../core/components'
import { GPT5_SPECS } from '../../core/types'
import type { StepProps } from '../../core/types/step-props'
import { createEmbeddings, get2DPosition, getNearestNeighbors } from './embeddings'
import { SemanticSpace } from './SemanticSpace'
import { VectorDisplay } from './VectorDisplay'
import { getTokenColor } from '../../core/utils/colors'

export function EmbeddingsStep({ stepNumber, totalSteps, stepConfig }: StepProps) {
  const tokens = useAppStore((s) => s.tokens)
  const embeddings = useAppStore((s) => s.embeddings)
  const setEmbeddings = useAppStore((s) => s.setEmbeddings)
  const selectedTokenForEmbedding = useAppStore((s) => s.selectedTokenForEmbedding)
  const setSelectedTokenForEmbedding = useAppStore((s) => s.setSelectedTokenForEmbedding)

  // Create embeddings when tokens change
  useEffect(() => {
    const newEmbeddings = createEmbeddings(tokens)
    setEmbeddings(newEmbeddings)
  }, [tokens, setEmbeddings])

  const selectedToken = selectedTokenForEmbedding !== null ? tokens[selectedTokenForEmbedding] : null
  const selectedEmbedding = selectedTokenForEmbedding !== null ? embeddings[selectedTokenForEmbedding] : null

  // Get neighbors for selected token
  const neighbors = selectedToken
    ? getNearestNeighbors(selectedToken.text, selectedToken.tokenId)
    : []

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
            <h4 className="font-semibold text-blue-900">What are Embeddings?</h4>
            <p className="mt-1 text-sm text-blue-800">
              Each token gets converted into a list of <strong>{GPT5_SPECS.embeddingDim.toLocaleString()} numbers</strong> (called a "vector").
              Tokens with similar meanings have similar numbers, so "king" and "queen" are mathematically close.
              This is how AI represents the "meaning" of words as math the computer can process.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Token List */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-700">Select a Token</h3>
        {tokens.length > 0 ? (
          <TokenList
            tokens={tokens}
            selectedIndex={selectedTokenForEmbedding}
            onTokenClick={setSelectedTokenForEmbedding}
          />
        ) : (
          <div className="text-sm text-slate-400 italic">No tokens available</div>
        )}
      </div>

      {/* Vector Display */}
      {selectedToken && selectedEmbedding && (
        <VectorDisplay
          token={selectedToken}
          embedding={selectedEmbedding}
        />
      )}

      {/* Nearest Neighbors */}
      {selectedToken && neighbors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <h4 className="mb-3 text-sm font-medium text-slate-500">
            Similar to "{selectedToken.text}"
          </h4>
          <div className="space-y-2">
            {neighbors.map((neighbor, i) => (
              <div key={neighbor.word} className="flex items-center justify-between">
                <span className="text-slate-700">{neighbor.word}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: stepConfig.accentColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${neighbor.similarity * 100}%` }}
                      transition={{ delay: i * 0.1 }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-slate-500">
                    {(neighbor.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )

  const rightPanel = (
    <div className="flex h-full flex-col gap-4">
      {/* Semantic Space Visualization */}
      <div className="flex-1">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-slate-700">Semantic Space (Simplified 2D View)</h3>
          <p className="text-xs text-orange-600 font-medium">
            ⚠️ SIMPLIFICATION: Real embeddings have {GPT5_SPECS.embeddingDim.toLocaleString()} dimensions - we compress to 2D so you can see it!
          </p>
        </div>
        <SemanticSpace
          tokens={tokens}
          selectedIndex={selectedTokenForEmbedding}
          onTokenClick={setSelectedTokenForEmbedding}
        />
      </div>

      {/* Specs */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {GPT5_SPECS.embeddingDim.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Dimensions per token</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {GPT5_SPECS.vocabulary.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Vocabulary size</div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          Each token becomes a {GPT5_SPECS.embeddingDim}-dimensional vector
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
