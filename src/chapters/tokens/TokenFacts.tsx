// Drawer extras for the Tokens chapter: characters and words next to tokens, and four real examples.
import { useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { countWords, tokenize } from '../../model/tokenizer'
import { formatTokenDisplay } from '../../core/utils/formatters'

const EXAMPLE_WORDS = ['tokenization', 'embeddings', 'transformer', 'understanding']

export function TokenFacts() {
  const inputText = useAppStore((s) => s.inputText)
  const tokens = useTokens()
  const examples = useMemo(
    () => EXAMPLE_WORDS.map((word) => ({ word, pieces: tokenize(word).map((token) => formatTokenDisplay(token.text)) })),
    [],
  )
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h3 className="m-0 mb-2 text-lg font-semibold">Your text in three counts</h3>
        <dl className="m-0 grid grid-cols-3 gap-4">
          {[
            ['Characters', inputText.length],
            ['Words', countWords(inputText)],
            ['Tokens', tokens.length],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-base text-ink-2">{label}</dt>
              <dd className="m-0 font-serif text-3xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h3 className="m-0 mb-2 text-lg font-semibold">Four words, cut by the real tokenizer</h3>
        <ul className="m-0 list-none space-y-1 p-0 text-base">
          {examples.map(({ word, pieces }) => (
            <li key={word}>
              <span className="font-semibold">{word}</span>
              <span className="text-ink-2">{' → '}{pieces.join(' | ')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
