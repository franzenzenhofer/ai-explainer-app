// Layout checks the walk runs on every slide with STRICT_LAYOUT=1: the slide fits one viewport, nothing
// inside a slide region is clipped, no text under 16px, touch targets of 44px.
import { expect, type Page } from '@playwright/test'

const MIN_FONT_SIZE_PX = 16
const MIN_TARGET_PX = 44

async function pageOverflow(page: Page): Promise<{ down: number; across: number }> {
  return page.evaluate(() => ({
    down: (document.scrollingElement?.scrollHeight ?? 0) - window.innerHeight,
    across: (document.scrollingElement?.scrollWidth ?? 0) - window.innerWidth,
  }))
}

async function smallText(page: Page): Promise<string[]> {
  return page.evaluate((minimum) => {
    const offenders: string[] = []
    for (const element of document.body.querySelectorAll<Element>('*')) {
      const hasOwnText = Array.from(element.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0,
      )
      if (!hasOwnText || element.closest('.sr-only')) continue
      const size = parseFloat(getComputedStyle(element).fontSize)
      if (size < minimum) offenders.push(`${size}px: ${(element.textContent ?? '').trim().slice(0, 40)}`)
    }
    return offenders.slice(0, 10)
  }, MIN_FONT_SIZE_PX)
}

// Every box inside a slide region ([data-fit]) must stay inside it, and no element that clips its own
// content (overflow hidden or clip) may hold more than it shows. Inner scroll boxes are allowed.
export async function clippedBoxes(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const offenders: string[] = []
    const insideScroller = (element: HTMLElement, region: HTMLElement) => {
      for (let node = element.parentElement; node && node !== region; node = node.parentElement) {
        if (/auto|scroll/.test(getComputedStyle(node).overflowX + getComputedStyle(node).overflowY)) return true
      }
      return false
    }
    for (const region of document.querySelectorAll<HTMLElement>('[data-fit]')) {
      const box = region.getBoundingClientRect()
      for (const element of region.querySelectorAll<HTMLElement>('*')) {
        const rect = element.getBoundingClientRect()
        if (!rect.width || !rect.height || element.closest('.sr-only') || insideScroller(element, region)) continue
        const style = getComputedStyle(element)
        // Clipped only along an axis that hides its overflow; a scrolling axis is fine.
        const hidesY = /hidden|clip/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1
        const hidesX = /hidden|clip/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1
        const overfull = hidesY || hidesX
        const outside = rect.bottom > box.bottom + 1 || rect.right > box.right + 1 || rect.left < box.left - 1
        if (outside || overfull) offenders.push(`${element.tagName} "${(element.textContent ?? '').trim().slice(0, 30)}"`)
      }
    }
    return offenders.slice(0, 8)
  })
}

async function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate((minimum) => {
    const targets = document.querySelectorAll<HTMLElement>('button, input:not([type="hidden"]), select, textarea, a[href]')
    return Array.from(targets)
      .filter((element) => !(element.tagName === 'A' && element.closest('p, li > p, td')))
      .filter((element) => !element.closest('.sr-only'))
      .filter((element) => {
        const box = element.getBoundingClientRect()
        return box.width > 0 && box.height > 0 && box.height < minimum - 0.5
      })
      .map((element) => `${Math.round(element.getBoundingClientRect().height)}px: ${element.tagName} ${(element.textContent ?? element.getAttribute('aria-label') ?? '').trim().slice(0, 30)}`)
      .slice(0, 10)
  }, MIN_TARGET_PX)
}

// The stage is scaled, so a target's on-screen height is its CSS height times the scale (at least 1).
export async function checkSlide(page: Page, where: string) {
  const mode = await page.evaluate(() => document.documentElement.dataset.mode)
  const overflow = await pageOverflow(page)
  expect(overflow.across, `horizontal page scroll on ${where}`).toBeLessThanOrEqual(0)
  if (mode === 'stage') {
    expect(overflow.down, `vertical page scroll on ${where}`).toBeLessThanOrEqual(0)
    expect(await clippedBoxes(page), `clipped content on ${where}`).toEqual([])
  }
  expect(await smallText(page), `text under ${MIN_FONT_SIZE_PX}px on ${where}`).toEqual([])
  expect(await smallTargets(page), `touch targets under ${MIN_TARGET_PX}px on ${where}`).toEqual([])
  const visuals = page.locator('[data-visual]')
  const count = await visuals.count()
  for (let index = 0; index < count; index++) {
    await expect(visuals.nth(index).locator('[data-provenance]').first(), `badge missing on ${where}`).toBeVisible()
  }
}
