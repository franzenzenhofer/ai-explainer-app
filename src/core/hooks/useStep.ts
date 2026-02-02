// Hook for step navigation and state

import { useCallback, useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import type { StepConfig, StepId, EducationalContent } from '../types'
import { STEP_COLORS } from '../utils/colors'

// Step configurations
const STEPS: StepConfig[] = [
  {
    id: 'input',
    title: 'Input',
    subtitle: 'Enter Your Prompt',
    accentColor: STEP_COLORS.input,
    educational: {
      what: 'A prompt is the starting text for the AI - your question or instruction.',
      how: 'The AI cannot read text like humans - it must first convert it into numbers.',
      why: 'The quality of your input directly affects the quality of the output.',
    },
  },
  {
    id: 'tokenization',
    title: 'Tokenization',
    subtitle: 'Breaking Text into Pieces',
    accentColor: STEP_COLORS.tokenization,
    educational: {
      what: 'Tokens are the "alphabet" of AI - not letters, not words, but subword units.',
      how: 'BPE algorithm merges frequent character pairs. "Großmutter" → ["Groß", "mutter"]',
      why: 'Balance between vocabulary size (200K tokens) and flexibility to handle any text.',
    },
  },
  {
    id: 'embeddings',
    title: 'Embeddings',
    subtitle: 'Words Become Vectors',
    accentColor: STEP_COLORS.embeddings,
    educational: {
      what: 'Each token becomes 4096 numbers (a vector) representing its meaning.',
      how: 'Embedding lookup table learned during training. Similar words = similar vectors.',
      why: 'Math works with numbers, not words. Vectors enable semantic calculations.',
    },
  },
  {
    id: 'attention',
    title: 'Attention',
    subtitle: 'Context Understanding',
    accentColor: STEP_COLORS.attention,
    educational: {
      what: 'Every token "looks at" all other tokens simultaneously to understand context.',
      how: 'Query × Key → Weights, then Weights × Value → contextualized output.',
      why: 'Enables "it" to know it refers to "dog" even sentences apart.',
    },
  },
  {
    id: 'prediction',
    title: 'Prediction',
    subtitle: 'Calculating Probabilities',
    accentColor: STEP_COLORS.prediction,
    educational: {
      what: 'The model outputs a probability for EVERY token in its 200,000 vocabulary.',
      how: 'Linear projection (4096 → 200K) then Softmax to get probabilities.',
      why: 'Enables both deterministic (greedy) and creative (sampling) generation.',
    },
  },
  {
    id: 'generation',
    title: 'Generation',
    subtitle: 'Token by Token',
    accentColor: STEP_COLORS.generation,
    educational: {
      what: 'LLMs generate ONE token at a time, then the entire process repeats.',
      how: 'New token joins input → full transformer runs again → next token.',
      why: 'This is why streaming works - each token is complete and independent.',
    },
  },
  {
    id: 'understanding',
    title: 'Understanding',
    subtitle: 'Pattern vs Meaning',
    accentColor: STEP_COLORS.understanding,
    educational: {
      what: 'AI does not understand - it follows statistical patterns learned from text.',
      how: 'Training = absorbing patterns from billions of texts. No true comprehension.',
      why: 'Explains hallucinations and limitations. "Stochastic Parrot" debate.',
    },
  },
]

export function useStep() {
  const currentStep = useAppStore((s) => s.currentStep)
  const setCurrentStep = useAppStore((s) => s.setCurrentStep)
  const nextStep = useAppStore((s) => s.nextStep)
  const prevStep = useAppStore((s) => s.prevStep)

  const stepConfig = useMemo(() => STEPS[currentStep], [currentStep])

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === STEPS.length - 1

  const goToStep = useCallback((stepId: StepId) => {
    const index = STEPS.findIndex((s) => s.id === stepId)
    if (index !== -1) {
      setCurrentStep(index)
    }
  }, [setCurrentStep])

  const getStepByIndex = useCallback((index: number): StepConfig | undefined => {
    return STEPS[index]
  }, [])

  const allSteps = STEPS

  return {
    currentStep,
    stepConfig,
    allSteps,
    isFirstStep,
    isLastStep,
    setCurrentStep,
    nextStep,
    prevStep,
    goToStep,
    getStepByIndex,
    totalSteps: STEPS.length,
  }
}

export function getEducationalContent(stepId: StepId): EducationalContent {
  const step = STEPS.find((s) => s.id === stepId)
  return step?.educational ?? { what: '', how: '', why: '' }
}
