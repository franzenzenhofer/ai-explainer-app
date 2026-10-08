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

// page.goto that waits until React has hydrated, so the first click reaches a live control.
async function open(page: Page, route: string) {
  await page.goto(route)
  await page.locator('html[data-ready="true"]').waitFor({ state: 'attached' })
}

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
        await open(page, chapter.route)
        await expectChapter(page, index)
        await page.waitForTimeout(SETTLE_MS)
        if (STRICT_LAYOUT) await checkLayout(page, `${chapter.route} at ${viewport.name}`)
        await page.locator('[data-drawer] button[aria-expanded]').click()
        await expect(page.locator('[data-drawer] button[aria-expanded]')).toHaveAttribute('aria-expanded', 'true')
        if (STRICT_LAYOUT) await checkLayout(page, `${chapter.route} with its drawer open at ${viewport.name}`)
      }
      expect(errors).toEqual([])
    })

    test('second views keep the layout: attention grid, feed-forward next to attention, a hard sample text', async ({ page }) => {
      await open(page, '/attention')
      await page.getByRole('button', { name: 'Grid' }).click()
      await expect(page.locator('[data-visual] table')).toBeVisible()
      if (STRICT_LAYOUT) await checkLayout(page, `attention grid at ${viewport.name}`)
      await open(page, '/feedforward')
      await page.getByRole('button', { name: 'Next to attention' }).click()
      if (STRICT_LAYOUT) await checkLayout(page, `feed-forward next to attention at ${viewport.name}`)
      await open(page, '/tokens')
      await page.getByRole('button', { name: 'Try a hard one' }).click()
      await page.getByRole('button', { name: 'German compounds' }).click()
      for (const route of ['/tokens', '/numbers', '/attention', '/scores', '/loop']) {
        await open(page, route)
        if (STRICT_LAYOUT) await checkLayout(page, `${route} with a long text at ${viewport.name}`)
      }
    })

    test('walks all ten chapters with the Next link', async ({ page }) => {
      const errors = trackConsoleErrors(page)
      await open(page, '/')
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
    await open(page, '/tokens')
    await page.keyboard.press('ArrowRight')
    await expectChapter(page, 2)
    await page.goBack()
    await expectChapter(page, 1)
    await page.goForward()
    await expectChapter(page, 2)
    await page.reload()
    await page.locator('html[data-ready="true"]').waitFor({ state: 'attached' })
    await expectChapter(page, 2)
    await page.keyboard.press('ArrowLeft')
    await expectChapter(page, 1)
  })

  test('the chapter menu lists ten chapters and Escape closes it', async ({ page }) => {
    await open(page, '/layers')
    await page.getByRole('button', { name: 'Chapters' }).click()
    const menu = page.getByRole('navigation', { name: 'Chapters' })
    await expect(menu.getByRole('link')).toHaveCount(CHAPTERS.length)
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
  })

  test('the drawer is closed by default, Escape closes it, and it remembers its state per chapter', async ({ page }) => {
    await open(page, '/attention')
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
    await open(page, '/tokens')
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

  test('home: three presses append three tokens in under 15 s, and a non-top candidate replaces the pick (live model)', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await open(page, '/')
    const pick = page.getByRole('button', { name: 'Pick the next token' })
    const status = page.getByRole('status')
    const started = Date.now()
    for (let press = 1; press <= 3; press++) {
      await pick.click()
      await expect(status.filter({ hasText: `(token ${press})` })).toBeVisible({ timeout: LIVE_CALL_TIMEOUT_MS })
    }
    expect(Date.now() - started).toBeLessThan(15_000)
    const candidates = page.getByRole('list', { name: 'Candidates for the token just added' }).getByRole('button')
    await expect(candidates.first()).toHaveAttribute('aria-pressed', 'true')
    expect(await candidates.count()).toBe(10)
    await candidates.nth(1).click()
    await expect(candidates.nth(1)).toHaveAttribute('aria-pressed', 'true')
    await expect(candidates.first()).toHaveAttribute('aria-pressed', 'false')
    await expect(status.filter({ hasText: 'Your choice' })).toBeVisible()
    await pick.click()
    await expect(status.filter({ hasText: '(token 4)' })).toBeVisible({ timeout: LIVE_CALL_TIMEOUT_MS })
    if (STRICT_LAYOUT) await checkLayout(page, 'home with candidates at desktop')
    expect(errors).toEqual([])
  })

  test('scores: the real top 20 and the tail bar (live model)', async ({ page }) => {
    await open(page, '/scores')
    await page.getByRole('button', { name: 'Ask the model' }).click()
    await expect(page.getByRole('button', { name: /all other tokens/i })).toBeVisible({ timeout: LIVE_CALL_TIMEOUT_MS })
    await expect(page.getByRole('list', { name: 'Probability of each next token' }).getByRole('listitem')).toHaveCount(21)
    if (STRICT_LAYOUT) await checkLayout(page, 'scores with the list at desktop')
  })

  test('sampling: pick again shows five picks (live model)', async ({ page }) => {
    await open(page, '/sampling')
    await page.getByRole('button', { name: 'Ask the model' }).click()
    await expect(page.getByRole('button', { name: /^Pick 5 times/ })).toBeVisible({ timeout: LIVE_CALL_TIMEOUT_MS })
    await page.getByRole('button', { name: /^Pick 5 times/ }).click()
    await expect(page.locator('[data-picks] li')).toHaveCount(5)
    if (STRICT_LAYOUT) await checkLayout(page, 'sampling with the list at desktop')
  })

  test('attention: arcs only point left', async ({ page }) => {
    await open(page, '/attention')
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
    await open(page, '/feedforward')
    const columns = page.locator('[data-column]')
    const before = await columns.evaluateAll((elements) => elements.map((element) => element.innerHTML))
    await page.getByRole('button', { name: 'Run the block' }).click()
    await expect(page.getByText(/^Run 1:/)).toBeVisible()
    const after = await columns.evaluateAll((elements) => elements.map((element) => element.innerHTML))
    expect(after).toHaveLength(before.length)
    for (const [index, html] of after.entries()) expect(html, `column ${index}`).not.toBe(before[index])
    await expect(page.locator('[data-visual] svg path')).toHaveCount(0)
  })

  test('numbers: real GPT-2 numbers, a grey token outside the demo set', async ({ page }) => {
    await open(page, '/numbers')
    await expect(page.getByText('all 768 numbers')).toBeVisible()
    await expect(page.getByRole('list', { name: 'Most similar tokens' }).getByRole('listitem')).toHaveCount(8)
    await page.getByRole('button', { name: /^Token 1:/ }).click()
    await expect(page.getByText(/not in demo set/).first()).toBeVisible()
  })

  test('layers: a prompt without real numbers offers the four samples, never invented ones', async ({ page }) => {
    await open(page, '/tokens')
    await page.getByRole('button', { name: 'Edit text' }).click()
    await page.getByLabel('Your text').fill('Something that was never exported.')
    await page.getByRole('button', { name: 'Done editing' }).click()
    await open(page, '/layers')
    await expect(page.getByRole('button', { name: '2 + 2 =' })).toBeVisible()
    await page.getByRole('button', { name: 'The capital of France is' }).click()
    await expect(page.getByText(/GPT-2 small reads "The capital of France is"/)).toBeVisible()
  })

  test('layers: the stepper walks the blocks', async ({ page }) => {
    await open(page, '/layers')
    await page.getByRole('button', { name: 'Block up' }).click()
    await page.getByRole('button', { name: 'Block up' }).click()
    await expect(page.getByRole('button', { name: /Block 2/ }).first()).toHaveAttribute('aria-pressed', 'true')
  })
})
