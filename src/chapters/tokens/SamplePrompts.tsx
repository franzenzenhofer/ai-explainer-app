// "Try a hard one": sample texts that show where tokenization gets interesting. Human Rights and
// Menschenrechte are Article 1 of the Universal Declaration of Human Rights; Inspiration is Robert Frost.
import { motion } from 'motion/react'
import { DEFAULT_INPUT_TEXT } from '../../store/appStore'

// The language tag replaces the old app's flag icons.
type SampleLanguage = 'EN' | 'DE' | 'JS'

interface SamplePrompt {
  label: string
  lang: SampleLanguage
  text: string
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  { label: 'Short sentence', lang: 'EN', text: DEFAULT_INPUT_TEXT },
  {
    label: 'Long German words',
    lang: 'DE',
    text: 'Künstliche Intelligenz revolutioniert unsere Weltanschauung! Der Donaudampfschifffahrtsgesellschaftskapitän sagt: Außergewöhnlich, oder?',
  },
  {
    label: 'German compounds',
    lang: 'DE',
    text: 'Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz und Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung',
  },
  {
    label: 'Long English words',
    lang: 'EN',
    text: 'Supercalifragilisticexpialidocious! Pneumonoultramicroscopicsilicovolcanoconiosis is extraordinarily long.',
  },
  { label: 'Punctuation', lang: 'EN', text: 'Hello, world! How are you? "Really?" Yes... @AI #tokens $100 50% (brackets) [more] {braces}' },
  { label: 'Code', lang: 'JS', text: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}' },
  { label: 'Inspiration', lang: 'EN', text: 'Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.' },
  {
    label: 'Human Rights',
    lang: 'EN',
    text: 'All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.',
  },
  {
    label: 'Menschenrechte',
    lang: 'DE',
    text: 'Alle Menschen sind frei und gleich an Würde und Rechten geboren. Sie sind mit Vernunft und Gewissen begabt und sollen einander im Geist der Brüderlichkeit begegnen.',
  },
]

const CHIP_STAGGER_S = 0.05

interface SamplePromptsProps {
  onSelect: (text: string) => void
}

export function SamplePrompts({ onSelect }: SamplePromptsProps) {
  return (
    <ul aria-label="Sample texts" className="m-0 flex list-none flex-wrap content-start gap-2 p-0">
      {SAMPLE_PROMPTS.map((prompt, index) => (
        <motion.li key={prompt.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * CHIP_STAGGER_S }}>
          <button
            type="button"
            onClick={() => onSelect(prompt.text)}
            className="min-h-11 rounded-lg border-2 bg-paper px-4 text-base font-semibold hover:bg-[var(--concept-tint)]"
            style={{ borderColor: 'var(--concept-soft)', color: 'var(--concept-strong)' }}
          >
            {prompt.label}
            <span className="ml-2 rounded px-1 text-base font-bold" style={{ background: 'var(--concept-tint)' }}>{prompt.lang}</span>
          </button>
        </motion.li>
      ))}
    </ul>
  )
}
