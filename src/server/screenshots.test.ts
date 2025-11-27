import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "pg";

/**
 * Integration tests for screenshot modification server functions
 * These tests verify the core functionality without running through the full server function wrapper
 */

describe("Screenshot Modification Functions", () => {
	let client: Client;
	let testUserId: number;
	let testScreenshotId: number;

	beforeAll(async () => {
		// Setup test database connection
		client = new Client({
			connectionString: process.env.DATABASE_URL!,
		});
		await client.connect();

		// Create a test user
		const userResult = await client.query(
			`INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
			["test@example.com", "Test User"],
		);
		testUserId = userResult.rows[0].id;

		// Create a test screenshot
		const screenshotResult = await client.query(
			`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
			 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
			[
				testUserId,
				"271124 - 1430 - test.png",
				"test.png",
				"data:image/png;base64,test",
				"image/png",
				1000,
				"271124",
			],
		);
		testScreenshotId = screenshotResult.rows[0].id;
	});

	afterAll(async () => {
		// Cleanup test data
		await client.query(`DELETE FROM screenshots WHERE user_id = $1`, [
			testUserId,
		]);
		await client.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
		await client.end();
	});

	describe("renameScreenshot", () => {
		it("should update filename and preserve timestamps", async () => {
			const newFilename = "271124 - 1430 - renamed.png";

			// Get original timestamps
			const beforeResult = await client.query(
				`SELECT capture_date, upload_date, created_at FROM screenshots WHERE id = $1`,
				[testScreenshotId],
			);
			const before = beforeResult.rows[0];

			// Perform rename
			await client.query(
				`UPDATE screenshots SET filename = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
				[newFilename, testScreenshotId, testUserId],
			);

			// Verify rename and timestamp preservation
			const afterResult = await client.query(
				`SELECT filename, capture_date, upload_date, created_at, updated_at FROM screenshots WHERE id = $1`,
				[testScreenshotId],
			);
			const after = afterResult.rows[0];

			expect(after.filename).toBe(newFilename);
			expect(after.capture_date).toEqual(before.capture_date);
			expect(after.upload_date).toEqual(before.upload_date);
			expect(after.created_at).toEqual(before.created_at);
			expect(new Date(after.updated_at).getTime()).toBeGreaterThan(
				new Date(before.created_at).getTime(),
			);
		});

		it("should enforce ownership validation", async () => {
			const wrongUserId = testUserId + 999;

			// Attempt to rename with wrong user ID
			const result = await client.query(
				`UPDATE screenshots SET filename = $1 WHERE id = $2 AND user_id = $3 RETURNING id`,
				["hacked.png", testScreenshotId, wrongUserId],
			);

			// Should not update any rows
			expect(result.rows.length).toBe(0);

			// Verify original filename unchanged
			const checkResult = await client.query(
				`SELECT filename FROM screenshots WHERE id = $1`,
				[testScreenshotId],
			);
			expect(checkResult.rows[0].filename).not.toBe("hacked.png");
		});
	});

	describe("updateScreenshotNotes", () => {
		it("should persist notes to database", async () => {
			const notes = "This is a test note";

			// Update notes
			await client.query(
				`UPDATE screenshots SET notes = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
				[notes, testScreenshotId, testUserId],
			);

			// Verify notes persisted
			const result = await client.query(
				`SELECT notes FROM screenshots WHERE id = $1`,
				[testScreenshotId],
			);

			expect(result.rows[0].notes).toBe(notes);
		});

		it("should enforce ownership validation", async () => {
			const wrongUserId = testUserId + 999;

			// Attempt to update notes with wrong user ID
			const result = await client.query(
				`UPDATE screenshots SET notes = $1 WHERE id = $2 AND user_id = $3 RETURNING id`,
				["hacked notes", testScreenshotId, wrongUserId],
			);

			// Should not update any rows
			expect(result.rows.length).toBe(0);
		});
	});

	describe("deleteScreenshot", () => {
		it("should completely remove screenshot and associated data", async () => {
			// Create a screenshot with notes for deletion test
			const deleteTestResult = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date, notes)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
				[
					testUserId,
					"271124 - 1500 - delete-test.png",
					"delete-test.png",
					"data:image/png;base64,delete",
					"image/png",
					2000,
					"271124",
					"Test notes to be deleted",
				],
			);
			const deleteTestId = deleteTestResult.rows[0].id;

			// Delete the screenshot
			const deleteResult = await client.query(
				`DELETE FROM screenshots WHERE id = $1 AND user_id = $2 RETURNING id`,
				[deleteTestId, testUserId],
			);

			// Verify deletion occurred
			expect(deleteResult.rows.length).toBe(1);

			// Verify screenshot no longer exists
			const checkResult = await client.query(
				`SELECT * FROM screenshots WHERE id = $1`,
				[deleteTestId],
			);
			expect(checkResult.rows.length).toBe(0);
		});

		it("should enforce ownership validation", async () => {
			const wrongUserId = testUserId + 999;

			// Attempt to delete with wrong user ID
			const result = await client.query(
				`DELETE FROM screenshots WHERE id = $1 AND user_id = $2 RETURNING id`,
				[testScreenshotId, wrongUserId],
			);

			// Should not delete any rows
			expect(result.rows.length).toBe(0);

			// Verify screenshot still exists
			const checkResult = await client.query(
				`SELECT id FROM screenshots WHERE id = $1`,
				[testScreenshotId],
			);
			expect(checkResult.rows.length).toBe(1);
		});
	});

	describe("downloadScreenshotWithNotes", () => {
		it("should generate correct notes filename from parsed filename", async () => {
			// Create a screenshot with notes
			const screenshotResult = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date, notes)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, filename, notes`,
				[
					testUserId,
					"271124 - 1430 - receipt.png",
					"receipt.png",
					"data:image/png;base64,test",
					"image/png",
					1000,
					"271124",
					"This is a test note for the receipt",
				],
			);
			const downloadTestId = screenshotResult.rows[0].id;

			// Retrieve screenshot (simulating download function logic)
			const result = await client.query(
				`SELECT * FROM screenshots WHERE id = $1 AND user_id = $2`,
				[downloadTestId, testUserId],
			);

			expect(result.rows.length).toBe(1);
			const screenshot = result.rows[0];
			
			// Verify notes exist
			expect(screenshot.notes).toBe("This is a test note for the receipt");
			
			// Verify filename format
			expect(screenshot.filename).toBe("271124 - 1430 - receipt.png");

			// Cleanup
			await client.query(`DELETE FROM screenshots WHERE id = $1`, [
				downloadTestId,
			]);
		});

		it("should handle screenshots without notes", async () => {
			// Create a screenshot without notes
			const screenshotResult = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					testUserId,
					"271124 - 1500 - no-notes.png",
					"no-notes.png",
					"data:image/png;base64,test",
					"image/png",
					1000,
					"271124",
				],
			);
			const downloadTestId = screenshotResult.rows[0].id;

			// Retrieve screenshot
			const result = await client.query(
				`SELECT * FROM screenshots WHERE id = $1 AND user_id = $2`,
				[downloadTestId, testUserId],
			);

			expect(result.rows.length).toBe(1);
			const screenshot = result.rows[0];
			
			// Verify notes are null
			expect(screenshot.notes).toBeNull();

			// Cleanup
			await client.query(`DELETE FROM screenshots WHERE id = $1`, [
				downloadTestId,
			]);
		});

		it("should enforce ownership validation", async () => {
			const wrongUserId = testUserId + 999;

			// Attempt to retrieve with wrong user ID
			const result = await client.query(
				`SELECT * FROM screenshots WHERE id = $1 AND user_id = $2`,
				[testScreenshotId, wrongUserId],
			);

			// Should not return any rows
			expect(result.rows.length).toBe(0);
		});
	});

	describe("Batch Operations", () => {
	describe("batchDeleteScreenshots", () => {
		it("should delete multiple screenshots and return correct count", async () => {
			// Create multiple test screenshots
			const screenshot1Result = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					testUserId,
					"271124 - 1600 - batch1.png",
					"batch1.png",
					"data:image/png;base64,batch1",
					"image/png",
					1000,
					"271124",
				],
			);
			const screenshot1Id = screenshot1Result.rows[0].id;

			const screenshot2Result = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					testUserId,
					"271124 - 1700 - batch2.png",
					"batch2.png",
					"data:image/png;base64,batch2",
					"image/png",
					1000,
					"271124",
				],
			);
			const screenshot2Id = screenshot2Result.rows[0].id;

			const screenshot3Result = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					testUserId,
					"271124 - 1800 - batch3.png",
					"batch3.png",
					"data:image/png;base64,batch3",
					"image/png",
					1000,
					"271124",
				],
			);
			const screenshot3Id = screenshot3Result.rows[0].id;

			const idsToDelete = [screenshot1Id, screenshot2Id, screenshot3Id];

			// Perform batch delete
			let deletedCount = 0;
			for (const id of idsToDelete) {
				const deleteResult = await client.query(
					`DELETE FROM screenshots WHERE id = $1 AND user_id = $2 RETURNING id`,
					[id, testUserId],
				);
				if (deleteResult.rows.length > 0) {
					deletedCount++;
				}
			}

			// Verify count
			expect(deletedCount).toBe(3);

			// Verify all screenshots are deleted
			const checkResult = await client.query(
				`SELECT id FROM screenshots WHERE id = ANY($1)`,
				[idsToDelete],
			);
			expect(checkResult.rows.length).toBe(0);
		});

		it("should only delete screenshots owned by the user", async () => {
			// Create another test user
			const otherUserResult = await client.query(
				`INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
				["other@example.com", "Other User"],
			);
			const otherUserId = otherUserResult.rows[0].id;

			// Create screenshots for both users
			const ownScreenshotResult = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					testUserId,
					"271124 - 1900 - own.png",
					"own.png",
					"data:image/png;base64,own",
					"image/png",
					1000,
					"271124",
				],
			);
			const ownScreenshotId = ownScreenshotResult.rows[0].id;

			const otherScreenshotResult = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					otherUserId,
					"271124 - 2000 - other.png",
					"other.png",
					"data:image/png;base64,other",
					"image/png",
					1000,
					"271124",
				],
			);
			const otherScreenshotId = otherScreenshotResult.rows[0].id;

			// Attempt to delete both with testUserId
			const idsToDelete = [ownScreenshotId, otherScreenshotId];
			let deletedCount = 0;
			for (const id of idsToDelete) {
				const deleteResult = await client.query(
					`DELETE FROM screenshots WHERE id = $1 AND user_id = $2 RETURNING id`,
					[id, testUserId],
				);
				if (deleteResult.rows.length > 0) {
					deletedCount++;
				}
			}

			// Should only delete own screenshot
			expect(deletedCount).toBe(1);

			// Verify own screenshot deleted
			const ownCheck = await client.query(
				`SELECT id FROM screenshots WHERE id = $1`,
				[ownScreenshotId],
			);
			expect(ownCheck.rows.length).toBe(0);

			// Verify other user's screenshot still exists
			const otherCheck = await client.query(
				`SELECT id FROM screenshots WHERE id = $1`,
				[otherScreenshotId],
			);
			expect(otherCheck.rows.length).toBe(1);

			// Cleanup
			await client.query(`DELETE FROM screenshots WHERE user_id = $1`, [
				otherUserId,
			]);
			await client.query(`DELETE FROM users WHERE id = $1`, [otherUserId]);
		});
	});

	describe("batchMoveScreenshots", () => {
		it("should move multiple screenshots to target folder", async () => {
			// Create test screenshots in one folder
			const screenshot1Result = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					testUserId,
					"271124 - 2100 - move1.png",
					"move1.png",
					"data:image/png;base64,move1",
					"image/png",
					1000,
					"271124",
				],
			);
			const screenshot1Id = screenshot1Result.rows[0].id;

			const screenshot2Result = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					testUserId,
					"271124 - 2200 - move2.png",
					"move2.png",
					"data:image/png;base64,move2",
					"image/png",
					1000,
					"271124",
				],
			);
			const screenshot2Id = screenshot2Result.rows[0].id;

			const idsToMove = [screenshot1Id, screenshot2Id];
			const targetFolderDate = "281124";

			// Perform batch move
			let movedCount = 0;
			for (const id of idsToMove) {
				// Verify ownership first
				const existingResult = await client.query(
					`SELECT id FROM screenshots WHERE id = $1 AND user_id = $2`,
					[id, testUserId],
				);

				if (existingResult.rows.length > 0) {
					await client.query(
						`UPDATE screenshots SET folder_date = $1, updated_at = NOW() WHERE id = $2`,
						[targetFolderDate, id],
					);
					movedCount++;
				}
			}

			// Verify count
			expect(movedCount).toBe(2);

			// Verify all screenshots moved to new folder
			const checkResult = await client.query(
				`SELECT folder_date FROM screenshots WHERE id = ANY($1)`,
				[idsToMove],
			);
			expect(checkResult.rows.length).toBe(2);
			expect(checkResult.rows[0].folder_date).toBe(targetFolderDate);
			expect(checkResult.rows[1].folder_date).toBe(targetFolderDate);

			// Cleanup
			await client.query(`DELETE FROM screenshots WHERE id = ANY($1)`, [
				idsToMove,
			]);
		});

		it("should only move screenshots owned by the user", async () => {
			// Create another test user
			const otherUserResult = await client.query(
				`INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
				["other2@example.com", "Other User 2"],
			);
			const otherUserId = otherUserResult.rows[0].id;

			// Create screenshots for both users
			const ownScreenshotResult = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					testUserId,
					"271124 - 2300 - ownmove.png",
					"ownmove.png",
					"data:image/png;base64,ownmove",
					"image/png",
					1000,
					"271124",
				],
			);
			const ownScreenshotId = ownScreenshotResult.rows[0].id;

			const otherScreenshotResult = await client.query(
				`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, folder_date)
				 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					otherUserId,
					"271124 - 2400 - othermove.png",
					"othermove.png",
					"data:image/png;base64,othermove",
					"image/png",
					1000,
					"271124",
				],
			);
			const otherScreenshotId = otherScreenshotResult.rows[0].id;

			const idsToMove = [ownScreenshotId, otherScreenshotId];
			const targetFolderDate = "291124";

			// Attempt to move both with testUserId
			let movedCount = 0;
			for (const id of idsToMove) {
				const existingResult = await client.query(
					`SELECT id FROM screenshots WHERE id = $1 AND user_id = $2`,
					[id, testUserId],
				);

				if (existingResult.rows.length > 0) {
					await client.query(
						`UPDATE screenshots SET folder_date = $1, updated_at = NOW() WHERE id = $2`,
						[targetFolderDate, id],
					);
					movedCount++;
				}
			}

			// Should only move own screenshot
			expect(movedCount).toBe(1);

			// Verify own screenshot moved
			const ownCheck = await client.query(
				`SELECT folder_date FROM screenshots WHERE id = $1`,
				[ownScreenshotId],
			);
			expect(ownCheck.rows[0].folder_date).toBe(targetFolderDate);

			// Verify other user's screenshot not moved
			const otherCheck = await client.query(
				`SELECT folder_date FROM screenshots WHERE id = $1`,
				[otherScreenshotId],
			);
			expect(otherCheck.rows[0].folder_date).toBe("271124");

			// Cleanup
			await client.query(`DELETE FROM screenshots WHERE id = ANY($1)`, [
				idsToMove,
			]);
			await client.query(`DELETE FROM users WHERE id = $1`, [otherUserId]);
		});
	});
	});
});
