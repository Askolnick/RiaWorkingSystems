import { test, expect } from '@playwright/test'
test('board renders', async ({ page }) => {
  await page.goto('/tasks/board')
  await expect(page.getByText('Board')).toBeVisible()
})
