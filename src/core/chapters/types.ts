// Types for the chapter config: one chapter = one route, one claim, one drawer, a sources line.

import type { SourceKey } from './sources'

export const CHAPTER_IDS = [
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

// Where the shared prompt is edited on a chapter: in the chapter body, in the top bar, or not at all.
export type PromptPlacement = 'body' | 'topBar' | 'none'

export interface DrawerSection {
  heading: string
  paragraphs: string[]
}

export interface Chapter {
  id: ChapterId
  route: string
  name: string
  // The one claim of the chapter, shown once at the top.
  claim: string
  // One sentence that tells the reader what to look for in the visual.
  lookFor: string
  // Highlight colour for this chapter's selected and active states only.
  accent: string
  promptPlacement: PromptPlacement
  drawerTitle: string
  drawer: DrawerSection[]
  sources: SourceKey[]
}
