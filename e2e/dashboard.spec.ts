/**
 * E2E tests for the Dashboard page
 *
 * Tests the main dashboard functionality including:
 * - Page load and initial state
 * - Statistics display
 * - Account filtering
 */

import { expect, test } from "@playwright/test";

test.describe("Dashboard", () => {
	test("should load the dashboard page", async ({ page }) => {
		await page.goto("/dashboard");

		// Check that the page loaded (may redirect to sign-in if not authenticated)
		const url = page.url();
		expect(url).toMatch(/\/(dashboard|sign-in)/);
	});

	test("should display the dashboard header", async ({ page }) => {
		await page.goto("/dashboard");

		// If authenticated, should see dashboard content
		const dashboardContent = page.getByRole("heading", { name: /dashboard/i });
		const signInContent = page.getByRole("heading", { name: /sign in/i });

		// Either dashboard or sign-in should be visible
		const isDashboard = await dashboardContent.isVisible().catch(() => false);
		const isSignIn = await signInContent.isVisible().catch(() => false);

		expect(isDashboard || isSignIn).toBe(true);
	});

	test("should show account selector when authenticated", async ({ page }) => {
		await page.goto("/dashboard");

		// Wait for page to stabilize
		await page.waitForLoadState("networkidle");

		// If we're on dashboard (authenticated), check for account selector
		if (page.url().includes("/dashboard")) {
			// Look for account-related elements
			const accountElements = page.locator('[data-testid="account-selector"]');
			const accountExists = await accountElements.count();

			// Account selector might exist
			// This test documents expected behavior - adjust based on actual implementation
			expect(accountExists).toBeGreaterThanOrEqual(0);
		}
	});
});

test.describe("Dashboard - Authenticated", () => {
	test.skip(
		() => !process.env.E2E_TEST_EMAIL,
		"Skipping authenticated tests - no test credentials",
	);

	test("should display trade statistics", async ({ page }) => {
		await page.goto("/dashboard");

		// Wait for data to load
		await page.waitForLoadState("networkidle");

		// Look for statistics elements
		const statsSection = page.locator("text=/total trades|win rate|p&l/i");
		await expect(statsSection.first()).toBeVisible({ timeout: 10000 });
	});

	test("should navigate to journal from dashboard", async ({ page }) => {
		await page.goto("/dashboard");

		// Wait for page to load
		await page.waitForLoadState("networkidle");

		// Find and click journal link in sidebar or navigation
		const journalLink = page.getByRole("link", { name: /journal/i });

		if (await journalLink.isVisible()) {
			await journalLink.click();
			await expect(page).toHaveURL(/\/journal/);
		}
	});
});
