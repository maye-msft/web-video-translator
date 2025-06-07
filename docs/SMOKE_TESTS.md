# Headless Smoke Test Client

This directory contains headless smoke test clients for the Web Video Translator application. These tests verify that the web application can be launched successfully and that all critical components are working without errors.

## Available Test Scripts

### 1. Comprehensive Smoke Tests (Playwright)

**File:** `e2e/smoke-comprehensive.spec.ts`

This is a full Playwright test suite that runs comprehensive smoke tests including:

- Application launch verification
- Workflow navigation component testing
- Route navigation testing
- Core Vue components verification
- Static assets loading verification
- JavaScript bundle execution testing
- Responsive design testing
- Performance smoke testing
- Error boundary testing

**Usage:**

```bash
# Run comprehensive smoke tests
yarn smoke

# Run all Playwright tests including smoke tests
yarn e2e

# Run with UI mode
yarn e2e:ui
```

### 2. Simple Headless Smoke Test

**File:** `scripts/smoke-test-simple.js`

A lightweight Node.js script that performs basic smoke tests:

- Server health check
- Page load verification for all routes
- Basic JavaScript functionality testing
- CSS styling verification
- Responsive design testing

**Usage:**

```bash
# Run with existing server (server must be running at localhost:5173)
yarn smoke:headless

# Run and automatically start/stop the dev server
yarn smoke:headless:start

# Or run directly
node scripts/smoke-test-simple.js
node scripts/smoke-test-simple.js --start-server
```

### 3. Advanced Headless Client

**File:** `scripts/smoke-test-client.js`

A more advanced headless client with detailed error tracking and reporting:

- Application load testing with error tracking
- Route navigation with URL validation
- Workflow component verification
- Responsiveness testing across multiple viewports
- Basic interactivity testing
- Detailed reporting and summary

**Usage:**

```bash
# Run with existing server
node scripts/smoke-test-client.js

# Run and automatically start server
node scripts/smoke-test-client.js --start-server

# Run with custom URL
node scripts/smoke-test-client.js --url=http://localhost:3000
```

## Test Results

All smoke test scripts provide detailed output including:

- Individual test results with pass/fail status
- Error messages for failed tests
- Performance metrics (load times)
- Summary statistics
- Success rate percentage

### Example Output

```
🔍 Web Video Translator - Headless Smoke Test
==================================================

🔧 Initializing headless browser...
✅ Browser initialized

🔍 Checking server health...
✅ Server is responding. Page title: "Web Video Translator"

📄 Testing page loads...
  Testing route: /
  ✅ / - OK
  Testing route: /step-1
  ✅ /step-1 - OK
  Testing route: /step-2
  ✅ /step-2 - OK
  Testing route: /step-3
  ✅ /step-3 - OK
  Testing route: /step-4
  ✅ /step-4 - OK
📊 Route test results: 5/5 passed

⚙️ Testing basic functionality...
  ✅ JavaScript execution - OK
  ✅ CSS styling - OK

📱 Testing responsive design...
  ✅ Desktop (1920x1080) - OK
  ✅ Tablet (768x1024) - OK
  ✅ Mobile (375x667) - OK

==================================================
📊 SMOKE TEST SUMMARY
==================================================
Total Tests: 4
Passed: 4 ✅
Failed: 0
Duration: 2847ms
Success Rate: 100.0%

🎉 All smoke tests passed! Application is ready.
==================================================
```

## Integration with CI/CD

These smoke tests are designed to be integrated into CI/CD pipelines:

### GitHub Actions Example

```yaml
- name: Run Smoke Tests
  run: |
    yarn install
    yarn build
    yarn smoke:headless:start
```

### Exit Codes

- `0`: All tests passed
- `1`: One or more tests failed or error occurred

## Troubleshooting

### Common Issues

1. **Server not running**

   - Solution: Use `--start-server` flag or start dev server manually with `yarn dev`

2. **Port conflicts**

   - Solution: Use `--url` parameter to specify different port

3. **Timeout errors**

   - Solution: Increase timeout values in test scripts or check server performance

4. **Browser launch issues**
   - Solution: Ensure Playwright browsers are installed: `npx playwright install`

### Debug Mode

For debugging failed tests, you can:

1. Check console output for detailed error messages
2. Use Playwright's debug mode: `yarn e2e --debug`
3. Enable headed mode by modifying `headless: false` in test scripts

## Customization

### Adding New Tests

To add new smoke tests:

1. **In Playwright suite**: Add new test cases to `smoke-comprehensive.spec.ts`
2. **In simple script**: Add new test methods to `SimpleSmokeTest` class
3. **In advanced client**: Add new test methods to `HeadlessSmokeTestClient` class

### Configuration

Test configuration can be modified:

- **Timeouts**: Adjust timeout values for slower environments
- **Viewports**: Add/modify responsive test viewports
- **Routes**: Update route lists to match application routes
- **Error filtering**: Customize error filtering logic

## Best Practices

1. **Run smoke tests** before every deployment
2. **Include in CI/CD** pipeline as a quality gate
3. **Monitor performance** metrics over time
4. **Update tests** when adding new routes or components
5. **Test multiple browsers** in production environments
