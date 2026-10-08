// Content tests: they read the real chapter config, the real source files and render the real
// components. No mocks.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MODEL_SPECS, TOKENIZER_SPECS } from './types'
import { ProvenanceBadge } from './components/ProvenanceBadge'
import { ChapterLayout } from './components/ChapterLayout'
import { CHAPTERS, CHAPTER_IDS, SOURCES, chapterFromPath } from './chapters'
import { KNOWN_HEAD_TYPES } from '../chapters/attention/headTypes'
import { CHAPTER_COMPONENTS } from '../components/App'

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

// Section 4 of the plan: the ten routes, in order.
const PLAN_ROUTES = ['/', '/tokens', '/numbers', '/attention', '/feedforward', '/layers', '/scores', '/sampling', '/loop', '/reality']

describe('chapter config', () => {
  it('has the ten chapters with the routes from the plan, in order', () => {
    expect(CHAPTERS.map((chapter) => chapter.route)).toEqual(PLAN_ROUTES)
    expect(CHAPTERS.map((chapter) => chapter.id)).toEqual([...CHAPTER_IDS])
  })

  it.each(CHAPTERS.map((chapter) => [chapter.id, chapter] as const))('%s has a claim, a look-for line, a drawer and sources', (_id, chapter) => {
    expect(chapter.claim.trim().length).toBeGreaterThan(20)
    expect(chapter.lookFor.trim().length).toBeGreaterThan(10)
    expect(chapter.drawer.length).toBeGreaterThan(0)
    for (const section of chapter.drawer) expect(section.paragraphs.length).toBeGreaterThan(0)
    expect(chapter.sources.length).toBeGreaterThan(0)
    expect(chapter.sources.some((key) => SOURCES[key].url.includes('#:~:text='))).toBe(true)
  })

  it('has a component for every chapter', () => {
    expect(Object.keys(CHAPTER_COMPONENTS).sort()).toEqual([...CHAPTER_IDS].sort())
  })

  it('finds the chapter for a path with or without a trailing slash', () => {
    expect(chapterFromPath('/tokens')?.id).toBe('tokens')
    expect(chapterFromPath('/tokens/')?.id).toBe('tokens')
    expect(chapterFromPath('/')?.id).toBe('home')
    expect(chapterFromPath('/nope')).toBeNull()
  })

  it('cites only https sources', () => {
    for (const source of Object.values(SOURCES)) expect(source.url).toMatch(/^https:\/\//)
  })
})

describe('chapter layout', () => {
  it.each(CHAPTER_IDS)('%s renders exactly one claim, a closed drawer, the sources and a Next link', (id) => {
    const html = renderToStaticMarkup(createElement(ChapterLayout, { id, children: createElement('p', null, 'visual') }))
    expect(html.match(/data-claim=/g)).toHaveLength(1)
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('data-sources')
    expect(html).toMatch(/Next|Back to the start/)
    for (const key of CHAPTERS.find((chapter) => chapter.id === id)?.sources ?? []) {
      expect(html).toContain(SOURCES[key].url.replace(/&/g, '&amp;').replace(/'/g, '&#x27;'))
    }
  })
})

describe('provenance badges', () => {
  it('renders exactly "Real" or "Simulated"', () => {
    expect(renderToStaticMarkup(createElement(ProvenanceBadge, { provenance: 'real' }))).toContain('>Real<')
    expect(renderToStaticMarkup(createElement(ProvenanceBadge, { provenance: 'simulated' }))).toContain('>Simulated<')
  })

  const visualFiles = sourceFiles.filter((path) => path.endsWith('.tsx') && read(path).includes('<VisualFrame'))

  it('finds visuals in every chapter folder', () => {
    for (const id of CHAPTER_IDS) {
      expect(visualFiles.some((path) => shortName(path).startsWith(`chapters/${id}/`)), id).toBe(true)
    }
  })

  it.each(visualFiles.map(shortName))('%s exports a provenance constant and passes it to its VisualFrame', async (file) => {
    const loaded = (await import(`../${file.replace(/\.tsx$/, '')}`)) as { provenance?: unknown }
    expect(['real', 'simulated']).toContain(loaded.provenance)
    expect(read(join(SRC_ROOT, file))).toContain('provenance={provenance}')
  })
})

describe('head types', () => {
  it('keeps only head types with a source link', () => {
    expect(KNOWN_HEAD_TYPES.length).toBeGreaterThan(0)
    for (const head of KNOWN_HEAD_TYPES) expect(SOURCES[head.source].url).toMatch(/^https:\/\//)
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
    const showsNumbers = (path: string) => /^(chapters|core\/components|core\/chapters)\//.test(shortName(path))
    const offenders = sourceFiles
      .filter(showsNumbers)
      .filter((path) => /MODEL_SPECS\.(embeddingDim|layers|headsPerLayer)/.test(read(path)))
      .filter((path) => !/MODEL_SPECS\.modelName|const DEMO = MODEL_SPECS\.modelName/.test(read(path)))
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
    'Start the Journey',
  ]

  it.each(FORBIDDEN)('contains no %j', (phrase) => {
    const offenders = sourceFiles.filter((path) => read(path).includes(phrase)).map(shortName)
    expect(offenders).toEqual([])
  })

  it('contains no em dash or en dash', () => {
    const offenders = sourceFiles.filter((path) => /[\u2013\u2014]/.test(read(path))).map(shortName)
    expect(offenders).toEqual([])
  })

  it('uses no text size below 16px in class names', () => {
    const tiny = /\btext-(xs|sm|\[(?:[0-9]|1[0-5])px\]|\[0?\.\d+rem\])/
    const offenders = sourceFiles.filter((path) => path.endsWith('.tsx') && tiny.test(read(path))).map(shortName)
    expect(offenders).toEqual([])
  })
})
