// Token Probability Visualization - Shows how language models store token relationships
// Uses the REAL tokenizer from the app to show ACTUAL substring tokenization!
import { useMemo } from 'react'
import { motion } from 'motion/react'
import { tokenize } from '../02-tokenization/tokenizer'

// Words that demonstrate substring tokenization
const DEMO_WORDS = ['tokenization', 'embeddings', 'transformer', 'understanding']

function TokenNode({ text, id, delay = 0 }: { text: string; id: number; delay?: number }) {
  // Highlight partial words (substrings) differently
  const isPartialWord = text.length < 4 || !text.match(/^[A-Za-z]+$/)

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className={`rounded-lg border px-2 py-1 font-mono text-xs font-medium shadow-sm ${
        isPartialWord
          ? 'border-amber-400 bg-amber-50 text-amber-800'
          : 'border-slate-300 bg-white text-slate-700'
      }`}>
        {`{${text.replace(/^ /, '·')}}`}
      </div>
      <span className="font-mono text-[9px] text-slate-400">[{id}]</span>
    </motion.div>
  )
}

export function TokenProbabilityGraphic() {
  // Use REAL tokenization from the app!
  const allTokens = useMemo(() => {
    const tokens: Array<{ text: string; id: number }> = []
    for (const word of DEMO_WORDS) {
      const wordTokens = tokenize(word)
      for (const t of wordTokens) {
        tokens.push({ text: t.text, id: t.tokenId })
      }
    }
    return tokens
  }, [])

  // Pick center and surrounding tokens
  const centerToken = allTokens[0] // "token" from "tokenization"
  const surroundingTokens = allTokens.slice(1, 9).map((t, i) => ({
    ...t,
    angle: i * 45,
  }))

  const radius = 110

  return (
    <motion.div
      className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Title */}
      <h3 className="mb-1 text-center text-base font-semibold text-slate-800">
        The One Idea: Predict the Next Token
      </h3>
      <p className="mb-1 text-center text-xs text-slate-500">
        The AI knows a probability between every token and every other token — about 200,000 in total.
      </p>
      <p className="mb-3 text-center text-[11px] font-medium text-amber-600">
        A token is a piece of text. "tokenization" → "token" + "ization"
      </p>

      {/* Graphic */}
      <div className="relative mx-auto" style={{ width: 300, height: 300 }}>
        {/* SVG for arrows */}
        <svg className="absolute inset-0" width={300} height={300}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>
          {surroundingTokens.map((token, i) => {
            const angleRad = (token.angle * Math.PI) / 180
            const endX = 150 + Math.cos(angleRad) * (radius - 25)
            const endY = 150 + Math.sin(angleRad) * (radius - 25)
            const startX = 150 + Math.cos(angleRad) * 40
            const startY = 150 + Math.sin(angleRad) * 40
            return (
              <motion.line
                key={`${token.id}-${i}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#cbd5e1"
                strokeWidth={1.5}
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.05, duration: 0.4 }}
              />
            )
          })}
        </svg>

        {/* Center token */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="rounded-xl border-2 border-blue-400 bg-blue-50 px-3 py-1.5 font-mono text-sm font-bold text-blue-700 shadow-md">
              {`{${centerToken?.text || 'token'}}`}
            </div>
            <span className="font-mono text-[10px] font-semibold text-blue-600">
              [{centerToken?.id || 10346}]
            </span>
          </motion.div>
        </div>

        {/* Surrounding tokens */}
        {surroundingTokens.map((token, i) => {
          const angleRad = (token.angle * Math.PI) / 180
          const x = 150 + Math.cos(angleRad) * radius
          const y = 150 + Math.sin(angleRad) * radius
          return (
            <div
              key={`${token.id}-${i}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <TokenNode text={token.text} id={token.id} delay={0.5 + i * 0.08} />
            </div>
          )
        })}
      </div>

      {/* Caption showing the actual tokenization */}
      <div className="mt-2 space-y-1 text-center">
        <p className="text-[10px] text-slate-400">
          Real substring tokenization:
        </p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px]">
          {DEMO_WORDS.map((word) => {
            const tokens = tokenize(word)
            return (
              <span key={word} className="text-slate-500">
                "{word}" → {tokens.map((t) => `{${t.text}}`).join('+')}
              </span>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
