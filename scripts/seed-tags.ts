import { Client } from "pg";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });
config();

async function seedTags() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();
		console.log("Connected to database");

		// Get the first user
		const userResult = await client.query(
			"SELECT id FROM users ORDER BY id LIMIT 1",
		);

		if (userResult.rows.length === 0) {
			console.log("No users found. Please create a user first.");
			return;
		}

		const userId = userResult.rows[0].id;
		console.log(`Seeding tags for user ID: ${userId}`);

		// Sample tags to insert
		const sampleTags = [
			{ tag: "receipt", usageCount: 5 },
			{ tag: "expense", usageCount: 4 },
			{ tag: "food", usageCount: 3 },
			{ tag: "project-alpha", usageCount: 8 },
			{ tag: "meeting", usageCount: 6 },
			{ tag: "invoice", usageCount: 2 },
			{ tag: "work", usageCount: 10 },
			{ tag: "personal", usageCount: 3 },
			{ tag: "urgent", usageCount: 1 },
			{ tag: "todo", usageCount: 7 },
		];

		for (const { tag, usageCount } of sampleTags) {
			await client.query(
				`INSERT INTO tags (user_id, tag, first_used, last_used, usage_count)
				 VALUES ($1, $2, NOW(), NOW(), $3)
				 ON CONFLICT (user_id, tag) DO UPDATE
				 SET usage_count = $3, last_used = NOW()`,
				[userId, tag, usageCount],
			);
			console.log(`✓ Inserted tag: #${tag} (${usageCount} uses)`);
		}

		console.log("\n✅ Successfully seeded tags!");
		console.log(
			"\nNow try typing '#' in the notes field to see autocomplete suggestions.",
		);
	} catch (error) {
		console.error("Error seeding tags:", error);
	} finally {
		await client.end();
	}
}

seedTags();
