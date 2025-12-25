import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Use the src/test/setup.ts for global setup
		globalSetup: ["./src/test/setup.ts"],

		// Include test files
		include: ["src/**/*.test.ts", "src/**/*.spec.ts"],

		// Exclude e2e tests (those run with Playwright)
		exclude: ["node_modules", "e2e/**"],

		// Test environment
		environment: "node",

		// Increase timeout for integration tests with containers
		testTimeout: 30000,
		hookTimeout: 60000,

		// Run tests sequentially for database isolation (Vitest 4 config)
		isolate: false,
		sequence: {
			concurrent: false,
		},

		// Coverage configuration
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/server/**/*.ts", "src/lib/**/*.ts"],
			exclude: ["src/test/**", "**/*.test.ts", "**/*.spec.ts"],
		},
	},

	// Path aliases matching tsconfig.json
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
