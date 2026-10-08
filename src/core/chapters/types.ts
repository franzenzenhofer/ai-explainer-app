// Types for the slide config: one slide = one route, one claim, one visible explanation, a colour key,
// one "Go deeper" overlay and a sources list.

import type { StageId } from '../colors'
import type { SourceKey } from './sources'

export const CHAPTER_IDS = [
  'intro',
  'home',
  'tokens',
  'numbers',
  'attention',
  'feedforward',
  'layers',
  'scores',
  'sampling',
  'loop',
  'reality',
] as const

export type ChapterId = (typeof CHAPTER_IDS)[number]

// Where the shared prompt is edited on a slide: in the slide body, in the side panel, or not at all.
export type PromptPlacement = 'body' | 'topBar' | 'none'

export interface DrawerSection {
  heading: string
  paragraphs: string[]
}

// The explanation shown on the slide itself: what happens, how, and why it matters.
export interface Explanation {
  what: string
  how: string
  why: string
}

// How a colour-key entry draws its sample.
export type KeyMark = 'chips' | 'id' | 'bar' | 'arc' | 'cell' | 'frame' | 'dot' | 'dashed' | 'grey'

export interface ColorKeyEntry {
  // The concept colour of the sample, or 'identity' for the per-token colours.
  color: StageId | 'identity'
  mark: KeyMark
  label: string
}

export interface Chapter {
  id: ChapterId
  route: string
  name: string
  // One or two words for the dots, the Next button and the pipeline.
  shortName: string
  // The one claim of the slide, shown as its title (two lines at most).
  claim: string
  // One sentence that tells the reader what to try in the visual.
  lookFor: string
  // The pipeline stage this slide shows, or null for slides about the whole machine.
  stage: StageId | null
  explain: Explanation
  colorKey: ColorKeyEntry[]
  promptPlacement: PromptPlacement
  drawerTitle: string
  drawer: DrawerSection[]
  sources: SourceKey[]
}
