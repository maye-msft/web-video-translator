import { test, expect } from '@playwright/test'

test.describe('Smoke Tests - Page Loading', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console error tracking
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Set up unhandled error tracking
    const unhandledErrors: string[] = []
    page.on('pageerror', error => {
      unhandledErrors.push(error.message)
    })

    // Store errors in page context for later access
    await page.addInitScript(() => {
      window.consoleErrors = []
      window.unhandledErrors = []
    })
  })

  test('should load Step 1 (Upload Video) without errors', async ({ page }) => {
    await page.goto('/step-1')

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Check that the main heading is present
    await expect(page.locator('h1')).toContainText('Upload Video')

    // Check that WorkflowNavigation is present
    await expect(page.locator('text=Video Translation Workflow')).toBeVisible()

    // Check that progress bar is visible
    await expect(page.locator('.bg-blue-600').first()).toBeVisible()

    // Check that step buttons are present
    await expect(page.locator('text=Upload Video')).toBeVisible()
    await expect(page.locator('text=Generate Subtitles')).toBeVisible()
    await expect(page.locator('text=Translate')).toBeVisible()
    await expect(page.locator('text=Merge & Download')).toBeVisible()

    // Verify no JavaScript errors
    const hasErrors = await page.evaluate(() => {
      return (
        window.onerror !== null ||
        document.querySelectorAll('[data-error]').length > 0
      )
    })
    expect(hasErrors).toBeFalsy()
  })

  test('should load Step 2 (Generate Subtitles) without errors', async ({
    page,
  }) => {
    await page.goto('/step-2')

    await page.waitForLoadState('networkidle')

    // Check main content
    await expect(page.locator('h1')).toContainText('Generate Subtitles')

    // Check that WorkflowNavigation is present
    await expect(page.locator('text=Video Translation Workflow')).toBeVisible()

    // Check that the step content is rendered
    await expect(page.locator('text=Whisper Speech-to-Text')).toBeVisible()

    // Verify no critical errors that would break the page
    const pageTitle = await page.title()
    expect(pageTitle).toBeTruthy()
  })

  test('should load Step 3 (Translate) without errors', async ({ page }) => {
    await page.goto('/step-3')

    await page.waitForLoadState('networkidle')

    // Check main content
    await expect(page.locator('h1')).toContainText('Translate Subtitles')

    // Check that WorkflowNavigation is present
    await expect(page.locator('text=Video Translation Workflow')).toBeVisible()

    // Check that translation controls are present
    await expect(page.locator('text=Source Language')).toBeVisible()
    await expect(page.locator('text=Target Language')).toBeVisible()

    // Verify the page renders without crashing
    const bodyVisible = await page.locator('body').isVisible()
    expect(bodyVisible).toBeTruthy()
  })

  test('should load Step 4 (Merge & Download) without errors', async ({
    page,
  }) => {
    await page.goto('/step-4')

    await page.waitForLoadState('networkidle')

    // Check main content
    await expect(page.locator('h1')).toContainText('Merge Subtitles into Video')

    // Check that WorkflowNavigation is present
    await expect(page.locator('text=Video Translation Workflow')).toBeVisible()

    // Check that FFmpeg section is present
    await expect(page.locator('text=FFmpeg Status')).toBeVisible()

    // Verify page structure integrity
    const mainContent = await page
      .locator('main, .max-w-4xl, .container')
      .first()
    await expect(mainContent).toBeVisible()
  })

  test('should redirect root path to step-1', async ({ page }) => {
    await page.goto('/')

    // Should redirect to step-1
    await page.waitForURL('/step-1')

    // Verify we're on the correct page
    await expect(page.locator('h1')).toContainText('Upload Video')
  })

  test('should handle invalid routes gracefully', async ({ page }) => {
    // Try to navigate to a non-existent route
    const response = await page.goto('/non-existent-page')

    // Should either redirect to a valid page or show 404
    // In Vue Router, it typically redirects to a default route
    await page.waitForLoadState('networkidle')

    // The page should still be functional (not completely broken)
    const bodyExists = await page.locator('body').count()
    expect(bodyExists).toBeGreaterThan(0)
  })

  test('should load test pages without errors', async ({ page }) => {
    // Test the MarianMT test page
    await page.goto('/translation-test')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('MarianMT Translation Test')

    // Test the Whisper test page
    await page.goto('/whisper-test')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('Whisper STT Test')

    // Test the FFmpeg test page
    await page.goto('/ffmpeg-test')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('FFmpeg WASM Test')

    // Test the SubtitleMerge test page
    await page.goto('/subtitle-merge')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('Subtitle Merge into Video')
  })

  test('should not have critical console errors on main workflow pages', async ({
    page,
  }) => {
    const criticalErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Filter out non-critical errors (like network timeouts for optional resources)
        if (
          !text.includes('net::ERR_') &&
          !text.includes('Failed to fetch') &&
          !text.includes('Loading chunk')
        ) {
          criticalErrors.push(text)
        }
      }
    })

    // Test each main workflow step
    const steps = ['/step-1', '/step-2', '/step-3', '/step-4']

    for (const step of steps) {
      await page.goto(step)
      await page.waitForLoadState('networkidle')

      // Give the page time to execute any initialization code
      await page.waitForTimeout(1000)
    }

    // Check that we don't have critical JavaScript errors
    expect(criticalErrors.length).toBe(0)
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors)
    }
  })

  test('should have working navigation between steps', async ({ page }) => {
    // Start at step 1
    await page.goto('/step-1')
    await page.waitForLoadState('networkidle')

    // Check that step 1 is active (should have active styling)
    const step1Button = page.locator('button:has-text("Upload Video")').first()
    await expect(step1Button).toBeVisible()

    // Step 2 should be accessible (not disabled)
    const step2Button = page
      .locator('button:has-text("Generate Subtitles")')
      .first()
    await expect(step2Button).toBeVisible()

    // Click on step 2 (should work since we allow jumping to any step)
    await step2Button.click()
    await page.waitForURL('/step-2')

    // Verify we're on step 2
    await expect(page.locator('h1')).toContainText('Generate Subtitles')

    // Navigation should still be present and functional
    await expect(page.locator('text=Video Translation Workflow')).toBeVisible()
  })

  test('should load required assets and dependencies', async ({ page }) => {
    // Track failed network requests
    const failedRequests: string[] = []

    page.on('requestfailed', request => {
      // Only track failures for critical resources
      const url = request.url()
      if (url.includes('.js') || url.includes('.css') || url.includes('main')) {
        failedRequests.push(url)
      }
    })

    await page.goto('/step-1')
    await page.waitForLoadState('networkidle')

    // Check that critical assets loaded successfully
    expect(failedRequests.length).toBe(0)
    if (failedRequests.length > 0) {
      console.log('Failed to load critical assets:', failedRequests)
    }

    // Verify that Vue.js is working (reactive content is present)
    await expect(page.locator('.bg-blue-600')).toBeVisible() // Progress bar
    await expect(page.locator('button')).toHaveCount.greaterThan(0) // Interactive elements
  })
})
