// Measures whether anything on a slide moves by itself after it first shows on the initial load: every
// animation frame, each visible element's position is compared with where it first appeared. Layout
// shift entries miss this because transforms do not count as layout shift; frame sampling does not.
import type { Page } from '@playwright/test'

export const SAMPLE_MS = 4000

export interface Movement {
  label: string
  dx: number
  dy: number
}

declare global {
  interface Window {
    __moves?: Movement[]
    __cls?: number
  }
}

// Installs the probe before any page script runs; it samples for SAMPLE_MS after navigation.
export async function installMotionProbe(page: Page) {
  await page.addInitScript((sampleMs: number) => {
    const first = new WeakMap<Element, { x: number; y: number }>()
    const worst = new Map<Element, { dx: number; dy: number }>()
    window.__cls = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) window.__cls = (window.__cls ?? 0) + entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
    const visible = (element: Element) => element.checkVisibility({ opacityProperty: true, visibilityProperty: true })
    const sample = () => {
      for (const element of document.querySelectorAll('[data-stage-canvas] *')) {
        if (element.closest('svg') && element.tagName !== 'svg') continue
        // A bar that grows out of its zero line (data-grow) moves its left edge on purpose.
        if (element.closest('[data-grow]')) continue
        if (!visible(element)) continue
        const rect = element.getBoundingClientRect()
        if (!rect.width || !rect.height) continue
        const start = first.get(element)
        if (!start) {
          first.set(element, { x: rect.x, y: rect.y })
          continue
        }
        const dx = Math.abs(rect.x - start.x)
        const dy = Math.abs(rect.y - start.y)
        const before = worst.get(element)
        if (dx + dy > (before ? before.dx + before.dy : 0)) worst.set(element, { dx, dy })
      }
    }
    const startedAt = performance.now()
    const loop = () => {
      sample()
      if (performance.now() - startedAt < sampleMs) requestAnimationFrame(loop)
      else
        window.__moves = [...worst.entries()]
          .filter(([, move]) => move.dx > 1 || move.dy > 1)
          .map(([element, move]) => ({
            label: `${element.tagName}.${String(element.getAttribute('class') ?? '').slice(0, 40)} "${(element.textContent ?? '').trim().slice(0, 24)}"`,
            dx: Math.round(move.dx),
            dy: Math.round(move.dy),
          }))
    }
    requestAnimationFrame(loop)
  }, SAMPLE_MS)
}

export async function readMotionProbe(page: Page): Promise<{ moves: Movement[]; cls: number }> {
  await page.waitForFunction(() => window.__moves !== undefined, undefined, { timeout: SAMPLE_MS * 3 })
  return page.evaluate(() => ({ moves: window.__moves ?? [], cls: window.__cls ?? 0 }))
}
