/**
 * Authentication setup for Playwright E2E tests
 *
 * This file handles logging in before tests run and saving the auth state.
 * All tests that depend on the "setup" project will use the saved auth state.
 *
 * For Clerk authentication, you have several options:
 * 1. Use Clerk's testing tokens (recommended for CI)
 * 2. Create a dedicated test user and log in via UI
 * 3. Use Clerk's bypass mode for testing
 *
 * @see https://clerk.com/docs/testing/overview
 */

import path from "node:path";
import { expect, test as setup } from "@playwright/test";

// Path to save the authenticated state
const authFile = path.join(__dirname, ".auth/user.json");

/**
 * Setup: Authenticate as a test user
 *
 * IMPORTANT: Configure one of these authentication methods:
 *
 * Option 1: Clerk Testing Tokens (Recommended)
 * - Set CLERK_TESTING_TOKEN in your .env.test
 * - See: https://clerk.com/docs/testing/testing-tokens
 *
 * Option 2: Real User Login (shown below)
 * - Create a test user in Clerk dashboard
 * - Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD in .env.test
 */
setup("authenticate", async ({ page }) => {
	const testEmail = process.env.E2E_TEST_EMAIL;
	const testPassword = process.env.E2E_TEST_PASSWORD;

	if (!testEmail || !testPassword) {
		console.warn(
			"⚠️  E2E_TEST_EMAIL and E2E_TEST_PASSWORD not set. Skipping auth setup.",
		);
		console.warn(
			"   To enable authenticated tests, create a test user in Clerk",
		);
		console.warn("   and set these environment variables.");

		// Create an empty auth state file so tests can still run
		// (they'll just be unauthenticated)
		await page.context().storageState({ path: authFile });
		return;
	}

	// Navigate to sign-in page
	await page.goto("/sign-in");

	// Wait for Clerk to load
	await page.waitForSelector('[data-clerk-component="sign-in"]', {
		timeout: 10000,
	});

	// Fill in email
	await page.getByLabel("Email address").fill(testEmail);
	await page.getByRole("button", { name: "Continue" }).click();

	// Fill in password
	await page.getByLabel("Password").fill(testPassword);
	await page.getByRole("button", { name: "Continue" }).click();

	// Wait for redirect to dashboard
	await page.waitForURL("/dashboard", { timeout: 15000 });

	// Verify we're logged in
	await expect(page).toHaveURL("/dashboard");

	// Save the authenticated state
	await page.context().storageState({ path: authFile });

	console.log("✅ Authentication successful, state saved to", authFile);
});
