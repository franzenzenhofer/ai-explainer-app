// Single source of truth for the ten chapters: route, name, claim, accent, drawer, sources.

import { LARGE_MODEL_SPECS, MODEL_SPECS } from '../types'
import { DRAWERS } from './drawers'
import { CHAPTER_IDS, type Chapter, type ChapterId } from './types'

const DEMO = MODEL_SPECS.modelName
const VOCABULARY_ROUNDED = 'about 200,000'

export const CHAPTERS: readonly Chapter[] = [
  {
    id: 'home',
    route: '/',
    name: 'The token machine',
    claim: 'A language model predicts the next token. Then it does it again.',
    lookFor: 'Press the button and watch one piece of text join the end each time.',
    accent: '#1d4ed8',
    promptPlacement: 'none',
    drawerTitle: 'Go deeper: what one press does',
    drawer: DRAWERS.home,
    sources: ['gptLoop', 'gpt3Abstract'],
  },
  {
    id: 'tokens',
    route: '/tokens',
    name: 'Your text becomes tokens',
    claim: `The model reads pieces of text from a fixed list of ${VOCABULARY_ROUNDED}.`,
    lookFor: 'Tap a token to see its ID. Long or rare words fall apart into several pieces.',
    accent: '#c2410c',
    promptPlacement: 'body',
    drawerTitle: 'Go deeper: how the list was built',
    drawer: DRAWERS.tokens,
    sources: ['tiktoken', 'sennrich', 'minbpe'],
  },
  {
    id: 'numbers',
    route: '/numbers',
    name: 'Each token becomes numbers',
    claim: `Every token ID is swapped for a list of ${MODEL_SPECS.embeddingDim} numbers (${DEMO}, the demo model).`,
    lookFor: 'Tap a token to see its whole list and the tokens with the most similar lists. The same token always gets the same list.',
    accent: '#7c3aed',
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: where the numbers come from',
    drawer: DRAWERS.numbers,
    sources: ['gptVectors', 'vaswaniPosition', 'gpt3Table'],
  },
  {
    id: 'attention',
    route: '/attention',
    name: 'Looking back',
    claim: 'Each position gathers information from the positions before it.',
    lookFor: 'Tap a token: every arc runs to the left, never to the right.',
    accent: '#047857',
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: keys, queries, heads',
    drawer: DRAWERS.attention,
    sources: ['vaswaniMask', 'attentionMask', 'circuitsFramework', 'inductionHeads'],
  },
  {
    id: 'feedforward',
    route: '/feedforward',
    name: 'Thinking alone',
    claim: 'Each position is then processed on its own by the same small network.',
    lookFor: 'Run the block: every column changes at once, and no line connects two columns.',
    accent: '#b45309',
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: inside the feed-forward step',
    drawer: DRAWERS.feedforward,
    sources: ['vaswaniFeedForward', 'mlpFacts'],
  },
  {
    id: 'layers',
    route: '/layers',
    name: 'Stacking',
    claim: `Attention plus feed-forward is one block; ${DEMO} stacks ${MODEL_SPECS.layers} of them (${LARGE_MODEL_SPECS.layers} in ${LARGE_MODEL_SPECS.modelName}).`,
    lookFor: 'Step through the blocks and watch the last position\'s numbers grow and change at every block.',
    accent: '#0e7490',
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: the residual stream',
    drawer: DRAWERS.layers,
    sources: ['vaswaniResidual', 'residualStream', 'gpt3Layers', 'gpt3Table'],
  },
  {
    id: 'scores',
    route: '/scores',
    name: 'One score for every token',
    claim: 'The last vector is scored against every token in the vocabulary; softmax makes the scores probabilities.',
    lookFor: 'Look at the last bar: all remaining tokens of the vocabulary together.',
    accent: '#be123c',
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: logits and softmax',
    drawer: DRAWERS.scores,
    sources: ['vaswaniSoftmax', 'unembedding'],
  },
  {
    id: 'sampling',
    route: '/sampling',
    name: 'Rolling the dice',
    claim: 'A token is picked from the list by a weighted roll; three settings shape the roll.',
    lookFor: 'Press Pick again: the same list gives different picks.',
    accent: '#4d7c0f',
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: why not always the top token',
    drawer: DRAWERS.sampling,
    sources: ['nucleusSampling', 'temperature', 'openRouterParameters'],
  },
  {
    id: 'loop',
    route: '/loop',
    name: 'Append and repeat',
    claim: 'The pick is added to the text and everything runs again.',
    lookFor: 'Each new token becomes part of the text that the next run reads.',
    accent: '#4338ca',
    promptPlacement: 'topBar',
    drawerTitle: 'Go deeper: stopping and streaming',
    drawer: DRAWERS.loop,
    sources: ['gptLoop', 'gpt3Abstract', 'nanoGpt'],
  },
  {
    id: 'reality',
    route: '/reality',
    name: 'What this means',
    claim: 'Likely is not the same as true; the model\'s story about its own steps is not evidence.',
    lookFor: 'Run an experiment, read the live answer, and judge it yourself.',
    accent: '#a21caf',
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
