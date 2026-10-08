// Slide interactions with the real tokenizer, the real GPT-2 numbers and the live worker.
import { expect, test } from '@playwright/test'
import { checkSlide } from './layoutChecks'
import { open, trackConsoleErrors } from './walkHelpers'

const STRICT_LAYOUT = process.env.STRICT_LAYOUT === '1'
const LIVE_CALL_TIMEOUT_MS = 30_000

test.use({ viewport: { width: 1440, height: 900 } })

test('machine: three presses append three tokens, a non-top candidate replaces the pick (live model)', async ({ page }) => {
  const errors = trackConsoleErrors(page)
  await open(page, '/machine')
  const pick = page.getByRole('button', { name: 'Pick the next token' })
  const status = page.getByRole('status')
  for (let press = 1; press <= 3; press++) {
    await pick.click()
    await expect(status.filter({ hasText: `(token ${press})` })).toBeVisible({ timeout: LIVE_CALL_TIMEOUT_MS })
  }
  const candidates = page.getByRole('list', { name: 'Candidates for the token just added' }).getByRole('button')
  await expect(candidates.first()).toHaveAttribute('aria-pressed', 'true')
  expect(await candidates.count()).toBe(10)
  await candidates.nth(1).click()
  await expect(candidates.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(status.filter({ hasText: 'Your choice' })).toBeVisible()
  if (STRICT_LAYOUT) await checkSlide(page, '/machine with candidates')
  expect(errors).toEqual([])
})

test('tokens: chips carry their IDs, the prompt edited here reaches the other slides', async ({ page }) => {
  await open(page, '/tokens')
  await expect(page.getByRole('button', { name: /^Token 2: " dog", ID \d+/ })).toContainText('#')
  await page.getByRole('button', { name: 'Edit text' }).click()
  await page.getByLabel('Your text').fill('The cat sat on the mat because it was warm.')
  await page.getByRole('button', { name: 'Done editing' }).click()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('button', { name: /Your text: The cat sat on the mat/ })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: /Your text: The cat sat on the mat/ })).toBeVisible()
})

test('tokens: a hard sample text still fits the slide', async ({ page }) => {
  await open(page, '/tokens')
  await page.getByRole('button', { name: 'Try a hard one' }).click()
  await page.getByRole('button', { name: 'German compounds' }).click()
  for (const route of ['/tokens', '/numbers', '/attention']) {
    await open(page, route)
    await page.waitForTimeout(1600)
    if (STRICT_LAYOUT) await checkSlide(page, `${route} with a long text`)
  }
})

test('numbers: real GPT-2 numbers, a grey token outside the demo set', async ({ page }) => {
  await open(page, '/numbers')
  await expect(page.getByText('all 768 numbers').first()).toBeVisible()
  await expect(page.getByRole('list', { name: 'Most similar tokens' }).getByRole('listitem')).toHaveCount(8)
  await page.getByRole('button', { name: /^Token 1:/ }).click()
  await expect(page.getByText(/not in demo set/).first()).toBeVisible()
})

test('attention: arcs only point left; the grid fits', async ({ page }) => {
  await open(page, '/attention')
  const paths = await page.locator('[data-visual] svg:not(.lucide) path').evaluateAll((elements) => elements.map((element) => element.getAttribute('d') ?? ''))
  expect(paths.length).toBeGreaterThan(0)
  for (const d of paths) {
    const numbers = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
    expect(numbers[numbers.length - 2]).toBeLessThan(numbers[0])
  }
  await page.getByRole('button', { name: 'Grid' }).click()
  await expect(page.locator('[data-visual] table')).toBeVisible()
  if (STRICT_LAYOUT) await checkSlide(page, 'attention grid')
})

test('feed-forward: Run the block changes every column', async ({ page }) => {
  await open(page, '/feedforward')
  const columns = page.locator('[data-column]')
  const before = await columns.evaluateAll((elements) => elements.map((element) => element.innerHTML))
  await page.getByRole('button', { name: 'Run the block' }).click()
  await expect(page.getByText(/^Run 1:/)).toBeVisible()
  await page.waitForTimeout(1200)
  const after = await columns.evaluateAll((elements) => elements.map((element) => element.innerHTML))
  expect(after).toHaveLength(before.length)
  for (const [index, html] of after.entries()) expect(html, `column ${index}`).not.toBe(before[index])
  await page.getByRole('button', { name: 'Next to attention' }).click()
  if (STRICT_LAYOUT) await checkSlide(page, 'feed-forward next to attention')
})

test('layers: the stepper walks the blocks; a prompt without numbers offers the samples', async ({ page }) => {
  await open(page, '/layers')
  await page.getByRole('button', { name: 'Block up' }).click()
  await page.getByRole('button', { name: 'Block up' }).click()
  await expect(page.getByRole('button', { name: /Block 2/ }).first()).toHaveAttribute('aria-pressed', 'true')
  await open(page, '/tokens')
  await page.getByRole('button', { name: 'Edit text' }).click()
  await page.getByLabel('Your text').fill('Something that was never exported.')
  await page.getByRole('button', { name: 'Done editing' }).click()
  await open(page, '/layers')
  await expect(page.getByRole('button', { name: '2 + 2 =' })).toBeVisible()
  await page.getByRole('button', { name: 'The capital of France is' }).click()
  await expect(page.getByText(/GPT-2 small reads "The capital of France is"/)).toBeVisible()
})

test('scores and sampling: the real top 20 with the tail, then five picks (live model)', async ({ page }) => {
  await open(page, '/scores')
  await expect(page.getByRole('button', { name: /all other tokens/i })).toBeVisible({ timeout: LIVE_CALL_TIMEOUT_MS })
  await expect(page.getByRole('list', { name: 'Probability of each next token' }).getByRole('listitem')).toHaveCount(21)
  await page.waitForTimeout(1600)
  if (STRICT_LAYOUT) await checkSlide(page, '/scores with the list')
  await page.keyboard.press('ArrowRight')
  await page.getByRole('button', { name: /^Pick 5 times/ }).click()
  await expect(page.locator('[data-picks] li')).toHaveCount(5, { timeout: 10_000 })
  if (STRICT_LAYOUT) await checkSlide(page, '/sampling with picks')
})
