// "Go deeper" extra for the Tokens slide: four words, cut by the real tokenizer.
import { useMemo } from 'react'
import { tokenize } from '../../model/tokenizer'
import { formatTokenDisplay } from '../../core/utils/formatters'

const EXAMPLE_WORDS = ['tokenization', 'embeddings', 'transformer', 'understanding']

export function TokenFacts() {
  const examples = useMemo(
    () => EXAMPLE_WORDS.map((word) => ({ word, pieces: tokenize(word).map((token) => formatTokenDisplay(token.text)) })),
    [],
  )
  return (
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
  )
}
