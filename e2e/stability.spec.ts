// Nothing jitters on load: on every slide, cumulative layout shift stays under 0.01 and no visible
// element moves more than 1px by itself after it first shows, in the first seconds after navigation.
import { expect, test } from '@playwright/test'
import { CHAPTERS } from '../src/core/chapters/chapters'
import { installMotionProbe, readMotionProbe } from './motionProbe'

const MAX_CLS = 0.01
const REPORT = process.env.REPORT_STABILITY === '1'

for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
  test.describe(`stability at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })

    for (const chapter of CHAPTERS) {
      test(`${chapter.route} does not move after it first shows`, async ({ page }) => {
        await installMotionProbe(page)
        await page.goto(chapter.route)
        const { moves, cls } = await readMotionProbe(page)
        if (REPORT) console.log(`${chapter.route} ${viewport.width}x${viewport.height} cls=${cls.toFixed(4)} moves=${moves.length}`, JSON.stringify(moves.slice(0, 6)))
        expect(cls, `layout shift on ${chapter.route}`).toBeLessThan(MAX_CLS)
        expect(moves, `elements moving on ${chapter.route}`).toEqual([])
      })
    }
  })
}

// A returning reader: the saved prompt differs from the server-rendered default text.
test.describe('stability with a saved prompt at 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('no slide moves after it first shows when the saved prompt is restored', async ({ page }) => {
    await page.addInitScript(() => {
      const key = 'ai-explainer-storage-v4'
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({ state: { inputText: 'The cat sat on the mat because it was warm.' }, version: 0 }))
      }
    })
    await installMotionProbe(page)
    for (const chapter of CHAPTERS) {
      await page.goto(chapter.route)
      const { moves, cls } = await readMotionProbe(page)
      if (REPORT) console.log(`saved ${chapter.route} cls=${cls.toFixed(4)} moves=${moves.length}`, JSON.stringify(moves.slice(0, 4)))
      expect(cls, `layout shift on ${chapter.route}`).toBeLessThan(MAX_CLS)
      expect(moves, `elements moving on ${chapter.route}`).toEqual([])
    }
  })
})
