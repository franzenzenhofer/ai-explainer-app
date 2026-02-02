// Main App Component - Orchestrates all steps
import { useStep } from '../core/hooks/useStep'
import { StepNavigation } from '../core/components'

// Step components
import { InputStep } from '../steps/01-input/InputStep'
import { TokenizationStep } from '../steps/02-tokenization/TokenizationStep'
import { EmbeddingsStep } from '../steps/03-embeddings/EmbeddingsStep'
import { AttentionStep } from '../steps/04-attention/AttentionStep'
import { PredictionStep } from '../steps/05-prediction/PredictionStep'
import { GenerationStep } from '../steps/06-generation/GenerationStep'
import { UnderstandingStep } from '../steps/07-understanding/UnderstandingStep'

const STEP_COMPONENTS = [
  InputStep,
  TokenizationStep,
  EmbeddingsStep,
  AttentionStep,
  PredictionStep,
  GenerationStep,
  UnderstandingStep,
] as const

export function App() {
  const { currentStep, stepConfig, totalSteps } = useStep()

  const StepComponent = STEP_COMPONENTS[currentStep]

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <StepComponent
          key={currentStep}
          stepNumber={currentStep + 1}
          totalSteps={totalSteps}
          stepConfig={stepConfig}
        />
      </main>

      {/* Bottom Navigation */}
      <StepNavigation />
    </div>
  )
}
