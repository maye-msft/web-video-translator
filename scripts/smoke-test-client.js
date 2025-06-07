#!/usr/bin/env node

/**
 * Headless Smoke Test Client
 * 
 * This script provides a quick way to smoke test the web application
 * without the full Playwright test runner setup.
 */

import { chromium, Browser, Page } from '@playwright/test'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface SmokeTestResult {
  name: string
  success: boolean
  duration: number
  error?: string
  details?: string
}

class HeadlessSmokeTestClient {
  private browser: Browser | null = null
  private page: Page | null = null
  private baseUrl: string
  private results: SmokeTestResult[] = []

  constructor(baseUrl = 'http://localhost:5173') {
    this.baseUrl = baseUrl
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing headless smoke test client...')
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    })
    
    this.page = await this.browser.newPage()
    
    // Set up error tracking
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`)
      }
    })

    this.page.on('pageerror', error => {
      console.log(`Page Error: ${error.message}`)
    })

    console.log('✅ Headless browser initialized')
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close()
    }
    if (this.browser) {
      await this.browser.close()
    }
    console.log('🧹 Cleanup completed')
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now()
    
    try {
      console.log(`\n🧪 Running: ${name}`)
      await testFn()
      
      const duration = Date.now() - startTime
      this.results.push({
        name,
        success: true,
        duration
      })
      console.log(`✅ ${name} - PASSED (${duration}ms)`)
      
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      this.results.push({
        name,
        success: false,
        duration,
        error: errorMessage
      })
      console.log(`❌ ${name} - FAILED (${duration}ms)`)
      console.log(`   Error: ${errorMessage}`)
    }
  }

  async testApplicationLoad(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized')

    await this.page.goto(this.baseUrl)
    await this.page.waitForLoadState('networkidle', { timeout: 10000 })
    
    const title = await this.page.title()
    if (!title) {
      throw new Error('Page title is empty')
    }
    
    // Check if main app container exists
    const appContainer = this.page.locator('#app')
    const isVisible = await appContainer.isVisible()
    if (!isVisible) {
      throw new Error('Main app container is not visible')
    }
  }

  async testRouteNavigation(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized')

    const routes = ['/step-1', '/step-2', '/step-3', '/step-4']
    
    for (const route of routes) {
      await this.page.goto(`${this.baseUrl}${route}`)
      await this.page.waitForLoadState('networkidle', { timeout: 8000 })
      
      const currentUrl = this.page.url()
      if (!currentUrl.includes(route)) {
        throw new Error(`Failed to navigate to ${route}. Current URL: ${currentUrl}`)
      }
    }
  }

  async testWorkflowComponents(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized')

    await this.page.goto(`${this.baseUrl}/step-1`)
    await this.page.waitForLoadState('networkidle', { timeout: 8000 })

    // Check for workflow navigation
    const workflowElements = await this.page.locator('text="Upload Video", text="Generate Subtitles", text="Translate", text="Merge"').count()
    
    if (workflowElements === 0) {
      throw new Error('Workflow navigation components not found')
    }
  }

  async testResponsiveness(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized')

    await this.page.goto(this.baseUrl)
    await this.page.waitForLoadState('networkidle')

    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ]

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport)
      await this.page.waitForTimeout(500)
      
      const appContainer = this.page.locator('#app')
      const isVisible = await appContainer.isVisible()
      
      if (!isVisible) {
        throw new Error(`App container not visible at ${viewport.width}x${viewport.height}`)
      }
    }
  }

  async testBasicInteractivity(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized')

    await this.page.goto(this.baseUrl)
    await this.page.waitForLoadState('networkidle')

    // Test that JavaScript is working
    const jsWorking = await this.page.evaluate(() => {
      try {
        return typeof Array.prototype.map === 'function' && 
               typeof Promise !== 'undefined' &&
               document.querySelector('#app') !== null
      } catch {
        return false
      }
    })

    if (!jsWorking) {
      throw new Error('Basic JavaScript functionality not working')
    }
  }

  async runAllTests(): Promise<void> {
    const tests = [
      { name: 'Application Load', fn: () => this.testApplicationLoad() },
      { name: 'Route Navigation', fn: () => this.testRouteNavigation() },
      { name: 'Workflow Components', fn: () => this.testWorkflowComponents() },
      { name: 'Responsiveness', fn: () => this.testResponsiveness() },
      { name: 'Basic Interactivity', fn: () => this.testBasicInteractivity() }
    ]

    for (const test of tests) {
      await this.runTest(test.name, test.fn)
    }
  }

  printSummary(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 SMOKE TEST SUMMARY')
    console.log('='.repeat(60))

    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0)

    console.log(`Total Tests: ${this.results.length}`)
    console.log(`Passed: ${passed} ✅`)
    console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`)
    console.log(`Total Time: ${totalTime}ms`)
    console.log(`Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:')
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`)
        })
    }

    console.log('\n' + (failed === 0 ? '🎉 All smoke tests passed!' : '⚠️  Some tests failed'))
    console.log('='.repeat(60))
  }
}

// Utility function to check if server is running
async function isServerRunning(url: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

// Utility function to start dev server
async function startDevServer(): Promise<{ process: any, cleanup: () => void }> {
  console.log('🚀 Starting development server...')
  
  const serverProcess = exec('yarn dev', {
    cwd: process.cwd()
  })

  // Give the server time to start
  await new Promise(resolve => setTimeout(resolve, 5000))

  // Wait for server to be responsive
  let attempts = 0
  const maxAttempts = 20
  
  while (attempts < maxAttempts) {
    if (await isServerRunning('http://localhost:5173')) {
      console.log('✅ Development server is running')
      break
    }
    
    attempts++
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (attempts === maxAttempts) {
    throw new Error('Failed to start development server')
  }

  return {
    process: serverProcess,
    cleanup: () => {
      if (serverProcess.pid) {
        process.kill(serverProcess.pid, 'SIGTERM')
      }
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const shouldStartServer = args.includes('--start-server')
  const baseUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:5173'

  let serverCleanup: (() => void) | undefined

  try {
    // Check if server is already running or start it
    const isRunning = await isServerRunning(baseUrl)
    
    if (!isRunning && shouldStartServer) {
      const server = await startDevServer()
      serverCleanup = server.cleanup
    } else if (!isRunning) {
      console.log('❌ Server is not running. Start the server or use --start-server flag.')
      console.log('Usage: node smoke-test-client.js [--start-server] [--url=http://localhost:5173]')
      process.exit(1)
    }

    // Run smoke tests
    const client = new HeadlessSmokeTestClient(baseUrl)
    
    await client.initialize()
    await client.runAllTests()
    await client.cleanup()
    
    client.printSummary()

    // Exit with appropriate code
    const hasFailures = client.results.some(r => !r.success)
    process.exit(hasFailures ? 1 : 0)

  } catch (error) {
    console.error('💥 Smoke test client failed:', error)
    process.exit(1)
  } finally {
    if (serverCleanup) {
      console.log('🛑 Stopping development server...')
      serverCleanup()
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Smoke test interrupted')
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Smoke test terminated')
  process.exit(1)
})

if (require.main === module) {
  main().catch(console.error)
}

export { HeadlessSmokeTestClient }
