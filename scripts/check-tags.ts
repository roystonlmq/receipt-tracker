import { Client } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function checkTags() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();
		console.log("Connected to database\n");

		// Check tags
		const tagsResult = await client.query(
			"SELECT * FROM tags ORDER BY last_used DESC",
		);
		console.log(`Found ${tagsResult.rows.length} tags in database:`);
		console.table(tagsResult.rows);

		// Check users
		const usersResult = await client.query("SELECT id, name, email FROM users");
		console.log(`\nFound ${usersResult.rows.length} users:`);
		console.table(usersResult.rows);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await client.end();
	}
}

checkTags();
