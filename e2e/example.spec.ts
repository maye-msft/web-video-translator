import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  
  await expect(page).toHaveTitle(/Web Video Translator/)
  await expect(page.getByRole('heading', { name: 'Web Video Translator' })).toBeVisible()
  await expect(page.getByText('Extract, edit, translate, and merge subtitles for videos')).toBeVisible()
})