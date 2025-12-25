/**
 * Global test setup for Vitest
 *
 * This file handles the Testcontainers PostgreSQL lifecycle:
 * - Starts a Postgres container before all tests
 * - Runs Drizzle migrations
 * - Tears down the container after all tests
 */

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer | null = null;

export async function setup() {
	// Skip env validation in tests
	process.env.SKIP_ENV_VALIDATION = "1";

	// Mock Clerk keys for tests (not used but required by env schema)
	process.env.CLERK_SECRET_KEY = "test_clerk_secret_key";
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "test_clerk_publishable_key";

	console.log("\n🐳 Starting PostgreSQL container...");

	try {
		container = await new PostgreSqlContainer("postgres:16-alpine")
			.withDatabase("edgejournal_test")
			.withUsername("test")
			.withPassword("test")
			.start();

		const connectionString = container.getConnectionUri();
		console.log(`✅ PostgreSQL container started at ${connectionString}`);

		// Set environment variables for the test database
		process.env.DATABASE_URL = connectionString;

		// Run migrations
		console.log("🔄 Running database migrations...");
		const { runMigrations } = await import("./db.js");
		await runMigrations(connectionString);
		console.log("✅ Migrations complete\n");
	} catch (error) {
		console.error("\n❌ Failed to start PostgreSQL container");
		console.error("   Make sure Docker is running on your machine.");
		console.error("   On macOS: Open Docker Desktop or run 'open -a Docker'\n");
		throw error;
	}
}

export async function teardown() {
	if (container) {
		console.log("\n🐳 Stopping PostgreSQL container...");
		await container.stop();
		console.log("✅ PostgreSQL container stopped\n");
	}
}
