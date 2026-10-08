// "Try a hard one": sample texts that show where tokenization gets interesting. Human Rights and
// Menschenrechte are Article 1 of the Universal Declaration of Human Rights; Inspiration is Robert Frost.
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
  { label: 'Inspiration', text: 'Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.' },
  {
    label: 'Human Rights',
    text: 'All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.',
  },
  {
    label: 'Menschenrechte',
    text: 'Alle Menschen sind frei und gleich an Würde und Rechten geboren. Sie sind mit Vernunft und Gewissen begabt und sollen einander im Geist der Brüderlichkeit begegnen.',
  },
]

interface SamplePromptsProps {
  onSelect: (text: string) => void
}

export function SamplePrompts({ onSelect }: SamplePromptsProps) {
  return (
    <ul aria-label="Sample texts" className="m-0 flex list-none flex-wrap content-start gap-2 p-0">
      {SAMPLE_PROMPTS.map((prompt) => (
        <li key={prompt.label}>
          <button
            type="button"
            onClick={() => onSelect(prompt.text)}
            className="min-h-11 rounded-lg border-2 bg-paper px-4 text-base font-semibold hover:bg-[var(--concept-tint)]"
            style={{ borderColor: 'var(--concept-soft)', color: 'var(--concept-strong)' }}
          >
            {prompt.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
