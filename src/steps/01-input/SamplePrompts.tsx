// SamplePrompts - Pre-defined example prompts
import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'

interface SamplePromptsProps {
  onSelect: (text: string) => void
}

const SAMPLE_PROMPTS = [
  {
    label: 'Human Rights',
    text: 'All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.',
    lang: 'en',
    highlight: true,
  },
  {
    label: 'Menschenrechte',
    text: 'Alle Menschen sind frei und gleich an Würde und Rechten geboren. Sie sind mit Vernunft und Gewissen begabt und sollen einander im Geist der Brüderlichkeit begegnen.',
    lang: 'de',
  },
  {
    label: 'Fairy Tale',
    text: 'Es war einmal eine kleine Prinzessin, die in einem großen Schloss lebte.',
    lang: 'de',
  },
  {
    label: 'Science',
    text: 'Explain quantum entanglement in simple terms.',
    lang: 'en',
  },
  {
    label: 'Code',
    text: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
    lang: 'code',
  },
  {
    label: 'Geography',
    text: 'The capital of France is',
    lang: 'en',
  },
]

export function SamplePrompts({ onSelect }: SamplePromptsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Sparkles className="h-3 w-3" />
        <span>Try an example</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((prompt, index) => (
          <motion.button
            key={prompt.label}
            onClick={() => onSelect(prompt.text)}
            className={`group rounded-lg border px-3 py-1.5 text-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
              prompt.highlight
                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="font-medium">{prompt.label}</span>
            <span className="ml-1.5 opacity-60">
              {prompt.lang === 'de' ? '🇩🇪' : prompt.lang === 'code' ? '💻' : '🇬🇧'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
