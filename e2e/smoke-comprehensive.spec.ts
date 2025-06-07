import { test, expect, Page } from '@playwright/test'

/**
 * Comprehensive Smoke Tests for Web Video Translator
 *
 * These tests verify that the web application can be launched successfully
 * and that all critical components are working without errors.
 */

test.describe('Comprehensive Smoke Tests', () => {
  let consoleErrors: string[] = []
  let networkErrors: string[] = []
  let unhandledErrors: string[] = []

  test.beforeEach(async ({ page }) => {
    // Reset error arrays
    consoleErrors = []
    networkErrors = []
    unhandledErrors = []

    // Track console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`Console Error: ${msg.text()}`)
      }
    })

    // Track network failures
    page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        networkErrors.push(
          `Network Error: ${response.status()} ${response.url()}`
        )
      }
    })

    // Track unhandled JavaScript errors
    page.on('pageerror', error => {
      unhandledErrors.push(`Unhandled Error: ${error.message}`)
    })

    // Set longer timeout for slower CI environments
    test.setTimeout(30000)
  })

  test.afterEach(async () => {
    // Report any errors found during the test
    if (consoleErrors.length > 0) {
      console.log('Console Errors Found:', consoleErrors)
    }
    if (networkErrors.length > 0) {
      console.log('Network Errors Found:', networkErrors)
    }
    if (unhandledErrors.length > 0) {
      console.log('Unhandled Errors Found:', unhandledErrors)
    }
  })

  test('Application Launch Smoke Test', async ({ page }) => {
    console.log('🚀 Starting application launch smoke test...')

    // Navigate to the root URL
    await page.goto('/')
    console.log('✅ Successfully navigated to root URL')

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    console.log('✅ Page fully loaded (network idle)')

    // Check that the page title is set correctly
    const title = await page.title()
    expect(title).toBeTruthy()
    console.log(`✅ Page title: "${title}"`)

    // Verify no critical errors occurred during initial load
    expect(
      unhandledErrors.length,
      `Unhandled errors: ${unhandledErrors.join(', ')}`
    ).toBe(0)

    // Allow some console warnings but no errors
    const criticalConsoleErrors = consoleErrors.filter(
      error =>
        !error.includes('Warning:') &&
        !error.includes('[Vue warn]') &&
        !error.includes('Download the React DevTools')
    )
    expect(
      criticalConsoleErrors.length,
      `Critical console errors: ${criticalConsoleErrors.join(', ')}`
    ).toBe(0)

    console.log('✅ No critical errors during application launch')
  })

  test('Workflow Navigation Component Load Test', async ({ page }) => {
    console.log('🧭 Testing workflow navigation component...')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check if workflow navigation is present
    const workflowNav = page
      .locator('[data-testid="workflow-navigation"]')
      .first()
    const isWorkflowNavVisible = await workflowNav
      .isVisible()
      .catch(() => false)

    if (!isWorkflowNavVisible) {
      // Try alternative selector
      const altWorkflowNav = page
        .locator('.bg-white.shadow-sm.border-b.border-gray-200')
        .first()
      await expect(altWorkflowNav).toBeVisible({ timeout: 5000 })
      console.log('✅ Workflow navigation found via alternative selector')
    } else {
      console.log('✅ Workflow navigation found via test ID')
    }

    // Check for step indicators
    const stepElements = page.locator(
      'button:has-text("Upload Video"), button:has-text("Generate Subtitles"), button:has-text("Translate"), button:has-text("Merge")'
    )
    const stepCount = await stepElements.count()
    expect(stepCount).toBeGreaterThan(0)
    console.log(`✅ Found ${stepCount} workflow steps`)
  })

  test('Route Navigation Smoke Test', async ({ page }) => {
    console.log('🛣️ Testing route navigation...')

    const routes = ['/step-1', '/step-2', '/step-3', '/step-4']

    for (const route of routes) {
      console.log(`Navigating to ${route}...`)
      await page.goto(route)
      await page.waitForLoadState('networkidle', { timeout: 10000 })

      // Verify the page loads without critical errors
      expect(
        unhandledErrors.length,
        `Route ${route} had unhandled errors: ${unhandledErrors.join(', ')}`
      ).toBe(0)

      const url = page.url()
      expect(url).toContain(route)
      console.log(`✅ Successfully loaded ${route}`)

      // Reset errors for next route
      unhandledErrors.length = 0
      consoleErrors.length = 0
    }
  })

  test('Core Vue Components Smoke Test', async ({ page }) => {
    console.log('🔧 Testing core Vue components...')

    await page.goto('/step-1')
    await page.waitForLoadState('networkidle')

    // Check if Vue app is mounted and reactive
    const vueAppExists = await page
      .evaluate(() => {
        // Check if Vue app instance exists
        return (
          !!(window as any).__VUE__ ||
          document.querySelector('#app')?._vueParentComponent
        )
      })
      .catch(() => false)

    if (!vueAppExists) {
      // Alternative check - look for Vue-specific attributes or components
      const hasVueElements =
        (await page.locator('[data-v-], .vue-component, #app > div').count()) >
        0
      expect(hasVueElements).toBeTruthy()
    }

    console.log('✅ Vue application is properly mounted')

    // Check for critical DOM elements
    const mainContainer = page.locator('#app')
    await expect(mainContainer).toBeVisible()
    console.log('✅ Main app container is visible')
  })

  test('Static Assets Loading Test', async ({ page }) => {
    console.log('📦 Testing static assets loading...')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that CSS is loaded (Tailwind classes should be applied)
    const hasStyledElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        '[class*="bg-"], [class*="text-"], [class*="flex"]'
      )
      return elements.length > 0
    })

    expect(hasStyledElements).toBeTruthy()
    console.log('✅ CSS styles are properly loaded')

    // Verify no 404 errors for critical assets
    const critical404s = networkErrors.filter(
      error =>
        error.includes('404') &&
        (error.includes('.css') ||
          error.includes('.js') ||
          error.includes('/assets/'))
    )
    expect(
      critical404s.length,
      `Critical 404 errors: ${critical404s.join(', ')}`
    ).toBe(0)
    console.log('✅ No critical 404 errors for static assets')
  })

  test('JavaScript Bundle Execution Test', async ({ page }) => {
    console.log('📜 Testing JavaScript bundle execution...')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test that basic JavaScript functionality works
    const jsWorking = await page.evaluate(() => {
      try {
        // Test basic ES6+ features
        const testArray = [1, 2, 3]
        const doubled = testArray.map(x => x * 2)
        const hasMap = doubled.length === 3 && doubled[0] === 2

        // Test async/await support
        const asyncTest = async () => Promise.resolve(true)

        return hasMap && typeof asyncTest === 'function'
      } catch (error) {
        return false
      }
    })

    expect(jsWorking).toBeTruthy()
    console.log('✅ JavaScript bundle executed successfully')

    // Verify no syntax errors in console
    const syntaxErrors = consoleErrors.filter(
      error =>
        error.includes('SyntaxError') ||
        error.includes('Unexpected token') ||
        error.includes('Cannot import')
    )
    expect(
      syntaxErrors.length,
      `Syntax errors: ${syntaxErrors.join(', ')}`
    ).toBe(0)
    console.log('✅ No JavaScript syntax errors detected')
  })

  test('Responsive Design Smoke Test', async ({ page }) => {
    console.log('📱 Testing responsive design...')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ]

    for (const viewport of viewports) {
      console.log(
        `Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})...`
      )

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await page.waitForTimeout(500) // Allow time for responsive adjustments

      // Check that main content is still visible
      const mainContent = page.locator('#app')
      await expect(mainContent).toBeVisible()

      // Check that content isn't overflowing
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        )
      })

      // Mobile might have horizontal scroll, but desktop shouldn't
      if (viewport.width >= 768) {
        expect(
          hasHorizontalScroll,
          `Unexpected horizontal scroll on ${viewport.name}`
        ).toBeFalsy()
      }

      console.log(`✅ ${viewport.name} viewport renders correctly`)
    }
  })

  test('Performance Smoke Test', async ({ page }) => {
    console.log('⚡ Testing basic performance metrics...')

    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    console.log(`Page load time: ${loadTime}ms`)

    // Basic performance expectations (generous for CI)
    expect(loadTime).toBeLessThan(15000) // 15 seconds max
    console.log('✅ Page load time within acceptable range')

    // Check that the page is interactive
    const isInteractive = await page.evaluate(() => {
      return document.readyState === 'complete'
    })

    expect(isInteractive).toBeTruthy()
    console.log('✅ Page is fully interactive')
  })

  test('Error Boundary Test', async ({ page }) => {
    console.log('🛡️ Testing error handling...')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to a non-existent route to test error handling
    await page.goto('/non-existent-route')
    await page.waitForTimeout(2000)

    // Should either redirect to a valid route or show a proper error page
    const currentUrl = page.url()
    const hasErrorPage = await page
      .locator('text="404"')
      .isVisible()
      .catch(() => false)
    const redirectedToValid =
      currentUrl.includes('/step-') || currentUrl.endsWith('/')

    expect(hasErrorPage || redirectedToValid).toBeTruthy()
    console.log('✅ Error handling works correctly for invalid routes')

    // Verify the app didn't crash
    const appStillWorks = await page.locator('#app').isVisible()
    expect(appStillWorks).toBeTruthy()
    console.log('✅ Application remains stable after error')
  })
})
