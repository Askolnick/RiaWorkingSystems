import { defineConfig } from '@playwright/test'
export default defineConfig({
  webServer: {
    command: 'pnpm --filter @ria/web dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: { headless: true, baseURL: 'http://localhost:3000' }
})
