import { Client } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function testTagSuggestions() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();
		console.log("Testing tag suggestions query...\n");

		const userId = 1;
		const query = "";

		let sql = `
			SELECT tag, usage_count as "usageCount", last_used as "lastUsed"
			FROM tags
			WHERE user_id = $1
		`;
		const params: (number | string)[] = [userId];

		if (query && query.trim()) {
			sql += ` AND tag ILIKE $2`;
			params.push(`${query.toLowerCase()}%`);
		}

		sql += ` ORDER BY last_used DESC LIMIT 10`;

		console.log("SQL:", sql);
		console.log("Params:", params);
		console.log();

		const result = await client.query(sql, params);
		console.log(`Found ${result.rows.length} suggestions:`);
		console.table(result.rows);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await client.end();
	}
}

testTagSuggestions();
