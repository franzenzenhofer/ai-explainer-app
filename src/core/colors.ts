// Single source of truth for colour. Two codings, both explained in every slide's colour key:
// 1. Concept colours: one colour per stage of the pipeline, used for frames, arcs, bars and the
//    pipeline bar, so the colour always says which stage you are looking at.
// 2. Token identity colours: every token text gets its own hue, so the same token keeps its colour
//    on every slide (like the old app's token chips).

export const STAGE_IDS = ['text', 'tokens', 'numbers', 'attention', 'feedforward', 'layers', 'scores', 'pick', 'append'] as const

export type StageId = (typeof STAGE_IDS)[number]

export interface ConceptColor {
  // Saturated colour for data marks: bars, arcs, frames, fills.
  solid: string
  // Dark shade that is readable as 16px text on white and on the tint.
  strong: string
  // Very light tint for slide backgrounds and selected states.
  tint: string
  // Light shade for borders and soft fills.
  soft: string
}

export const CONCEPT_COLORS: Record<StageId, ConceptColor> = {
  text: { solid: '#64748b', strong: '#334155', tint: '#f8fafc', soft: '#cbd5e1' },
  tokens: { solid: '#2563eb', strong: '#1d4ed8', tint: '#eff6ff', soft: '#bfdbfe' },
  numbers: { solid: '#7c3aed', strong: '#6d28d9', tint: '#f5f3ff', soft: '#ddd6fe' },
  attention: { solid: '#ea580c', strong: '#c2410c', tint: '#fff7ed', soft: '#fed7aa' },
  feedforward: { solid: '#16a34a', strong: '#15803d', tint: '#f0fdf4', soft: '#bbf7d0' },
  layers: { solid: '#0d9488', strong: '#0f766e', tint: '#f0fdfa', soft: '#99f6e4' },
  scores: { solid: '#e11d48', strong: '#be123c', tint: '#fff1f2', soft: '#fecdd3' },
  pick: { solid: '#d97706', strong: '#b45309', tint: '#fffbeb', soft: '#fde68a' },
  append: { solid: '#4f46e5', strong: '#4338ca', tint: '#eef2ff', soft: '#c7d2fe' },
}

export function conceptColor(stage: StageId): ConceptColor {
  return CONCEPT_COLORS[stage]
}

// CSS custom properties for one stage: --concept, --concept-strong, --concept-tint, --concept-soft,
// and --accent (the selected-state colour every control uses) set to the readable shade.
export function conceptVars(stage: StageId): Record<string, string> {
  const color = CONCEPT_COLORS[stage]
  return {
    '--concept': color.solid,
    '--concept-strong': color.strong,
    '--concept-tint': color.tint,
    '--concept-soft': color.soft,
    '--accent': color.strong,
  }
}

const GOLDEN_RATIO = 0.618033988749895
const FULL_TURN = 360
const HASH_SEED = 2166136261
const HASH_PRIME = 16777619

// FNV-1a hash of the token text, so the same text gets the same colour in every tokenizer.
function textHash(text: string): number {
  let hash = HASH_SEED
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, HASH_PRIME) >>> 0
  }
  return hash
}

export interface TokenColor {
  hue: number
  // Chip fill, chip border and chip text; the text shade passes 4.5:1 on the fill.
  fill: string
  border: string
  text: string
  // A saturated mark in the token's hue (dots on maps, heatmap labels).
  mark: string
}

export function tokenHue(text: string): number {
  return Math.round(((textHash(text.trim().toLowerCase() || text) * GOLDEN_RATIO) % 1) * FULL_TURN)
}

export function tokenColor(text: string): TokenColor {
  const hue = tokenHue(text)
  return {
    hue,
    fill: `hsl(${hue} 90% 94%)`,
    border: `hsl(${hue} 65% 62%)`,
    text: `hsl(${hue} 80% 26%)`,
    mark: `hsl(${hue} 75% 45%)`,
  }
}
