#!/usr/bin/env node

/**
 * Simple Headless Smoke Test Runner
 *
 * This script runs basic smoke tests to verify the web app launches successfully
 * Uses Playwright but in a simplified manner for quick verification
 */

const { chromium } = require('playwright')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

class SimpleSmokeTest {
  constructor() {
    this.baseUrl = 'http://localhost:5173/web-video-translator/'
    this.browser = null
    this.page = null
    this.testResults = []
  }

  async init() {
    console.log('🔧 Initializing headless browser...')
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    this.page = await this.browser.newPage()

    // Track errors
    this.page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`)
    })

    console.log('✅ Browser initialized')
  }

  async cleanup() {
    if (this.page) await this.page.close()
    if (this.browser) await this.browser.close()
  }

  async checkServerHealth() {
    console.log('\n🔍 Checking server health...')

    try {
      await this.page.goto(this.baseUrl, { timeout: 10000 })
      await this.page.waitForLoadState('networkidle', { timeout: 10000 })

      const title = await this.page.title()
      console.log(`✅ Server is responding. Page title: "${title}"`)
      return true
    } catch (error) {
      console.log(`❌ Server health check failed: ${error.message}`)
      return false
    }
  }

  async testPageLoads() {
    console.log('\n📄 Testing page loads...')

    const routes = ['/', '/step-1', '/step-2', '/step-3', '/step-4']
    let passedRoutes = 0

    for (const route of routes) {
      try {
        console.log(`  Testing route: ${route}`)
        await this.page.goto(`${this.baseUrl}${route}`, { timeout: 8000 })
        await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 })

        // Check if page loaded successfully
        const isAppVisible = await this.page.locator('#app').isVisible()
        if (isAppVisible) {
          console.log(`  ✅ ${route} - OK`)
          passedRoutes++
        } else {
          console.log(`  ❌ ${route} - App container not visible`)
        }
      } catch (error) {
        console.log(`  ❌ ${route} - Error: ${error.message}`)
      }
    }

    console.log(
      `📊 Route test results: ${passedRoutes}/${routes.length} passed`
    )
    return passedRoutes === routes.length
  }

  async testBasicFunctionality() {
    console.log('\n⚙️ Testing basic functionality...')

    try {
      await this.page.goto(this.baseUrl)
      await this.page.waitForLoadState('networkidle', { timeout: 8000 })

      // Test JavaScript execution
      const jsTest = await this.page.evaluate(() => {
        try {
          // Test basic JS features
          const testArray = [1, 2, 3]
          const mapped = testArray.map(x => x * 2)
          return mapped.length === 3 && typeof Promise !== 'undefined'
        } catch {
          return false
        }
      })

      if (jsTest) {
        console.log('  ✅ JavaScript execution - OK')
      } else {
        console.log('  ❌ JavaScript execution - Failed')
        return false
      }

      // Test if CSS is loaded (check for styled elements)
      const cssTest = await this.page.evaluate(() => {
        const styledElements = document.querySelectorAll(
          '[class*="bg-"], [class*="text-"], [class*="flex"]'
        )
        return styledElements.length > 0
      })

      if (cssTest) {
        console.log('  ✅ CSS styling - OK')
      } else {
        console.log('  ❌ CSS styling - No styled elements found')
        return false
      }

      return true
    } catch (error) {
      console.log(`  ❌ Basic functionality test failed: ${error.message}`)
      return false
    }
  }

  async testResponsive() {
    console.log('\n📱 Testing responsive design...')

    try {
      await this.page.goto(this.baseUrl)
      await this.page.waitForLoadState('networkidle')

      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' },
      ]

      for (const viewport of viewports) {
        await this.page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await this.page.waitForTimeout(500)

        const isVisible = await this.page.locator('#app').isVisible()
        if (isVisible) {
          console.log(
            `  ✅ ${viewport.name} (${viewport.width}x${viewport.height}) - OK`
          )
        } else {
          console.log(
            `  ❌ ${viewport.name} (${viewport.width}x${viewport.height}) - App not visible`
          )
          return false
        }
      }

      return true
    } catch (error) {
      console.log(`  ❌ Responsive test failed: ${error.message}`)
      return false
    }
  }

  async runAllTests() {
    const tests = [
      { name: 'Server Health', fn: () => this.checkServerHealth() },
      { name: 'Page Loads', fn: () => this.testPageLoads() },
      { name: 'Basic Functionality', fn: () => this.testBasicFunctionality() },
      { name: 'Responsive Design', fn: () => this.testResponsive() },
    ]

    console.log('🚀 Starting smoke tests...')
    const startTime = Date.now()

    let passed = 0
    let failed = 0

    for (const test of tests) {
      try {
        const result = await test.fn()
        if (result) {
          passed++
        } else {
          failed++
        }
      } catch (error) {
        console.log(`❌ ${test.name} failed with error: ${error.message}`)
        failed++
      }
    }

    const totalTime = Date.now() - startTime

    console.log('\n' + '='.repeat(50))
    console.log('📊 SMOKE TEST SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${passed + failed}`)
    console.log(`Passed: ${passed} ✅`)
    console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`)
    console.log(`Duration: ${totalTime}ms`)
    console.log(
      `Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
    )

    if (failed === 0) {
      console.log('\n🎉 All smoke tests passed! Application is ready.')
    } else {
      console.log('\n⚠️ Some tests failed. Check the output above for details.')
    }

    console.log('='.repeat(50))

    return failed === 0
  }
}

async function isServerRunning(url) {
  try {
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    await page.goto(url, { timeout: 5000 })
    await browser.close()
    return true
  } catch {
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  const startServer = args.includes('--start-server') || args.includes('-s')

  console.log('🔍 Web Video Translator - Headless Smoke Test')
  console.log('='.repeat(50))

  // Check if server is running
  const serverRunning = await isServerRunning('http://localhost:5173')

  if (!serverRunning && !startServer) {
    console.log('❌ Server is not running at http://localhost:5173')
    console.log('💡 Start the development server with: yarn dev')
    console.log('💡 Or run this script with --start-server flag')
    process.exit(1)
  }

  let serverProcess = null

  if (!serverRunning && startServer) {
    console.log('🚀 Starting development server...')
    serverProcess = exec('yarn dev')

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Check if server started
    let attempts = 0
    while (attempts < 10) {
      if (await isServerRunning('http://localhost:5173')) {
        console.log('✅ Development server started')
        break
      }
      attempts++
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (attempts === 10) {
      console.log('❌ Failed to start development server')
      process.exit(1)
    }
  }

  const smokeTest = new SimpleSmokeTest()

  try {
    await smokeTest.init()
    const success = await smokeTest.runAllTests()
    await smokeTest.cleanup()

    if (serverProcess) {
      console.log('🛑 Stopping development server...')
      serverProcess.kill('SIGTERM')
    }

    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('💥 Smoke test failed:', error.message)

    await smokeTest.cleanup()

    if (serverProcess) {
      serverProcess.kill('SIGTERM')
    }

    process.exit(1)
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted')
  process.exit(1)
})

if (require.main === module) {
  main()
}

module.exports = { SimpleSmokeTest }
