import { defineConfig } from '@playwright/test'

const PREVIEW_PORT = 4391
const baseURL = process.env.BASE_URL ?? `http://localhost:${PREVIEW_PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL, headless: true },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PREVIEW_PORT}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180_000,
      },
})
