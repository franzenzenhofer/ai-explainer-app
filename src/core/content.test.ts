// Content tests: they read the real source files and the real components. No mocks.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MODEL_SPECS, TOKENIZER_SPECS } from './types'
import { ProvenanceBadge } from './components/ProvenanceBadge'

const SRC_ROOT = join(process.cwd(), 'src')

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return listSourceFiles(path)
    const isSource = /\.(ts|tsx|astro)$/.test(entry) && !/\.test\.tsx?$/.test(entry)
    return isSource ? [path] : []
  })
}

const sourceFiles = listSourceFiles(SRC_ROOT)
const read = (path: string) => readFileSync(path, 'utf8')
const shortName = (path: string) => relative(SRC_ROOT, path)

const VISUALIZATIONS = [
  'steps/03-embeddings/SemanticSpace',
  'steps/03-embeddings/VectorDisplay',
  'steps/04-attention/AttentionHeatmap',
  'steps/04-attention/AttentionNetwork',
  'steps/05-prediction/PredictionNetwork',
  'steps/05-prediction/ProbabilityChart',
  'steps/06-generation/TokenFlow',
]

describe('provenance badges', () => {
  it('renders exactly "Real" or "Simulated"', () => {
    expect(renderToStaticMarkup(createElement(ProvenanceBadge, { provenance: 'real' }))).toContain('>Real<')
    expect(renderToStaticMarkup(createElement(ProvenanceBadge, { provenance: 'simulated' }))).toContain('>Simulated<')
  })

  it.each(VISUALIZATIONS)('%s exports a provenance constant', async (module) => {
    const loaded = (await import(`../${module}`)) as { provenance?: unknown }
    expect(['real', 'simulated']).toContain(loaded.provenance)
  })

  it.each(VISUALIZATIONS)('%s renders the badge with its own provenance', (module) => {
    const source = read(join(SRC_ROOT, `${module}.tsx`))
    expect(source).toContain('<ProvenanceBadge provenance={provenance} />')
  })
})

describe('numbers policy', () => {
  it('describes the GPT-2 small demo model', () => {
    expect(MODEL_SPECS).toEqual({ modelName: 'GPT-2 small', embeddingDim: 768, layers: 12, headsPerLayer: 12 })
  })

  it('labels the vocabulary as the tokenizer vocabulary', () => {
    expect(TOKENIZER_SPECS.name).toBe('o200k_base')
    expect(TOKENIZER_SPECS.vocabulary).toBe(199_998)
    expect(MODEL_SPECS).not.toHaveProperty('vocabulary')
  })

  it('shows MODEL_SPECS.modelName wherever MODEL_SPECS numbers are shown', () => {
    const showsNumbers = (path: string) => path.endsWith('.tsx') || path.endsWith('useStep.ts')
    const offenders = sourceFiles
      .filter(showsNumbers)
      .filter((path) => /MODEL_SPECS\.(embeddingDim|layers|headsPerLayer)/.test(read(path)))
      .filter((path) => !read(path).includes('MODEL_SPECS.modelName'))
      .map(shortName)
    expect(offenders).toEqual([])
  })
})

describe('learner-facing copy', () => {
  const FORBIDDEN = [
    '4096',
    '4,096',
    'every other token',
    'cannot actually calculate',
    'same one used by ChatGPT',
    'Prediction Engine',
    'every token and every other token',
    '"Groß", "mutter"',
    "'Groß', 'mutter'",
  ]

  it.each(FORBIDDEN)('contains no %j', (phrase) => {
    const offenders = sourceFiles.filter((path) => read(path).includes(phrase)).map(shortName)
    expect(offenders).toEqual([])
  })

  it('contains no em dash or en dash', () => {
    const offenders = sourceFiles.filter((path) => /[–—]/.test(read(path))).map(shortName)
    expect(offenders).toEqual([])
  })
})
