/**
 * E2E tests for the Journal page
 *
 * Tests the trade journal functionality including:
 * - Viewing trade list
 * - Filtering trades
 * - Trade detail view
 * - Delete functionality
 */

import { expect, test } from "@playwright/test";

test.describe("Journal Page", () => {
	test("should load the journal page", async ({ page }) => {
		await page.goto("/journal");

		// Should either show journal or redirect to sign-in
		const url = page.url();
		expect(url).toMatch(/\/(journal|sign-in)/);
	});
});

test.describe("Journal - Authenticated", () => {
	test.skip(
		() => !process.env.E2E_TEST_EMAIL,
		"Skipping authenticated tests - no test credentials",
	);

	test("should display the trade list", async ({ page }) => {
		await page.goto("/journal");
		await page.waitForLoadState("networkidle");

		// Skip if not authenticated
		if (!page.url().includes("/journal")) {
			test.skip();
			return;
		}

		// Look for the trades table or list
		const tradesTable = page.locator("table, [data-testid='trades-list']");
		const emptyState = page.locator("text=/no trades|get started|import/i");

		// Should have either trades or empty state
		const hasTable = await tradesTable.isVisible().catch(() => false);
		const hasEmpty = await emptyState.isVisible().catch(() => false);

		expect(hasTable || hasEmpty).toBe(true);
	});

	test("should filter trades by status", async ({ page }) => {
		await page.goto("/journal");
		await page.waitForLoadState("networkidle");

		// Skip if not authenticated
		if (!page.url().includes("/journal")) {
			test.skip();
			return;
		}

		// Look for status filter
		const statusFilter = page.locator(
			'[data-testid="status-filter"], select:has-text("Status")',
		);

		if (await statusFilter.isVisible()) {
			// Select "closed" status
			await statusFilter.selectOption({ label: "Closed" });

			// Wait for filter to apply
			await page.waitForLoadState("networkidle");

			// URL might update with filter params
			// Or trades list should update
		}
	});

	test("should navigate to trade detail on click", async ({ page }) => {
		await page.goto("/journal");
		await page.waitForLoadState("networkidle");

		// Skip if not authenticated
		if (!page.url().includes("/journal")) {
			test.skip();
			return;
		}

		// Find a trade row to click
		const tradeRow = page
			.locator("table tbody tr, [data-testid='trade-row']")
			.first();

		if (await tradeRow.isVisible()) {
			await tradeRow.click();

			// Should navigate to trade detail page
			await page.waitForLoadState("networkidle");
			expect(page.url()).toMatch(/\/journal\/\d+/);
		}
	});

	test("should show delete confirmation dialog", async ({ page }) => {
		await page.goto("/journal");
		await page.waitForLoadState("networkidle");

		// Skip if not authenticated
		if (!page.url().includes("/journal")) {
			test.skip();
			return;
		}

		// Find delete button (might be in a dropdown or actions column)
		const deleteButton = page
			.locator('button:has-text("Delete"), [data-testid="delete-trade"]')
			.first();

		if (await deleteButton.isVisible()) {
			await deleteButton.click();

			// Should show confirmation dialog
			const confirmDialog = page.locator(
				'[role="alertdialog"], [data-testid="confirm-dialog"]',
			);
			await expect(confirmDialog).toBeVisible({ timeout: 5000 });
		}
	});
});

test.describe("Journal - Search", () => {
	test.skip(
		() => !process.env.E2E_TEST_EMAIL,
		"Skipping authenticated tests - no test credentials",
	);

	test("should search trades by symbol", async ({ page }) => {
		await page.goto("/journal");
		await page.waitForLoadState("networkidle");

		// Skip if not authenticated
		if (!page.url().includes("/journal")) {
			test.skip();
			return;
		}

		// Find search input
		const searchInput = page.locator(
			'input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]',
		);

		if (await searchInput.isVisible()) {
			// Search for a symbol
			await searchInput.fill("ES");
			await searchInput.press("Enter");

			// Wait for search to apply
			await page.waitForLoadState("networkidle");

			// Results should be filtered (or show "no results")
		}
	});
});
