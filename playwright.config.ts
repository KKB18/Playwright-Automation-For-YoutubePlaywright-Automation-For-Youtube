import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  reporter: [
    ['list'], // show results in console
    ['html', { outputFolder: 'test-results', open: 'never' }],
    ['json', { outputFile: 'test-results/report.json' }],
    ['junit', { outputFile: 'test-results/report.xml' }],
    ['./Utilities/custom-reporter.js'] // Custom report generator
  ],
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // globalSetup: './src/test/helper/browser/globalSetup.ts',
  // globalTeardown: './src/test/helper/browser/globalTeardown.ts',
  globalTimeout: 60 * 60 * 1000,
  expect: {
    timeout: 10000
  },
  // grep: /smoke/
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    // baseURL: 'https://practice.expandtesting.com',
    // browserName: 'firefox',
    // headless: true,
    // colorScheme: 'dark',
    viewport: { width: 1280, height: 720 },
    // ignoreHTTPSErrors: true,
    // acceptDownloads: false,
    // actionTimeout: 0,
    // navigationTimeout: 0,
    // video: 'on',
    // storageState: 'state.json',
    // geolocation: { longitude: 12.492507, latitude: 41.889938 },
    // timezoneId: 'America/New_York',
    // hasTouch: true,
    // locale: 'en-US',


    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true, viewport: { width: 1920, height: 1080 } }
    },
    // {
    //   name: 'Api tag SpecFiles',
    //   testDir: './SpecFiles',
    //   grep: /@API/,
    //   use: {
    //     ...devices['Desktop Chrome'], headless: false, viewport: { width: 1920, height: 1080 }
    //   },
    //   outputDir: '',
    //   timeout: 10000
    // }

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], headless: false, viewport: { width: 1920, height: 1080 } },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile view ports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
