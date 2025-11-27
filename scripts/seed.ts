import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, screenshots } from "../src/db/schema";

// Load .env.local first, then .env
config({ path: ".env.local" });
config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema: { users, screenshots } });

// Generate a simple colored rectangle as base64 image
function generateDemoImage(color: string): string {
	// Simple 1x1 pixel PNG in base64 (different colors)
	const colors: Record<string, string> = {
		red: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
		blue: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==",
		green: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==",
		yellow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
		purple: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8Dwn/8/AAMHAgAx5sAYAAAAAElFTkSuQmCC",
	};
	return colors[color] || colors.red;
}

async function seed() {
	console.log("Seeding database...");

	// Create or get test users
	let user1 = (await db
		.insert(users)
		.values({
			email: "test@example.com",
			name: "Test User",
		})
		.onConflictDoNothing()
		.returning())[0];

	// If user already exists, fetch it
	if (!user1) {
		const { eq } = await import("drizzle-orm");
		[user1] = await db.select().from(users).where(eq(users.email, "test@example.com"));
	}

	let user2 = (await db
		.insert(users)
		.values({
			email: "demo@example.com",
			name: "Demo User",
		})
		.onConflictDoNothing()
		.returning())[0];

	// If user already exists, fetch it
	if (!user2) {
		const { eq } = await import("drizzle-orm");
		[user2] = await db.select().from(users).where(eq(users.email, "demo@example.com"));
	}

	console.log("Users ready:", { user1, user2 });

	// Create demo screenshots for user1
	const today = new Date();
	const demoScreenshots = [];

	// Today's screenshots
	for (let i = 0; i < 5; i++) {
		const hour = 9 + i;
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = String(today.getFullYear()).slice(-2);
		const hourStr = String(hour).padStart(2, "0");
		const minute = String(i * 10).padStart(2, "0");

		demoScreenshots.push({
			userId: user1.id,
			filename: `${day}${month}${year} - ${hourStr}${minute} - receipt-${i + 1}.png`,
			originalFilename: `receipt-${i + 1}.png`,
			imageData: generateDemoImage(["red", "blue", "green", "yellow", "purple"][i]),
			mimeType: "image/png",
			fileSize: 1024 + i * 100,
			captureDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, i * 10),
			folderDate: `${day}${month}${year}`,
			notes: i % 2 === 0 ? `This is a note for receipt ${i + 1}` : null,
		});
	}

	// Yesterday's screenshots
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	for (let i = 0; i < 3; i++) {
		const hour = 14 + i;
		const day = String(yesterday.getDate()).padStart(2, "0");
		const month = String(yesterday.getMonth() + 1).padStart(2, "0");
		const year = String(yesterday.getFullYear()).slice(-2);
		const hourStr = String(hour).padStart(2, "0");
		const minute = String(i * 15).padStart(2, "0");

		demoScreenshots.push({
			userId: user1.id,
			filename: `${day}${month}${year} - ${hourStr}${minute} - invoice-${i + 1}.png`,
			originalFilename: `invoice-${i + 1}.png`,
			imageData: generateDemoImage(["blue", "green", "red"][i]),
			mimeType: "image/png",
			fileSize: 2048 + i * 200,
			captureDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), hour, i * 15),
			folderDate: `${day}${month}${year}`,
			notes: i === 1 ? "Important invoice - needs review" : null,
		});
	}

	// Last week's screenshots
	const lastWeek = new Date(today);
	lastWeek.setDate(lastWeek.getDate() - 7);
	for (let i = 0; i < 2; i++) {
		const hour = 10 + i * 2;
		const day = String(lastWeek.getDate()).padStart(2, "0");
		const month = String(lastWeek.getMonth() + 1).padStart(2, "0");
		const year = String(lastWeek.getFullYear()).slice(-2);
		const hourStr = String(hour).padStart(2, "0");
		const minute = "00";

		demoScreenshots.push({
			userId: user1.id,
			filename: `${day}${month}${year} - ${hourStr}${minute} - document-${i + 1}.png`,
			originalFilename: `document-${i + 1}.png`,
			imageData: generateDemoImage(["purple", "yellow"][i]),
			mimeType: "image/png",
			fileSize: 1500 + i * 150,
			captureDate: new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate(), hour, 0),
			folderDate: `${day}${month}${year}`,
			notes: null,
		});
	}

	// Insert all demo screenshots
	if (demoScreenshots.length > 0) {
		await db.insert(screenshots).values(demoScreenshots).onConflictDoNothing();
		console.log(`Created ${demoScreenshots.length} demo screenshots for ${user1.name}`);
	}

	// Create a few screenshots for user2
	const user2Screenshots = [];
	for (let i = 0; i < 2; i++) {
		const hour = 11 + i;
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = String(today.getFullYear()).slice(-2);
		const hourStr = String(hour).padStart(2, "0");
		const minute = "30";

		user2Screenshots.push({
			userId: user2.id,
			filename: `${day}${month}${year} - ${hourStr}${minute} - demo-${i + 1}.png`,
			originalFilename: `demo-${i + 1}.png`,
			imageData: generateDemoImage(["green", "blue"][i]),
			mimeType: "image/png",
			fileSize: 1800 + i * 100,
			captureDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, 30),
			folderDate: `${day}${month}${year}`,
			notes: null,
		});
	}

	if (user2Screenshots.length > 0) {
		await db.insert(screenshots).values(user2Screenshots).onConflictDoNothing();
		console.log(`Created ${user2Screenshots.length} demo screenshots for ${user2.name}`);
	}

	console.log("Seeding complete!");
	console.log("\nYou can now:");
	console.log("- View screenshots for user 1 (ID: 1) at /screenshots");
	console.log("- Test search, rename, delete, and batch operations");
	console.log("- Add notes to screenshots");
	console.log("- Download screenshots with notes");

	await pool.end();
}

seed().catch((error) => {
	console.error("Seeding failed:", error);
	process.exit(1);
});
