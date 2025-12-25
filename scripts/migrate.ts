import { config } from "dotenv";
import postgres from "postgres";

// Load env vars from .env file
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.error("❌ No DATABASE_URL found in environment");
	process.exit(1);
}

console.log("🔌 Connecting to database...");
const client = postgres(connectionString);

async function runMigration() {
	try {
		console.log("📦 Running account type enum migration...\n");

		// Step 1: Drop the column default first
		console.log("1. Dropping default constraint...");
		await client.unsafe(
			`ALTER TABLE "account" ALTER COLUMN "account_type" DROP DEFAULT`,
		);
		console.log("   ✓ Default dropped");

		// Step 2: Change to text temporarily
		console.log("2. Converting column to text...");
		await client.unsafe(
			`ALTER TABLE "account" ALTER COLUMN "account_type" SET DATA TYPE text`,
		);
		console.log("   ✓ Converted to text");

		// Step 3: Drop old enum
		console.log("3. Dropping old account_type enum...");
		await client.unsafe(`DROP TYPE "account_type"`);
		console.log("   ✓ Old enum dropped");

		// Step 4: Create new enum with prop firm types
		console.log("4. Creating new account_type enum...");
		await client.unsafe(
			`CREATE TYPE "account_type" AS ENUM ('prop_challenge', 'prop_funded', 'live', 'demo')`,
		);
		console.log("   ✓ New enum created");

		// Step 5: Cast back to enum
		console.log("5. Casting column to new enum...");
		await client.unsafe(
			`ALTER TABLE "account" ALTER COLUMN "account_type" SET DATA TYPE "account_type" USING "account_type"::"account_type"`,
		);
		console.log("   ✓ Column cast to new enum");

		// Step 6: Set new default
		console.log("6. Setting default value...");
		await client.unsafe(
			`ALTER TABLE "account" ALTER COLUMN "account_type" SET DEFAULT 'live'`,
		);
		console.log("   ✓ Default set to 'live'");

		console.log("\n✅ Migration complete!");
	} catch (e) {
		const error = e as Error & { code?: string };
		// Handle case where migration was already run
		if (error.code === "42704") {
			console.log("\n⚠️  Enum already migrated (type not found). Skipping...");
		} else if (error.code === "42601") {
			console.log("\n⚠️  Column already using new type. Skipping...");
		} else {
			console.error("\n❌ Migration failed:", error.message);
			throw e;
		}
	} finally {
		await client.end();
		console.log("🔌 Database connection closed");
	}
}

runMigration();
