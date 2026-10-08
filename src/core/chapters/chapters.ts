// Single source of truth for the eleven slides: route, name, claim, stage, explanation, colour key, drawer, sources.

import type { StageId } from '../colors'
import { LARGE_MODEL_SPECS, MODEL_SPECS } from '../types'
import { COLOR_KEYS } from './colorKeys'
import { DRAWERS } from './drawers'
import { EXPLANATIONS } from './explanations'
import { CHAPTER_IDS, type Chapter, type ChapterId } from './types'

const DEMO = MODEL_SPECS.modelName
const VOCABULARY_ROUNDED = 'about 200,000'

export const CHAPTERS: readonly Chapter[] = [
  {
    id: 'intro',
    route: '/',
    name: 'What you will see',
    shortName: 'Intro',
    claim: 'How a language model writes: one token at a time, in nine stages.',
    lookFor: 'Press Start, or use the arrow keys. F switches to full screen.',
    stage: null,
    explain: EXPLANATIONS.intro,
    colorKey: COLOR_KEYS.intro,
    promptPlacement: 'none',
    drawerTitle: 'Go deeper: how to use this presentation',
    drawer: DRAWERS.intro,
    sources: ['gptLoop', 'gpt3Abstract'],
  },
  {
    id: 'home',
    route: '/machine',
    name: 'The token machine',
    shortName: 'Machine',
    claim: 'A language model predicts the next token. Then it does it again.',
    lookFor: 'Press the button and watch one piece of text join the end each time.',
    stage: null,
    explain: EXPLANATIONS.home,
    colorKey: COLOR_KEYS.home,
    promptPlacement: 'none',
    drawerTitle: 'Go deeper: what one press does',
    drawer: DRAWERS.home,
    sources: ['gptLoop', 'gpt3Abstract'],
  },
  {
    id: 'tokens',
    route: '/tokens',
    name: 'Your text becomes tokens',
    shortName: 'Tokens',
    claim: `The model reads pieces of text from a fixed list of ${VOCABULARY_ROUNDED}.`,
    lookFor: 'Tap a token to see its ID. Long or rare words fall apart into several pieces.',
    stage: 'tokens',
    explain: EXPLANATIONS.tokens,
    colorKey: COLOR_KEYS.tokens,
    promptPlacement: 'body',
    drawerTitle: 'Go deeper: how the list was built',
    drawer: DRAWERS.tokens,
    sources: ['tiktoken', 'sennrich', 'minbpe'],
  },
  {
    id: 'numbers',
    route: '/numbers',
    name: 'Each token becomes numbers',
    shortName: 'Numbers',
    claim: `Every token ID is swapped for a list of ${MODEL_SPECS.embeddingDim} numbers (${DEMO}, the demo model).`,
    lookFor: 'Tap a token to see its whole list and the tokens with the most similar lists. The same token always gets the same list.',
    stage: 'numbers',
    explain: EXPLANATIONS.numbers,
    colorKey: COLOR_KEYS.numbers,
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: where the numbers come from',
    drawer: DRAWERS.numbers,
    sources: ['gptVectors', 'vaswaniPosition', 'gpt3Table'],
  },
  {
    id: 'attention',
    route: '/attention',
    name: 'Looking back',
    shortName: 'Attention',
    claim: 'Each position gathers information from the positions before it.',
    lookFor: 'Tap a token: every arc runs to the left, never to the right.',
    stage: 'attention',
    explain: EXPLANATIONS.attention,
    colorKey: COLOR_KEYS.attention,
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: keys, queries, heads',
    drawer: DRAWERS.attention,
    sources: ['vaswaniMask', 'attentionMask', 'circuitsFramework', 'inductionHeads'],
  },
  {
    id: 'feedforward',
    route: '/feedforward',
    name: 'Thinking alone',
    shortName: 'Feed-forward',
    claim: 'Each position is then processed on its own by the same small network.',
    lookFor: 'Run the block: every column changes at once, and no line connects two columns.',
    stage: 'feedforward',
    explain: EXPLANATIONS.feedforward,
    colorKey: COLOR_KEYS.feedforward,
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: inside the feed-forward step',
    drawer: DRAWERS.feedforward,
    sources: ['vaswaniFeedForward', 'mlpFacts'],
  },
  {
    id: 'layers',
    route: '/layers',
    name: 'Stacking',
    shortName: 'Layers',
    claim: `Attention plus feed-forward is one block; ${DEMO} stacks ${MODEL_SPECS.layers} of them (${LARGE_MODEL_SPECS.layers} in ${LARGE_MODEL_SPECS.modelName}).`,
    lookFor: 'Step through the blocks and watch the last position\'s numbers grow and change at every block.',
    stage: 'layers',
    explain: EXPLANATIONS.layers,
    colorKey: COLOR_KEYS.layers,
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: the residual stream',
    drawer: DRAWERS.layers,
    sources: ['vaswaniResidual', 'residualStream', 'gpt3Layers', 'gpt3Table'],
  },
  {
    id: 'scores',
    route: '/scores',
    name: 'One score for every token',
    shortName: 'Scores',
    claim: 'The last vector is scored against every token in the vocabulary; softmax makes the scores probabilities.',
    lookFor: 'Look at the last bar: all remaining tokens of the vocabulary together.',
    stage: 'scores',
    explain: EXPLANATIONS.scores,
    colorKey: COLOR_KEYS.scores,
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: logits and softmax',
    drawer: DRAWERS.scores,
    sources: ['vaswaniSoftmax', 'unembedding'],
  },
  {
    id: 'sampling',
    route: '/sampling',
    name: 'Rolling the dice',
    shortName: 'Sampling',
    claim: 'A token is picked from the list by a weighted roll; three settings shape the roll.',
    lookFor: 'Press Pick again: the same list gives different picks.',
    stage: 'pick',
    explain: EXPLANATIONS.sampling,
    colorKey: COLOR_KEYS.sampling,
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: why not always the top token',
    drawer: DRAWERS.sampling,
    sources: ['nucleusSampling', 'temperature', 'openRouterParameters'],
  },
  {
    id: 'loop',
    route: '/loop',
    name: 'Append and repeat',
    shortName: 'Loop',
    claim: 'The pick is added to the text and everything runs again.',
    lookFor: 'Each new token becomes part of the text that the next run reads.',
    stage: 'append',
    explain: EXPLANATIONS.loop,
    colorKey: COLOR_KEYS.loop,
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: stopping and streaming',
    drawer: DRAWERS.loop,
    sources: ['gptLoop', 'gpt3Abstract', 'nanoGpt'],
  },
  {
    id: 'reality',
    route: '/reality',
    name: 'What this means',
    shortName: 'Reality',
    claim: 'Likely is not the same as true; the model\'s story about its own steps is not evidence.',
    lookFor: 'Run an experiment, read the live answer, and judge it yourself.',
    stage: null,
    explain: EXPLANATIONS.reality,
    colorKey: COLOR_KEYS.reality,
    promptPlacement: 'none',
    drawerTitle: 'Go deeper: the debate',
    drawer: DRAWERS.reality,
    sources: ['biologyAddition', 'stochasticParrot'],
  },
]

