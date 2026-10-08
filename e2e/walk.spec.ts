// Browser walk: opens every step at desktop and phone width, with real navigation clicks and the live worker.
// Layout assertions (no horizontal overflow, no text under 16px) run only with STRICT_LAYOUT=1.

import { expect, test, type Page } from '@playwright/test'

const STEP_COUNT = 8
const MIN_FONT_SIZE_PX = 16
const STRICT_LAYOUT = process.env.STRICT_LAYOUT === '1'

const WORKER_URL = 'https://ai-explainer-api.franz-enzenhofer7308.workers.dev/**'
// The worker only allows its production origin and localhost:4321/4322 (worker/src/index.ts ALLOWED_ORIGINS).
const WORKER_ALLOWED_ORIGIN = 'http://localhost:4321'

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

// Real worker, real answers: the request is forwarded from Node with an allowed Origin and the response is
// handed back to the page with a permissive CORS header. Nothing is faked.
async function bridgeWorkerCors(page: Page) {
  const corsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
  }
  await page.route(WORKER_URL, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders })
      return
    }
    const response = await route.fetch({ headers: { ...route.request().headers(), origin: WORKER_ALLOWED_ORIGIN } })
    await route.fulfill({ response, headers: { ...response.headers(), ...corsHeaders } })
  })
}

async function goToStep(page: Page, stepNumber: number) {
  await page.getByRole('button', { name: new RegExp(`^Go to step ${stepNumber}:`) }).click()
  await expect(page.locator('main')).toBeVisible()
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => (document.scrollingElement?.scrollWidth ?? 0) - window.innerWidth)
}

async function smallTextSamples(page: Page): Promise<string[]> {
  return page.evaluate((minimum) => {
    const offenders: string[] = []
    for (const element of document.body.querySelectorAll<HTMLElement>('*')) {
      const hasOwnText = Array.from(element.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0,
      )
      if (!hasOwnText) continue
      const size = parseFloat(getComputedStyle(element).fontSize)
      if (size < minimum) offenders.push(`${size}px: ${(element.textContent ?? '').trim().slice(0, 40)}`)
    }
    return offenders.slice(0, 10)
  }, MIN_FONT_SIZE_PX)
}

for (const viewport of VIEWPORTS) {
  test.describe(`walk at ${viewport.name} ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test('opens every step with zero console errors', async ({ page }) => {
      const errors = trackConsoleErrors(page)
      await page.goto('/')
      for (let step = 1; step <= STEP_COUNT; step++) {
        await goToStep(page, step)
        await page.waitForTimeout(400)
        if (STRICT_LAYOUT) {
          expect(await horizontalOverflow(page), `horizontal overflow on step ${step}`).toBeLessThanOrEqual(0)
          expect(await smallTextSamples(page), `text under ${MIN_FONT_SIZE_PX}px on step ${step}`).toEqual([])
        }
      }
      expect(errors).toEqual([])
    })
  })
}

test.describe('derived data and overlays', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('step 6 (Prediction) works when opened directly', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/')
    await goToStep(page, 6)
    const topProbability = page.getByText('Top probability').locator('..').locator('div').first()
    await expect(topProbability).toHaveText(/\d+(\.\d)?%/)
    expect(errors).toEqual([])
  })

  test('step 7 (Generation) works when opened directly, using the live worker', async ({ page }) => {
    await bridgeWorkerCors(page)
    const errors = trackConsoleErrors(page)
    await page.goto('/')
    await goToStep(page, 7)
    await page.getByRole('button', { name: /Generate with AI/ }).click()
    await expect(page.getByText(/Continuation fetched; replaying token \d+ of \d+/)).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('Generated tokens').locator('..').locator('div').first()).not.toHaveText('0', {
      timeout: 30_000,
    })
    expect(errors).toEqual([])
  })

  test('Escape closes the head types overlay and no fixed overlay remains', async ({ page }) => {
    await page.goto('/')
    await goToStep(page, 5)
    await page.getByRole('button', { name: /known head types/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    const fixedOverlays = await page.evaluate(
      () => Array.from(document.querySelectorAll('*')).filter((el) => getComputedStyle(el).position === 'fixed').length,
    )
    expect(fixedOverlays).toBe(0)
  })

  test('there is no fullscreen button', async ({ page }) => {
    await page.goto('/')
    await goToStep(page, 3)
    await expect(page.getByTitle(/Fullscreen/)).toHaveCount(0)
  })
})
