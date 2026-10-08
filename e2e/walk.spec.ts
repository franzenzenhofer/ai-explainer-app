// Browser walk of the presentation: every slide at three desktop sizes must fit one viewport with
// nothing clipped, no text under 16px and zero console errors; the keys, dots, pipeline, overlays and
// full screen work; phones get the reflowed layout. Strict layout checks run with STRICT_LAYOUT=1.

import { expect, test } from '@playwright/test'
import { CHAPTERS } from '../src/core/chapters/chapters'
import { checkSlide } from './layoutChecks'
import { expectSlide, open, trackConsoleErrors } from './walkHelpers'

const STRICT_LAYOUT = process.env.STRICT_LAYOUT === '1'
// Long enough for the staggered entrances to finish before the layout is measured.
const SETTLE_MS = 1600

const DESKTOPS = [
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

for (const viewport of DESKTOPS) {
  test.describe(`slides at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })

    test('every slide fits one viewport, nothing clipped, zero console errors', async ({ page }) => {
      const errors = trackConsoleErrors(page)
      for (const [index, chapter] of CHAPTERS.entries()) {
        await open(page, chapter.route)
        await expectSlide(page, index)
        await expect(page.locator('html')).toHaveAttribute('data-mode', 'stage')
        await page.waitForTimeout(SETTLE_MS)
        if (STRICT_LAYOUT) await checkSlide(page, `${chapter.route} at ${viewport.width}x${viewport.height}`)
      }
      expect(errors).toEqual([])
    })
  })
}

test.describe('presentation controls at 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('Right, Space and Page Down go forward; Left and Page Up go back', async ({ page }) => {
    await open(page, '/')
    await page.keyboard.press('ArrowRight')
    await expectSlide(page, 1)
    await page.locator('body').focus()
    await page.keyboard.press('Space')
    await expectSlide(page, 2)
    await page.keyboard.press('PageDown')
    await expectSlide(page, 3)
    await page.keyboard.press('ArrowLeft')
    await expectSlide(page, 2)
    await page.keyboard.press('PageUp')
    await expectSlide(page, 1)
  })

  test('F toggles full screen and the stage still fits', async ({ page }) => {
    await open(page, '/attention')
    await page.keyboard.press('f')
    await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(true)
    await expect(page.getByRole('button', { name: 'Exit full screen' })).toBeVisible()
    if (STRICT_LAYOUT) await checkSlide(page, '/attention in full screen')
    await page.keyboard.press('f')
    await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(false)
  })

  test('the dots and the pipeline stages jump to their slides', async ({ page }) => {
    await open(page, '/')
    await page.getByRole('link', { name: /^Slide 5: Attention/ }).click()
    await expectSlide(page, 4)
    await page.getByRole('navigation', { name: 'Pipeline' }).getByRole('link', { name: 'Scores' }).click()
    await expectSlide(page, 7)
    await expect(page.getByRole('navigation', { name: 'Pipeline' }).getByRole('link', { name: 'Scores' })).toHaveAttribute('aria-current', 'step')
  })

  test('the Next button walks all eleven slides and returns to the start', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await open(page, '/')
    for (let index = 1; index < CHAPTERS.length; index++) {
      await page.getByRole('link', { name: `Next: ${CHAPTERS[index].shortName}` }).click()
      await expectSlide(page, index)
    }
    await page.getByRole('link', { name: 'Back to the start' }).click()
    await expectSlide(page, 0)
    expect(errors).toEqual([])
  })

  test('Go deeper and Sources open as overlays on top of the slide; Escape closes them', async ({ page }) => {
    await open(page, '/tokens')
    await page.getByRole('button', { name: 'Go deeper' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    expect(await page.evaluate(() => document.scrollingElement?.scrollHeight ?? 0)).toBeLessThanOrEqual(900)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await page.getByRole('button', { name: 'Sources' }).click()
    await expect(dialog.getByRole('link').first()).toHaveAttribute('href', /^https:\/\//)
    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).toHaveCount(0)
  })

  test('the back button and a reload keep the slide', async ({ page }) => {
    await open(page, '/tokens')
    await page.keyboard.press('ArrowRight')
    await expectSlide(page, 3)
    await page.goBack()
    await expectSlide(page, 2)
    await page.reload()
    await page.locator('html[data-ready="true"]').waitFor({ state: 'attached' })
    await expectSlide(page, 2)
  })

  test('every slide shows its explanation and colour key on screen', async ({ page }) => {
    for (const chapter of CHAPTERS.filter((candidate) => candidate.id !== 'intro')) {
      await open(page, chapter.route)
      await expect(page.locator('[data-explain]')).toContainText(chapter.explain.what)
      await expect(page.locator('[data-color-key]')).toBeVisible()
    }
  })
})

test.describe('phone 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('slides reflow, never scroll sideways, keep 16px text', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    for (const chapter of CHAPTERS) {
      await open(page, chapter.route)
      await expect(page.locator('html')).toHaveAttribute('data-mode', 'flow')
      await page.waitForTimeout(SETTLE_MS / 2)
      if (STRICT_LAYOUT) await checkSlide(page, `${chapter.route} on a phone`)
    }
    expect(errors).toEqual([])
  })
})