export function getChapter(id: ChapterId): Chapter {
  const chapter = CHAPTERS.find((candidate) => candidate.id === id)
  if (!chapter) throw new Error(`Unknown chapter id: ${id}`)
  return chapter
}

export function chapterIndex(id: ChapterId): number {
  return CHAPTER_IDS.indexOf(id)
}

export function neighbourChapter(id: ChapterId, offset: number): Chapter | null {
  return CHAPTERS[chapterIndex(id) + offset] ?? null
}

// Matches "/tokens", "/tokens/" and "/tokens/index.html" to the tokens chapter.
export function chapterFromPath(pathname: string): Chapter | null {
  const trimmed = pathname.replace(/index\.html$/, '').replace(/\/+$/, '')
  const route = trimmed === '' ? '/' : trimmed
  return CHAPTERS.find((chapter) => chapter.route === route) ?? null
}

// The Astro slug for a chapter: undefined for the home route, the route without its slash otherwise.
export function chapterSlug(chapter: Chapter): string | undefined {
  return chapter.route === '/' ? undefined : chapter.route.slice(1)
}

// The colour a slide is tinted in: its stage, or a fixed one for slides about the whole machine.
export function themeOf(chapter: Chapter): StageId {
  if (chapter.stage) return chapter.stage
  return chapter.id === 'reality' ? 'scores' : 'append'
}
