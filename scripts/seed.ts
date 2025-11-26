import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "../src/db/schema";

// Load .env.local first, then .env
config({ path: ".env.local" });
config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema: { users } });

async function seed() {
	console.log("Seeding database...");

	// Create a test user
	const [user] = await db
		.insert(users)
		.values({
			email: "test@example.com",
			name: "Test User",
		})
		.onConflictDoNothing()
		.returning();

	console.log("Created user:", user);
	console.log("Seeding complete!");

	await pool.end();
}

seed().catch((error) => {
	console.error("Seeding failed:", error);
	process.exit(1);
});
