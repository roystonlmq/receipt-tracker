import { Client } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

async function seedTagsForUser3() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();
		console.log("Adding tags for user 3...\n");

		const tags = [
			"receipt",
			"expense",
			"food",
			"project-alpha",
			"meeting",
			"invoice",
			"work",
			"personal",
			"urgent",
			"todo",
			"pubcck",
		];

		for (const tag of tags) {
			await client.query(
				`INSERT INTO tags (user_id, tag, usage_count)
				 VALUES (3, $1, 1)
				 ON CONFLICT (user_id, tag) DO UPDATE
				 SET usage_count = tags.usage_count + 1, last_used = NOW()`,
				[tag],
			);
			console.log(`✓ Added tag: #${tag}`);
		}

		console.log("\n✅ Done! Tags added for user 3");
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await client.end();
	}
}

seedTagsForUser3();
