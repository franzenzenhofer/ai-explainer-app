// Shared helpers for the browser walks.
import { expect, type Page } from '@playwright/test'
import { CHAPTERS } from '../src/core/chapters/chapters'

// page.goto that waits until React has hydrated, so the first click reaches a live control.
export async function open(page: Page, route: string) {
  await page.goto(route)
  await page.locator('html[data-ready="true"]').waitFor({ state: 'attached' })
}

export function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()}`))
  return errors
}

export async function expectSlide(page: Page, index: number) {
  const chapter = CHAPTERS[index]
  await expect(page.locator('[data-claim]')).toHaveText(chapter.claim)
  expect(new URL(page.url()).pathname.replace(/\/$/, '') || '/').toBe(chapter.route)
}
