const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
	connectionString: process.env.DATABASE_URL
});

const sql = `
CREATE TABLE IF NOT EXISTS tags (
	id serial PRIMARY KEY NOT NULL,
	user_id integer NOT NULL,
	tag text NOT NULL,
	first_used timestamp DEFAULT now() NOT NULL,
	last_used timestamp DEFAULT now() NOT NULL,
	usage_count integer DEFAULT 1 NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT tags_user_id_tag_unique UNIQUE(user_id, tag)
);

CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);
CREATE INDEX IF NOT EXISTS tags_tag_idx ON tags(tag);
CREATE INDEX IF NOT EXISTS tags_last_used_idx ON tags(last_used);
`;

client.connect()
	.then(() => client.query(sql))
	.then(() => {
		console.log('✅ Tags table created successfully!');
		return client.end();
	})
	.catch(err => {
		console.error('Error:', err.message);
		process.exit(1);
	});
