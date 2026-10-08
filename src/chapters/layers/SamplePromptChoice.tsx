// Shown when the prompt is not one of the sample prompts whose GPT-2 numbers were exported.
// No other prompt gets numbers: the buttons switch the shared prompt to one that has real ones.
import { useAppStore } from '../../store/appStore'
import { Button } from '../../core/components/Button'
import type { Gpt2Prompt } from '../../model/gpt2Activations'

interface SamplePromptChoiceProps {
  samples: Gpt2Prompt[]
}

export function SamplePromptChoice({ samples }: SamplePromptChoiceProps) {
  const setInputText = useAppStore((s) => s.setInputText)
  return (
    <div role="status" className="flex flex-1 flex-col justify-center rounded-xl border-2 border-dashed border-[var(--concept-soft)] bg-[var(--concept-tint)] p-5">
      <p className="m-0 text-lg text-ink">
        The real numbers for this slide were computed ahead of time for four sample prompts only. Your text is not one of them, and
        nothing is made up in its place. Pick a sample prompt:
      </p>
      <div className="mt-4 flex flex-wrap gap-2" data-primary-control>
        {samples.map((sample) => (
          <Button key={sample.prompt} onClick={() => setInputText(sample.prompt)}>
            {sample.prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}
