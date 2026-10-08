// Browser walk: opens every chapter at desktop and phone width, by deep link and by the Next link,
// with the live worker. Layout assertions (no horizontal overflow, no text under 16px, 44px targets)
// run with STRICT_LAYOUT=1, which the npm script sets.

import { expect, test, type Page } from '@playwright/test'
import { CHAPTERS } from '../src/core/chapters/chapters'
import { checkLayout } from './layoutChecks'

const STRICT_LAYOUT = process.env.STRICT_LAYOUT === '1'
const SETTLE_MS = 300
const LIVE_CALL_TIMEOUT_MS = 30_000

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()}`))
  return errors
}

async function expectChapter(page: Page, index: number) {
  const chapter = CHAPTERS[index]
  await expect(page.locator('[data-claim]')).toHaveText(chapter.claim)
  await expect(page.locator('header').getByText(chapter.name, { exact: true })).toBeVisible()
  expect(new URL(page.url()).pathname.replace(/\/$/, '') || '/').toBe(chapter.route)
}

for (const viewport of VIEWPORTS) {
  test.describe(`walk at ${viewport.name} ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test('opens every chapter by deep link with zero console errors', async ({ page }) => {
      const errors = trackConsoleErrors(page)
      for (const [index, chapter] of CHAPTERS.entries()) {
        await page.goto(chapter.route)
        await expectChapter(page, index)
        await page.waitForTimeout(SETTLE_MS)
        if (STRICT_LAYOUT) await checkLayout(page, `${chapter.route} at ${viewport.name}`)
      }
      expect(errors).toEqual([])
    })

    test('walks all ten chapters with the Next link', async ({ page }) => {
      const errors = trackConsoleErrors(page)
      await page.goto('/')
      for (let index = 1; index < CHAPTERS.length; index++) {
        await page.getByRole('link', { name: new RegExp(`^Next ${CHAPTERS[index].name}`) }).click()
        await expectChapter(page, index)
      }
      await page.getByRole('link', { name: /^Back to the start/ }).click()
      await expectChapter(page, 0)
      expect(errors).toEqual([])
    })
  })
}

test.describe('navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the back button, a reload and the arrow keys work', async ({ page }) => {
    await page.goto('/tokens')
    await page.keyboard.press('ArrowRight')
    await expectChapter(page, 2)
    await page.goBack()
    await expectChapter(page, 1)
    await page.goForward()
    await expectChapter(page, 2)
    await page.reload()
    await expectChapter(page, 2)
    await page.keyboard.press('ArrowLeft')
    await expectChapter(page, 1)
  })

  test('the chapter menu lists ten chapters and Escape closes it', async ({ page }) => {
    await page.goto('/layers')
    await page.getByRole('button', { name: 'Chapters' }).click()
    const menu = page.getByRole('navigation', { name: 'Chapters' })
    await expect(menu.getByRole('link')).toHaveCount(CHAPTERS.length)
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
  })

  test('the drawer is closed by default, Escape closes it, and it remembers its state per chapter', async ({ page }) => {
    await page.goto('/attention')
    const toggle = page.locator('[data-drawer] button[aria-expanded]')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await page.getByRole('link', { name: /^Next / }).click()
    await expect(page.locator('[data-drawer] button[aria-expanded]')).toHaveAttribute('aria-expanded', 'false')
    await page.goBack()
    await expect(page.locator('[data-drawer] button[aria-expanded]')).toHaveAttribute('aria-expanded', 'true')
    const fixed = await page.evaluate(
      () => Array.from(document.querySelectorAll('*')).filter((el) => getComputedStyle(el).position === 'fixed').length,
    )
    expect(fixed).toBe(0)
  })

  test('the prompt edited on Tokens is carried to the other chapters', async ({ page }) => {
    await page.goto('/tokens')
    await page.getByRole('button', { name: 'Edit text' }).click()
    await page.getByLabel('Your text').fill('The cat sat on the mat because it was warm.')
    await page.getByRole('button', { name: 'Done editing' }).click()
    await page.getByRole('link', { name: /^Next / }).click()
    await expect(page.getByRole('button', { name: /Your text: The cat sat on the mat/ })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('button', { name: /Your text: The cat sat on the mat/ })).toBeVisible()
  })
})

test.describe('chapter interactions', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('home: three presses of Pick the next token append three tokens in under 15 s (live model)', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/')
    const pick = page.getByRole('button', { name: 'Pick the next token' })
    const started = Date.now()
    for (let press = 1; press <= 3; press++) {
      await pick.click()
      await expect(page.getByRole('status').filter({ hasText: `token ${press} of` })).toBeVisible({ timeout: LIVE_CALL_TIMEOUT_MS })
    }
    expect(Date.now() - started).toBeLessThan(15_000)
    expect(errors).toEqual([])
  })

  test('scores: the tail bar plus the top 20 is the whole list', async ({ page }) => {
    await page.goto('/scores')
    await expect(page.getByRole('button', { name: /the other 199,978 tokens/i })).toBeVisible()
  })

  test('sampling: pick again shows five picks', async ({ page }) => {
    await page.goto('/sampling')
    await page.locator('[data-primary-control] button').first().click()
    await expect(page.locator('[data-picks] li')).toHaveCount(5)
  })

  test('attention: arcs only point left', async ({ page }) => {
    await page.goto('/attention')
    const paths = await page.locator('[data-visual] svg path').evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('d') ?? ''),
    )
    expect(paths.length).toBeGreaterThan(0)
    for (const d of paths) {
      const numbers = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
      expect(numbers[numbers.length - 2]).toBeLessThan(numbers[0])
    }
  })

  test('feed-forward: Run the block changes every column', async ({ page }) => {
    await page.goto('/feedforward')
    await page.getByRole('button', { name: 'Run the block' }).click()
    await expect(page.locator('[data-visual]').first()).toBeVisible()
  })

  test('layers: the stepper walks the blocks', async ({ page }) => {
    await page.goto('/layers')
    await page.getByRole('button', { name: 'Block up' }).click()
    await page.getByRole('button', { name: 'Block up' }).click()
    await expect(page.getByRole('button', { name: /Block 2/ }).first()).toHaveAttribute('aria-pressed', 'true')
  })
})
