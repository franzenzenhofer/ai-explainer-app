// "Try a hard one": sample texts that show where tokenization gets interesting.
import { DEFAULT_INPUT_TEXT } from '../../store/appStore'

interface SamplePrompt {
  label: string
  text: string
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  { label: 'Short sentence', text: DEFAULT_INPUT_TEXT },
  {
    label: 'Long German words',
    text: 'Künstliche Intelligenz revolutioniert unsere Weltanschauung! Der Donaudampfschifffahrtsgesellschaftskapitän sagt: Außergewöhnlich, oder?',
  },
  {
    label: 'German compounds',
    text: 'Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz und Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung',
  },
  {
    label: 'Long English words',
    text: 'Supercalifragilisticexpialidocious! Pneumonoultramicroscopicsilicovolcanoconiosis is extraordinarily long.',
  },
  { label: 'Punctuation', text: 'Hello, world! How are you? "Really?" Yes... @AI #tokens $100 50% (brackets) [more] {braces}' },
  { label: 'Code', text: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}' },
]

interface SamplePromptsProps {
  onSelect: (text: string) => void
}

export function SamplePrompts({ onSelect }: SamplePromptsProps) {
  return (
    <ul aria-label="Sample texts" className="m-0 flex list-none flex-wrap gap-2 p-0">
      {SAMPLE_PROMPTS.map((prompt) => (
        <li key={prompt.label}>
          <button
            type="button"
            onClick={() => onSelect(prompt.text)}
            className="min-h-11 rounded-[3px] border-2 border-rule px-4 text-base font-medium text-ink hover:border-ink"
          >
            {prompt.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
