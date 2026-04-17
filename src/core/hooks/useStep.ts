// Hook for step navigation and state

import { useCallback, useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import type { StepConfig, StepId, EducationalContent } from '../types'
import { STEP_COLORS } from '../utils/colors'

// Step configurations
const STEPS: StepConfig[] = [
  {
    id: 'intro',
    title: 'Welcome',
    subtitle: 'AI Is One Thing: Next-Token Prediction',
    accentColor: STEP_COLORS.intro,
    educational: {
      what: 'An AI like ChatGPT has exactly one job: look at the text so far, and predict the next small piece of text.',
      how: 'It repeats that prediction over and over. Each new piece is added to the text, then the AI predicts the next one.',
      why: 'Everything the AI does — writing, answering, translating, coding — is built on this single mechanism.',
    },
  },
  {
    id: 'input',
    title: 'Input',
    subtitle: 'The Text the AI Will Continue',
    accentColor: STEP_COLORS.input,
    educational: {
      what: 'Your prompt is simply the starting text. The AI\'s job is to continue it, one small piece at a time.',
      how: 'Before anything else happens, the AI must convert your text into numbers. It cannot work with letters directly.',
      why: 'More context in your prompt means better predictions. The AI has no memory — only the text in front of it right now.',
    },
  },
  {
    id: 'tokenization',
    title: 'Tokenization',
    subtitle: 'Splitting Text into Tokens',
    accentColor: STEP_COLORS.tokenization,
    educational: {
      what: 'The text is split into small pieces called tokens. A token can be a whole word, part of a word, or punctuation.',
      how: 'Each token has a fixed ID number. The word "tokenization" becomes two tokens: "token" and "ization".',
      why: 'Tokens are what the AI actually predicts. From here on, no more letters or words — only numbered tokens.',
    },
  },
  {
    id: 'embeddings',
    title: 'Embeddings',
    subtitle: 'Every Token Becomes Numbers',
    accentColor: STEP_COLORS.embeddings,
    educational: {
      what: 'Each token is turned into a long list of numbers — thousands of them — that represent what the token "means".',
      how: 'These numbers were learned from huge amounts of text: tokens used in similar situations end up with similar numbers.',
      why: 'The AI cannot compare letters, but it can compare numbers. Everything from here on is pure math.',
    },
  },
  {
    id: 'attention',
    title: 'Attention',
    subtitle: 'Tokens Look at Each Other',
    accentColor: STEP_COLORS.attention,
    educational: {
      what: 'Before predicting, every token checks every other token and decides which ones matter most for its meaning.',
      how: 'Stronger links get more weight, weaker links get less. This happens many times in parallel, layer after layer.',
      why: 'That\'s how the AI knows that "it" refers to "the dog" from earlier in your text. Context is calculated each time.',
    },
  },
  {
    id: 'prediction',
    title: 'Prediction',
    subtitle: 'Probabilities for Every Next Token',
    accentColor: STEP_COLORS.prediction,
    educational: {
      what: 'The AI gives every possible next token (around 200,000 options) a probability of being the right one.',
      how: 'Settings like Temperature decide whether the AI picks the most likely token, or samples from the likely ones.',
      why: 'This probability list is the heart of AI. Everything else — writing essays, answering questions — reuses this step.',
    },
  },
  {
    id: 'generation',
    title: 'Generation',
    subtitle: 'One Token, Then the Next, Then the Next',
    accentColor: STEP_COLORS.generation,
    educational: {
      what: 'The AI writes by looping: predict one token, add it to the text, then predict the next one based on the new text.',
      how: 'The whole pipeline runs again for every single token. The AI never plans the full answer in advance.',
      why: 'That\'s why the answer appears piece by piece. There is no finished draft hidden anywhere — each token is decided live.',
    },
  },
  {
    id: 'understanding',
    title: 'Reality Check',
    subtitle: 'Very Good Prediction, Not Understanding',
    accentColor: STEP_COLORS.understanding,
    educational: {
      what: 'The AI does not think, feel, or know things. It is an extremely powerful next-token predictor, nothing more.',
      how: 'It produces confident, fluent text because confident, fluent text is what it was trained on — not because it understands.',
      why: 'When the AI is wrong, it is still just picking likely-looking tokens. Likely is not the same as correct.',
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
