/**
 * Test database connection and utilities
 *
 * Provides a Drizzle database connection for integration tests
 * and utilities for running migrations and cleaning up data.
 */

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "@/server/db/schema";

// Store the test database connection
let testDbConnection: postgres.Sql | null = null;
let testDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get or create the test database connection
 */
export function getTestDb() {
	if (!testDb) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error("DATABASE_URL not set. Did the test setup run?");
		}

		testDbConnection = postgres(connectionString);
		testDb = drizzle(testDbConnection, { schema });
	}

	return testDb;
}

/**
 * Run Drizzle migrations on the test database
 */
export async function runMigrations(connectionString: string) {
	const migrationClient = postgres(connectionString, { max: 1 });
	const migrationDb = drizzle(migrationClient);

	await migrate(migrationDb, { migrationsFolder: "./drizzle" });
	await migrationClient.end();
}

/**
 * Clean all data from the database (for test isolation)
 * Truncates all tables in the correct order to respect foreign keys
 */
export async function cleanDatabase() {
	const db = getTestDb();

	// Disable foreign key checks, truncate all tables, re-enable
	await db.execute(sql`
		TRUNCATE TABLE 
			ai_message,
			ai_conversation,
			user_settings,
			trade_screenshot,
			trade_tag,
			tag,
			trade_execution,
			trade,
			account,
			account_group,
			"user"
		RESTART IDENTITY CASCADE
	`);
}

/**
 * Close the test database connection
 */
export async function closeTestDb() {
	if (testDbConnection) {
		await testDbConnection.end();
		testDbConnection = null;
		testDb = null;
	}
}
