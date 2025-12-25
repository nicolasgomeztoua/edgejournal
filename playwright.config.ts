import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E tests
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	// Test directory
	testDir: "./e2e",

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Opt out of parallel tests on CI for stability
	workers: process.env.CI ? 1 : undefined,

	// Reporter to use
	reporter: [["html", { open: "never" }], ["list"]],

	// Shared settings for all projects
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: "http://localhost:3000",

		// Collect trace when retrying the failed test
		trace: "on-first-retry",

		// Take screenshot on failure
		screenshot: "only-on-failure",

		// Video on failure
		video: "on-first-retry",
	},

	// Configure projects for major browsers
	projects: [
		// Setup project - handles authentication
		{
			name: "setup",
			testMatch: /.*\.setup\.ts/,
		},

		// Main test project
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				// Use saved auth state from setup
				storageState: "e2e/.auth/user.json",
			},
			dependencies: ["setup"],
		},

		// Optional: Test on Firefox
		// {
		// 	name: "firefox",
		// 	use: {
		// 		...devices["Desktop Firefox"],
		// 		storageState: "e2e/.auth/user.json",
		// 	},
		// 	dependencies: ["setup"],
		// },
	],

	// Run your local dev server before starting the tests
	webServer: {
		command: "bun run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},

	// Global timeout for each test
	timeout: 30 * 1000,

	// Expect timeout
	expect: {
		timeout: 10 * 1000,
	},
});
