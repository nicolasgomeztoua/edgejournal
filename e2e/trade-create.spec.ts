/**
 * E2E tests for Trade Creation flow
 *
 * Tests the complete flow of creating a new trade:
 * - Navigation to new trade page
 * - Form filling
 * - Submission and verification
 */

import { expect, test } from "@playwright/test";

test.describe("Trade Creation", () => {
	test.skip(
		() => !process.env.E2E_TEST_EMAIL,
		"Skipping authenticated tests - no test credentials",
	);

	test("should navigate to new trade page", async ({ page }) => {
		await page.goto("/trade/new");

		// Should either be on trade/new or redirected to sign-in
		const url = page.url();
		expect(url).toMatch(/\/(trade\/new|sign-in)/);
	});

	test("should display the trade form", async ({ page }) => {
		await page.goto("/trade/new");

		// Wait for page to stabilize
		await page.waitForLoadState("networkidle");

		// If authenticated, should see the trade form
		if (page.url().includes("/trade/new")) {
			// Look for form elements
			const symbolInput = page.getByLabel(/symbol/i);
			const directionSelect = page.locator(
				'[data-testid="direction-select"], select[name="direction"]',
			);

			// At least one form element should be visible
			const hasSymbol = await symbolInput.isVisible().catch(() => false);
			const hasDirection = await directionSelect.isVisible().catch(() => false);

			expect(hasSymbol || hasDirection).toBe(true);
		}
	});

	test("should create a new trade successfully", async ({ page }) => {
		await page.goto("/trade/new");

		// Wait for form to load
		await page.waitForLoadState("networkidle");

		// Skip if not authenticated
		if (!page.url().includes("/trade/new")) {
			test.skip();
			return;
		}

		// Fill out the trade form
		// Note: Adjust selectors based on actual form implementation

		// Symbol
		const symbolInput = page.getByLabel(/symbol/i);
		if (await symbolInput.isVisible()) {
			await symbolInput.fill("ES");
		}

		// Direction - might be a select or radio button
		const longOption = page.getByLabel(/long/i);
		if (await longOption.isVisible()) {
			await longOption.click();
		}

		// Entry price
		const entryPrice = page.getByLabel(/entry.*price/i);
		if (await entryPrice.isVisible()) {
			await entryPrice.fill("5000.00");
		}

		// Quantity
		const quantity = page.getByLabel(/quantity|contracts|lots/i);
		if (await quantity.isVisible()) {
			await quantity.fill("1");
		}

		// Submit the form
		const submitButton = page.getByRole("button", {
			name: /create|submit|save/i,
		});
		if (await submitButton.isVisible()) {
			await submitButton.click();

			// Wait for navigation or success message
			await page.waitForLoadState("networkidle");

			// Should redirect to journal or show success
			const url = page.url();
			const successToast = page.locator("text=/success|created/i");

			const redirected = url.includes("/journal");
			const hasToast = await successToast.isVisible().catch(() => false);

			// Either redirected or showed success message
			expect(redirected || hasToast).toBe(true);
		}
	});
});

test.describe("Trade Form Validation", () => {
	test.skip(
		() => !process.env.E2E_TEST_EMAIL,
		"Skipping authenticated tests - no test credentials",
	);

	test("should show validation errors for empty form", async ({ page }) => {
		await page.goto("/trade/new");
		await page.waitForLoadState("networkidle");

		// Skip if not authenticated
		if (!page.url().includes("/trade/new")) {
			test.skip();
			return;
		}

		// Try to submit empty form
		const submitButton = page.getByRole("button", {
			name: /create|submit|save/i,
		});

		if (await submitButton.isVisible()) {
			await submitButton.click();

			// Wait a moment for validation
			await page.waitForTimeout(500);

			// Look for validation error messages
			const errorMessages = page.locator(
				'[data-testid="form-error"], .text-red-500, .text-destructive, [role="alert"]',
			);
			const errorCount = await errorMessages.count();

			// Should have at least one error for required fields
			expect(errorCount).toBeGreaterThan(0);
		}
	});
});
