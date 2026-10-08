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
    <div role="status">
      <p className="m-0 text-lg">
        The real numbers for this chapter were computed ahead of time for four sample prompts only. Your text is not one of them, and
        nothing is made up in its place. Pick a sample prompt:
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap" data-primary-control>
        {samples.map((sample) => (
          <Button key={sample.prompt} onClick={() => setInputText(sample.prompt)} className="max-sm:w-full">
            {sample.prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}
