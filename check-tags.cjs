const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
	connectionString: process.env.DATABASE_URL
});

client.connect()
	.then(() => client.query('SELECT tag, usage_count, user_id FROM tags ORDER BY last_used DESC'))
	.then(res => {
		console.log('Tags in database:');
		res.rows.forEach(r => {
			console.log(`  #${r.tag} (${r.usage_count} uses) - User ${r.user_id}`);
		});
		return client.end();
	})
	.catch(err => {
		console.error('Error:', err.message);
	});
