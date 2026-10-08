// The pipeline drawn on every slide and on the intro: nine stages in their concept colours, each
// linked to the slide that shows it, with one plain sentence for the intro.

import { MODEL_SPECS } from '../types'
import type { StageId } from '../colors'
import type { ChapterId } from './types'

export interface PipelineStage {
  id: StageId
  label: string
  chapter: ChapterId
  sentence: string
}

export const PIPELINE: readonly PipelineStage[] = [
  { id: 'text', label: 'Text', chapter: 'tokens', sentence: 'You type a prompt: the text the model will continue.' },
  { id: 'tokens', label: 'Tokens', chapter: 'tokens', sentence: 'The text is cut into tokens, each with an ID number.' },
  { id: 'numbers', label: 'Numbers', chapter: 'numbers', sentence: 'Each token becomes a fixed list of numbers.' },
  { id: 'attention', label: 'Attention', chapter: 'attention', sentence: 'Each position gathers information from earlier ones.' },
  { id: 'feedforward', label: 'Feed-forward', chapter: 'feedforward', sentence: 'Each position is then processed on its own.' },
  {
    id: 'layers',
    label: `x${MODEL_SPECS.layers} Layers`,
    chapter: 'layers',
    sentence: `Attention plus feed-forward is one block, stacked ${MODEL_SPECS.layers} times in ${MODEL_SPECS.modelName}.`,
  },
  { id: 'scores', label: 'Scores', chapter: 'scores', sentence: 'Every token in the vocabulary gets a probability.' },
  { id: 'pick', label: 'Pick', chapter: 'sampling', sentence: 'One token is picked by a weighted roll.' },
  { id: 'append', label: 'Append', chapter: 'loop', sentence: 'The pick joins the text, and it all runs again.' },
]
