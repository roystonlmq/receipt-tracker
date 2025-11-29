/**
 * Tests for getScreenshotById server function
 * These tests will initially fail until we implement the function
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "pg";

// This will be implemented
let getScreenshotById: any;

describe.skip("getScreenshotById Server Function", () => {
	// Skip by default due to database requirements
	// Remove .skip when ready to test with database

	let client: Client;
	let testUserId: number;
	let testScreenshotId: number;
	let otherUserId: number;

	beforeAll(async () => {
		// Import the function (will fail until implemented)
		const module = await import("./screenshots");
		getScreenshotById = module.getScreenshotById;

		// Setup test database
		client = new Client({
			connectionString: process.env.DATABASE_URL!,
		});
		await client.connect();

		// Create test users
		const user1 = await client.query(
			`INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
			[`test-screenshot-${Date.now()}@example.com`, "Test User"],
		);
		testUserId = user1.rows[0].id;

		const user2 = await client.query(
			`INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
			[`test-other-${Date.now()}@example.com`, "Other User"],
		);
		otherUserId = user2.rows[0].id;

		// Create test screenshot
		const screenshot = await client.query(
			`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING id`,
			[
				testUserId,
				"010125 - 1200 - test.png",
				"test.png",
				"data:image/png;base64,test",
				"image/png",
				1000,
				"010125",
			],
		);
		testScreenshotId = screenshot.rows[0].id;
	});

	afterAll(async () => {
		// Cleanup
		await client.query(`DELETE FROM screenshots WHERE user_id IN ($1, $2)`, [
			testUserId,
			otherUserId,
		]);
		await client.query(`DELETE FROM users WHERE id IN ($1, $2)`, [
			testUserId,
			otherUserId,
		]);
		await client.end();
	});

	describe("Successful fetch", () => {
		it("should return screenshot when user owns it", async () => {
			const result = await getScreenshotById({
				data: { id: testScreenshotId, userId: testUserId },
			});

			expect(result.success).toBe(true);
			expect(result.screenshot).toBeDefined();
			expect(result.screenshot.id).toBe(testScreenshotId);
			expect(result.screenshot.userId).toBe(testUserId);
			expect(result.screenshot.filename).toBe("010125 - 1200 - test.png");
		});

		it("should return all screenshot fields", async () => {
			const result = await getScreenshotById({
				data: { id: testScreenshotId, userId: testUserId },
			});

			expect(result.screenshot).toHaveProperty("id");
			expect(result.screenshot).toHaveProperty("userId");
			expect(result.screenshot).toHaveProperty("filename");
			expect(result.screenshot).toHaveProperty("originalFilename");
			expect(result.screenshot).toHaveProperty("imageData");
			expect(result.screenshot).toHaveProperty("mimeType");
			expect(result.screenshot).toHaveProperty("fileSize");
			expect(result.screenshot).toHaveProperty("folderDate");
			expect(result.screenshot).toHaveProperty("notes");
			expect(result.screenshot).toHaveProperty("createdAt");
			expect(result.screenshot).toHaveProperty("updatedAt");
		});
	});

	describe("Access control", () => {
		it("should reject when user does not own screenshot", async () => {
			const result = await getScreenshotById({
				data: { id: testScreenshotId, userId: otherUserId },
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain("not found or access denied");
			expect(result.screenshot).toBeUndefined();
		});

		it("should reject when screenshot does not exist", async () => {
			const result = await getScreenshotById({
				data: { id: 999999, userId: testUserId },
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain("not found");
			expect(result.screenshot).toBeUndefined();
		});
	});

	describe("Input validation", () => {
		it("should handle invalid screenshot ID", async () => {
			const result = await getScreenshotById({
				data: { id: -1, userId: testUserId },
			});

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("should handle missing user ID", async () => {
			const result = await getScreenshotById({
				data: { id: testScreenshotId, userId: 0 },
			});

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});
	});
});
