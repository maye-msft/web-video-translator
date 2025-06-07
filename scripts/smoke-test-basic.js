#!/usr/bin/env node

/**
 * Basic Smoke Test using curl and simple checks
 *
 * This script provides a basic smoke test that doesn't require Playwright
 * It checks if the server is running and responds correctly
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')

const execAsync = promisify(exec)

class BasicSmokeTest {
  constructor() {
    this.baseUrl = 'http://localhost:5173/web-video-translator/'
    this.testResults = []
  }

  async log(message) {
    console.log(message)
  }

  async checkServerHealth() {
    await this.log('\n🔍 Checking server health...')

    try {
      const { stdout, stderr } = await execAsync(
        `curl -s -I "${this.baseUrl}" | head -1`
      )

      if (stdout.includes('200 OK') || stdout.includes('HTTP/')) {
        await this.log('✅ Server is responding')
        return true
      } else {
        await this.log(`❌ Server not responding properly: ${stdout}`)
        return false
      }
    } catch (error) {
      await this.log(`❌ Server health check failed: ${error.message}`)
      return false
    }
  }

  async checkBasicRoutes() {
    await this.log('\n📄 Testing basic routes...')

    const routes = ['/', '/step-1', '/step-2', '/step-3', '/step-4']
    let passedRoutes = 0

    for (const route of routes) {
      try {
        await this.log(`  Testing route: ${route}`)
        const { stdout, stderr } = await execAsync(
          `curl -s -w "%{http_code}" "${this.baseUrl}${route}" -o /dev/null`
        )

        const statusCode = stdout.trim()
        if (statusCode === '200') {
          await this.log(`  ✅ ${route} - OK (${statusCode})`)
          passedRoutes++
        } else {
          await this.log(`  ❌ ${route} - Status: ${statusCode}`)
        }
      } catch (error) {
        await this.log(`  ❌ ${route} - Error: ${error.message}`)
      }
    }

    await this.log(
      `📊 Route test results: ${passedRoutes}/${routes.length} passed`
    )
    return passedRoutes === routes.length
  }

  async checkStaticAssets() {
    await this.log('\n📦 Testing static assets...')

    try {
      // Check if HTML contains expected elements
      const { stdout } = await execAsync(`curl -s "${this.baseUrl}"`)

      const checks = [
        { test: stdout.includes('<title>'), name: 'HTML title tag' },
        { test: stdout.includes('id="app"'), name: 'Vue app mount point' },
        { test: stdout.includes('<script'), name: 'JavaScript includes' },
        {
          test: stdout.includes('css') || stdout.includes('style'),
          name: 'CSS references',
        },
      ]

      let passed = 0
      for (const check of checks) {
        if (check.test) {
          await this.log(`  ✅ ${check.name} - Found`)
          passed++
        } else {
          await this.log(`  ❌ ${check.name} - Missing`)
        }
      }

      return passed === checks.length
    } catch (error) {
      await this.log(`  ❌ Static assets check failed: ${error.message}`)
      return false
    }
  }

  async checkProjectStructure() {
    await this.log('\n🏗️ Checking project structure...')

    const requiredFiles = [
      'package.json',
      'vite.config.js',
      'src/main.ts',
      'src/App.vue',
      'src/components/WorkflowNavigation.vue',
    ]

    let foundFiles = 0
    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file)
      if (fs.existsSync(filePath)) {
        await this.log(`  ✅ ${file} - Found`)
        foundFiles++
      } else {
        await this.log(`  ❌ ${file} - Missing`)
      }
    }

    return foundFiles === requiredFiles.length
  }

  async checkBuildArtifacts() {
    await this.log('\n🔨 Checking if project can build...')

    try {
      await this.log('  Running build command...')
      const { stdout, stderr } = await execAsync('yarn build', {
        timeout: 60000,
        cwd: process.cwd(),
      })

      // Check if dist directory was created
      const distPath = path.join(process.cwd(), 'dist')
      if (fs.existsSync(distPath)) {
        const distContents = fs.readdirSync(distPath)
        if (distContents.length > 0) {
          await this.log('  ✅ Build successful - dist directory created')
          return true
        }
      }

      await this.log('  ❌ Build failed - no dist directory created')
      return false
    } catch (error) {
      await this.log(`  ❌ Build failed: ${error.message}`)
      return false
    }
  }

  async runAllTests() {
    const tests = [
      { name: 'Project Structure', fn: () => this.checkProjectStructure() },
      { name: 'Build Process', fn: () => this.checkBuildArtifacts() },
      { name: 'Server Health', fn: () => this.checkServerHealth() },
      { name: 'Basic Routes', fn: () => this.checkBasicRoutes() },
      { name: 'Static Assets', fn: () => this.checkStaticAssets() },
    ]

    await this.log('🚀 Starting basic smoke tests...')
    const startTime = Date.now()

    let passed = 0
    let failed = 0

    for (const test of tests) {
      try {
        const result = await test.fn()
        if (result) {
          passed++
          this.testResults.push({ name: test.name, status: 'PASSED' })
        } else {
          failed++
          this.testResults.push({ name: test.name, status: 'FAILED' })
        }
      } catch (error) {
        await this.log(`❌ ${test.name} failed with error: ${error.message}`)
        failed++
        this.testResults.push({
          name: test.name,
          status: 'ERROR',
          error: error.message,
        })
      }
    }

    const totalTime = Date.now() - startTime

    await this.log('\n' + '='.repeat(50))
    await this.log('📊 BASIC SMOKE TEST SUMMARY')
    await this.log('='.repeat(50))
    await this.log(`Total Tests: ${passed + failed}`)
    await this.log(`Passed: ${passed} ✅`)
    await this.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`)
    await this.log(`Duration: ${totalTime}ms`)
    await this.log(
      `Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
    )

    if (failed === 0) {
      await this.log('\n🎉 All basic smoke tests passed!')
    } else {
      await this.log(
        '\n⚠️ Some tests failed. Check the output above for details.'
      )

      await this.log('\n❌ FAILED TESTS:')
      this.testResults
        .filter(r => r.status !== 'PASSED')
        .forEach(async r => {
          await this.log(
            `  - ${r.name}: ${r.status}${r.error ? ` (${r.error})` : ''}`
          )
        })
    }

    await this.log('='.repeat(50))

    return failed === 0
  }
}

async function isServerRunning(url) {
  try {
    const { stdout } = await execAsync(
      `curl -s -w "%{http_code}" "${url}" -o /dev/null`,
      { timeout: 5000 }
    )
    return stdout.trim() === '200'
  } catch {
    return false
  }
}

async function startDevServer() {
  console.log('🚀 Starting development server...')

  const serverProcess = exec('yarn dev', { cwd: process.cwd() })

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 8000))

  // Check if server started
  let attempts = 0
  while (attempts < 15) {
    if (await isServerRunning('http://localhost:5173/web-video-translator/')) {
      console.log('✅ Development server started')
      return serverProcess
    }
    attempts++
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  throw new Error('Failed to start development server')
}

async function main() {
  const args = process.argv.slice(2)
  const startServer = args.includes('--start-server') || args.includes('-s')

  console.log('🔍 Web Video Translator - Basic Smoke Test')
  console.log('='.repeat(50))

  let serverProcess = null

  // Check if server is running, start if needed
  const serverRunning = await isServerRunning(
    'http://localhost:5173/web-video-translator/'
  )

  if (!serverRunning && !startServer) {
    console.log(
      '❌ Server is not running at http://localhost:5173/web-video-translator/'
    )
    console.log('💡 Start the development server with: yarn dev')
    console.log('💡 Or run this script with --start-server flag')
    process.exit(1)
  }

  if (!serverRunning && startServer) {
    try {
      serverProcess = await startDevServer()
    } catch (error) {
      console.log('❌ Failed to start development server:', error.message)
      process.exit(1)
    }
  }

  const smokeTest = new BasicSmokeTest()

  try {
    const success = await smokeTest.runAllTests()

    if (serverProcess) {
      console.log('🛑 Stopping development server...')
      serverProcess.kill('SIGTERM')
    }

    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('💥 Smoke test failed:', error.message)

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

module.exports = { BasicSmokeTest }
