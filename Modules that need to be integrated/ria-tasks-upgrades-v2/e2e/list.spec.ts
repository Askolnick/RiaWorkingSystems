import { test, expect } from '@playwright/test'
test('list renders', async ({ page }) => {
  await page.goto('/tasks/list')
  await expect(page.getByText('List')).toBeVisible()
})
