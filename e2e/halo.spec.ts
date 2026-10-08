// The halo: exactly one pulsing ring per slide on the control to use next; after it is used, the ring
// moves to the Next button. With reduced motion the ring stays and does not pulse.
import { expect, test } from '@playwright/test'
import { CHAPTERS } from '../src/core/chapters/chapters'
import { open } from './walkHelpers'

test.use({ viewport: { width: 1440, height: 900 } })

const HALO = '.halo'

test('every slide shows exactly one halo', async ({ page }) => {
  for (const chapter of CHAPTERS) {
    await open(page, chapter.route)
    await page.waitForTimeout(1500)
    await expect(page.locator(HALO), `halo count on ${chapter.route}`).toHaveCount(1)
    await expect(page.locator(HALO)).toBeVisible()
  }
})

test('the halo moves to Next once the main action is used', async ({ page }) => {
  await open(page, '/layers')
  const play = page.getByRole('button', { name: 'Play: flow up the stack' })
  await expect(play).toHaveClass(/\bhalo\b/)
  await play.click()
  await expect(page.locator(HALO)).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Next: Scores' })).toHaveClass(/\bhalo\b/)
  await expect(play.or(page.getByRole('button', { name: 'Pause' }))).not.toHaveClass(/\bhalo\b/)
})

test('with reduced motion the halo is a static ring', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, '/sampling')
  const halo = page.locator(HALO)
  await expect(halo).toHaveCount(1)
  const style = await halo.evaluate((element) => ({ animation: getComputedStyle(element).animationName, shadow: getComputedStyle(element).boxShadow }))
  expect(style.animation).toBe('none')
  expect(style.shadow).not.toBe('none')
})
