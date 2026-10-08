// Layout checks the walk runs on every chapter with STRICT_LAYOUT=1.
import { expect, type Page } from '@playwright/test'

const MIN_FONT_SIZE_PX = 16
const MIN_TARGET_PX = 44
// The primary control must be reachable within this many screens of scrolling.
const PRIMARY_CONTROL_SCREENS = 2

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => (document.scrollingElement?.scrollWidth ?? 0) - window.innerWidth)
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

// Buttons, inputs and stand-alone links must be 44px tall; links inside running text are exempt.
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

async function primaryControlTop(page: Page): Promise<number> {
  return page.locator('[data-primary-control]').first().evaluate((element) => element.getBoundingClientRect().top + window.scrollY)
}

export async function checkLayout(page: Page, where: string) {
  expect(await horizontalOverflow(page), `horizontal overflow on ${where}`).toBeLessThanOrEqual(0)
  expect(await smallText(page), `text under ${MIN_FONT_SIZE_PX}px on ${where}`).toEqual([])
  expect(await smallTargets(page), `touch targets under ${MIN_TARGET_PX}px on ${where}`).toEqual([])
  const viewport = page.viewportSize()
  expect(await primaryControlTop(page), `primary control too far down on ${where}`).toBeLessThan((viewport?.height ?? 0) * PRIMARY_CONTROL_SCREENS)
  const visuals = page.locator('[data-visual]')
  const count = await visuals.count()
  expect(count, `no visual on ${where}`).toBeGreaterThan(0)
  for (let index = 0; index < count; index++) {
    await expect(visuals.nth(index).locator('[data-provenance]').first(), `badge missing on ${where}`).toBeVisible()
  }
}
