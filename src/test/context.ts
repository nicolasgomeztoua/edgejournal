/**
 * Test context creator for tRPC
 *
 * Creates a mock tRPC context that bypasses Clerk authentication
 * and uses the test database connection.
 */

import type { User } from "@/server/db/schema";
import { getTestDb } from "./db";
import { createTestUser } from "./factories";

/**
 * Create a test context for tRPC procedures
 *
 * This bypasses Clerk authentication and provides a real user from the test database.
 * Use this to call tRPC procedures directly in integration tests.
 *
 * @param userOverrides - Optional overrides for the test user
 * @returns A context object compatible with tRPC procedures
 */
export async function createTestContext(
	userOverrides?: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
) {
	const db = getTestDb();
	const user = await createTestUser(userOverrides);

	return {
		db,
		user,
		userId: user.clerkId,
		headers: new Headers(),
	};
}

/**
 * Create a test context with a specific existing user
 *
 * Use this when you need to test with a pre-created user
 * (e.g., testing relationships between users)
 */
export function createTestContextWithUser(user: User) {
	const db = getTestDb();

	return {
		db,
		user,
		userId: user.clerkId,
		headers: new Headers(),
	};
}

/**
 * Type for the test context
 * Compatible with the real tRPC context from src/server/api/trpc.ts
 */
export type TestContext = Awaited<ReturnType<typeof createTestContext>>;
