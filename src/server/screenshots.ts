import { createServerFn } from "@tanstack/react-start";
import { Client } from "pg";
import type {
	BatchDeleteInput,
	BatchMoveInput,
	DeleteScreenshotInput,
	DownloadInput,
	GetScreenshotsInput,
	RenameScreenshotInput,
	UpdateNotesInput,
	UploadScreenshotInput,
} from "@/types/screenshot";
import {
	extractFolderDate,
	generateFilename,
	parseFilename,
} from "@/utils/filename";

/**
 * Upload a screenshot to the database
 */
export const uploadScreenshot = createServerFn({ method: "POST" })
	.inputValidator((input: UploadScreenshotInput) => input)
	.handler(async ({ data }) => {
		try {
			// Debug logging
			console.log("=== SERVER RECEIVED ===");
			console.log("Type of data:", typeof data);
			console.log("Data keys:", data ? Object.keys(data) : "null/undefined");
			console.log("File size:", data?.file?.size);
			console.log("User ID:", data?.userId);
			
			// Validation
			if (!data?.file) {
				console.error("Validation failed: File is required");
				throw new Error("File is required");
			}
			if (!data?.userId) {
				console.error("Validation failed: User ID is required");
				throw new Error("User ID is required");
			}

			const { file, userId, customFilename } = data;
			console.log("Starting upload process...");
			console.log("Image data length:", file.data?.length || 0);

			// File is already base64 encoded from client
			const imageData = file.data;

			// Determine filename
			let filename: string;
			const originalFilename = file.name;

			if (customFilename) {
				filename = customFilename;
			} else {
				// Always generate new filename with "screenshot" as the name
				const baseFilename = generateFilename();
				
				// Check for duplicates and generate unique filename if needed
				const client = new Client({
					connectionString: process.env.DATABASE_URL!,
				});
				
				try {
					await client.connect();
					
					// Get existing filenames for this user with the same date/time prefix
					const parsed = parseFilename(baseFilename);
					const dateTimePrefix = `${parsed.date} - ${parsed.time}`;
					
					const result = await client.query(
						`SELECT filename FROM screenshots 
						 WHERE user_id = $1 AND filename LIKE $2`,
						[userId, `${dateTimePrefix}%`]
					);
					
					const existingFilenames = result.rows.map(row => row.filename);
					
					// Generate unique filename
					const { generateUniqueFilename } = await import("@/utils/filename");
					filename = generateUniqueFilename(baseFilename, existingFilenames);
				} finally {
					await client.end();
				}
			}

			// Extract folder date from filename
			const folderDate = extractFolderDate(filename);

			// Parse filename to get capture date if available
			const parsed = parseFilename(filename);
			let captureDate: Date | null = null;

			if (parsed.isValid) {
				// Construct date from parsed components
				const day = Number.parseInt(parsed.date.substring(0, 2), 10);
				const month = Number.parseInt(parsed.date.substring(2, 4), 10) - 1; // JS months are 0-indexed
				const year = 2000 + Number.parseInt(parsed.date.substring(4, 6), 10);
				const hour = Number.parseInt(parsed.time.substring(0, 2), 10);
				const minute = Number.parseInt(parsed.time.substring(2, 4), 10);

				captureDate = new Date(year, month, day, hour, minute);
			}

			// Insert into database
			console.log("Inserting into database...");
			console.log("About to insert with folderDate:", folderDate);
			console.log("Values to insert:", {
				userId,
				filename,
				fileSize: file.size,
				mimeType: file.type,
				imageDatalength: imageData.length,
			});
			
			const insertStart = Date.now();
			
			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				console.log("Connected to database");
				
				const result = await client.query(
					`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, capture_date, folder_date, notes, downloaded)
					 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
					 RETURNING id, user_id as "userId", filename, original_filename as "originalFilename", 
					           image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					           capture_date as "captureDate", upload_date as "uploadDate", notes, folder_date as "folderDate",
					           downloaded, created_at as "createdAt", updated_at as "updatedAt"`,
					[userId, filename, originalFilename, imageData, file.type, file.size, captureDate, folderDate, null, false]
				);
				
				const screenshot = result.rows[0];
				
				const insertTime = Date.now() - insertStart;
				console.log(`Upload successful in ${insertTime}ms, screenshot ID:`, screenshot.id);
				return { success: true, screenshot };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("=== UPLOAD ERROR ===");
			console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
			console.error("Error message:", error instanceof Error ? error.message : String(error));
			console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
			throw new Error(`Failed to upload screenshot: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

/**
 * Get screenshots for a user with optional filtering
 */
export const getScreenshots = createServerFn({ method: "GET" })
	.inputValidator((input: GetScreenshotsInput) => input)
	.handler(async ({ data }) => {
		// Debug logging
		console.log("=== GET SCREENSHOTS SERVER RECEIVED ===");
		console.log("Type of data:", typeof data);
		console.log("Data:", JSON.stringify(data, null, 2));
		
		// Validation
		if (!data.userId) {
			throw new Error("User ID is required");
		}

		try {
			const { userId, folderDate, searchQuery } = data;

			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				
				// Build query dynamically based on filters
				let query = `
					SELECT id, user_id as "userId", filename, original_filename as "originalFilename", 
					       image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					       capture_date as "captureDate", upload_date as "uploadDate", notes, 
					       folder_date as "folderDate", downloaded, created_at as "createdAt", updated_at as "updatedAt"
					FROM screenshots 
					WHERE user_id = $1
				`;
				
				const params: any[] = [userId];
				let paramIndex = 2;
				
				if (folderDate) {
					query += ` AND folder_date = $${paramIndex}`;
					params.push(folderDate);
					paramIndex++;
				}
				
				if (searchQuery) {
					query += ` AND (filename ILIKE $${paramIndex} OR notes ILIKE $${paramIndex})`;
					params.push(`%${searchQuery}%`);
					paramIndex++;
				}
				
				query += ` ORDER BY upload_date DESC`;
				
				const result = await client.query(query, params);
				return result.rows;
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to get screenshots:", error);
			throw new Error("Failed to retrieve screenshots. Please try again.");
		}
	});

/**
 * Rename a screenshot
 */
export const renameScreenshot = createServerFn({ method: "POST" })
	.inputValidator((input: RenameScreenshotInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.id || !data.userId || !data.newFilename) {
			throw new Error("ID, user ID, and new filename are required");
		}

		try {
			const { id, userId, newFilename } = data;

			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				
				// Verify ownership
				const checkResult = await client.query(
					`SELECT id FROM screenshots WHERE id = $1 AND user_id = $2`,
					[id, userId]
				);

				if (checkResult.rows.length === 0) {
					throw new Error("Screenshot not found or access denied");
				}

				// Update filename and updatedAt, preserve other timestamps
				const result = await client.query(
					`UPDATE screenshots 
					 SET filename = $1, updated_at = NOW()
					 WHERE id = $2
					 RETURNING id, user_id as "userId", filename, original_filename as "originalFilename", 
					           image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					           capture_date as "captureDate", upload_date as "uploadDate", notes, folder_date as "folderDate",
					           downloaded, created_at as "createdAt", updated_at as "updatedAt"`,
					[newFilename, id]
				);

				const updated = result.rows[0];
				return { success: true, screenshot: updated };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Rename failed:", error);
			throw new Error("Failed to rename screenshot. Please try again.");
		}
	});

/**
 * Delete a screenshot
 */
export const deleteScreenshot = createServerFn({ method: "POST" })
	.inputValidator((input: DeleteScreenshotInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.id || !data.userId) {
			throw new Error("ID and user ID are required");
		}

		try {
			const { id, userId } = data;

			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				
				// Verify ownership and delete
				const result = await client.query(
					`DELETE FROM screenshots WHERE id = $1 AND user_id = $2 RETURNING id`,
					[id, userId]
				);

				if (result.rows.length === 0) {
					throw new Error("Screenshot not found or access denied");
				}

				// Clean up orphaned tags after deletion
				try {
					const { cleanupOrphanedTags } = await import("./tags");
					await cleanupOrphanedTags({ data: { userId } });
					console.log("[deleteScreenshot] Orphaned tags cleaned up");
				} catch (error) {
					console.error("[deleteScreenshot] Failed to cleanup orphaned tags:", error);
					// Don't throw - tag cleanup failure shouldn't block deletion
				}

				return { success: true };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Delete failed:", error);
			throw new Error("Failed to delete screenshot. Please try again.");
		}
	});

/**
 * Update screenshot notes
 */
export const updateScreenshotNotes = createServerFn({ method: "POST" })
	.inputValidator((input: UpdateNotesInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.id || !data.userId) {
			throw new Error("ID and user ID are required");
		}

		try {
			const { id, userId, notes } = data;

			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				
				// Verify ownership
				const checkResult = await client.query(
					`SELECT id FROM screenshots WHERE id = $1 AND user_id = $2`,
					[id, userId]
				);

				if (checkResult.rows.length === 0) {
					throw new Error("Screenshot not found or access denied");
				}

				// Update notes
				const result = await client.query(
					`UPDATE screenshots 
					 SET notes = $1, updated_at = NOW()
					 WHERE id = $2
					 RETURNING id, user_id as "userId", filename, original_filename as "originalFilename", 
					           image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					           capture_date as "captureDate", upload_date as "uploadDate", notes, folder_date as "folderDate",
					           downloaded, created_at as "createdAt", updated_at as "updatedAt"`,
					[notes, id]
				);

				const updated = result.rows[0];
				
				// Extract and store tags synchronously
				if (notes && notes.trim()) {
					try {
						const { extractAndStoreTags } = await import("./tags");
						await extractAndStoreTags({
							data: {
								userId,
								screenshotId: id,
								notes,
							},
						});
						console.log("[updateScreenshotNotes] Tags extracted successfully");
					} catch (error) {
						console.error("[updateScreenshotNotes] Failed to extract tags:", error);
						// Don't throw - tag extraction failure shouldn't block notes save
					}
				}
				
				return { success: true, screenshot: updated };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Update notes failed:", error);
			throw new Error("Failed to update notes. Please try again.");
		}
	});

/**
 * Get a single screenshot by ID
 */
export const getScreenshotById = createServerFn({ method: "GET" })
	.inputValidator((input: { id: number; userId: number }) => input)
	.handler(async ({ data }) => {
		const { id, userId } = data;

		// Validate inputs
		if (!id || id <= 0) {
			return { success: false, error: "Invalid screenshot ID" };
		}
		if (!userId || userId <= 0) {
			return { success: false, error: "Invalid user ID" };
		}

		try {
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				const result = await client.query(
					`SELECT id, user_id as "userId", filename, original_filename as "originalFilename",
					        image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					        capture_date as "captureDate", upload_date as "uploadDate", notes,
					        folder_date as "folderDate", downloaded, created_at as "createdAt", updated_at as "updatedAt"
					 FROM screenshots
					 WHERE id = $1 AND user_id = $2`,
					[id, userId],
				);

				if (result.rows.length === 0) {
					return {
						success: false,
						error: "Screenshot not found or access denied",
					};
				}

				return { success: true, screenshot: result.rows[0] };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to get screenshot by ID:", error);
			return {
				success: false,
				error: "Failed to load screenshot. Please try again.",
			};
		}
	});

/**
 * Batch delete multiple screenshots
 */
export const batchDeleteScreenshots = createServerFn({ method: "POST" })
	.inputValidator((input: BatchDeleteInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.userId) {
			throw new Error("User ID is required");
		}
		if (!data.ids || data.ids.length === 0) {
			throw new Error("At least one screenshot ID is required");
		}

		try {
			const { ids, userId } = data;

			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				
				// Delete each screenshot individually to ensure proper ownership verification
				let deletedCount = 0;
				for (const id of ids) {
					const deleteResult = await client.query(
						`DELETE FROM screenshots WHERE id = $1 AND user_id = $2 RETURNING id`,
						[id, userId]
					);

					if (deleteResult.rows.length > 0) {
						deletedCount++;
					}
				}

				return { success: true, count: deletedCount };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Batch delete failed:", error);
			throw new Error("Failed to delete screenshots. Please try again.");
		}
	});

/**
 * Batch move multiple screenshots to a different folder
 */
export const batchMoveScreenshots = createServerFn({ method: "POST" })
	.inputValidator((input: BatchMoveInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.userId) {
			throw new Error("User ID is required");
		}
		if (!data.ids || data.ids.length === 0) {
			throw new Error("At least one screenshot ID is required");
		}
		if (!data.targetFolderDate) {
			throw new Error("Target folder date is required");
		}

		try {
			const { ids, userId, targetFolderDate } = data;

			// Validate folder date format (DDMMYY)
			if (!/^\d{6}$/.test(targetFolderDate)) {
				throw new Error("Invalid folder date format. Expected DDMMYY");
			}

			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				
				// Move each screenshot individually to ensure proper ownership verification
				let movedCount = 0;
				for (const id of ids) {
					// Verify ownership first
					const checkResult = await client.query(
						`SELECT id FROM screenshots WHERE id = $1 AND user_id = $2`,
						[id, userId]
					);

					if (checkResult.rows.length > 0) {
						// Update the folder date
						await client.query(
							`UPDATE screenshots SET folder_date = $1, updated_at = NOW() WHERE id = $2`,
							[targetFolderDate, id]
						);

						movedCount++;
					}
				}

				return { success: true, count: movedCount };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Batch move failed:", error);
			throw new Error("Failed to move screenshots. Please try again.");
		}
	});

/**
 * Toggle the downloaded status of a screenshot
 */
export const toggleDownloadStatus = createServerFn({ method: "POST" })
	.inputValidator((input: { id: number; userId: number; downloaded: boolean }) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.id || !data.userId) {
			throw new Error("ID and user ID are required");
		}

		try {
			const { id, userId, downloaded } = data;

			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				
				// Verify ownership
				const checkResult = await client.query(
					`SELECT id FROM screenshots WHERE id = $1 AND user_id = $2`,
					[id, userId]
				);

				if (checkResult.rows.length === 0) {
					throw new Error("Screenshot not found or access denied");
				}

				// Update downloaded status
				const result = await client.query(
					`UPDATE screenshots 
					 SET downloaded = $1, updated_at = NOW()
					 WHERE id = $2
					 RETURNING id, user_id as "userId", filename, original_filename as "originalFilename", 
					           image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					           capture_date as "captureDate", upload_date as "uploadDate", notes, folder_date as "folderDate",
					           downloaded, created_at as "createdAt", updated_at as "updatedAt"`,
					[downloaded, id]
				);

				const updated = result.rows[0];
				return { success: true, screenshot: updated };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Toggle download status failed:", error);
			throw new Error("Failed to update download status. Please try again.");
		}
	});

/**
 * Download a screenshot with its notes as a bundled file
 */
export const downloadScreenshotWithNotes = createServerFn({ method: "GET" })
	.inputValidator((input: DownloadInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.id || !data.userId) {
			throw new Error("ID and user ID are required");
		}

		try {
			const { id, userId } = data;

			// Use raw pg client to bypass Drizzle ORM issues in Workers
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});
			
			try {
				await client.connect();
				
				// Verify ownership and retrieve screenshot
				const result = await client.query(
					`SELECT id, user_id as "userId", filename, original_filename as "originalFilename", 
					        image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					        capture_date as "captureDate", upload_date as "uploadDate", notes, 
					        folder_date as "folderDate", downloaded, created_at as "createdAt", updated_at as "updatedAt"
					 FROM screenshots WHERE id = $1 AND user_id = $2`,
					[id, userId]
				);

				if (result.rows.length === 0) {
					throw new Error("Screenshot not found or access denied");
				}

				const screenshot = result.rows[0];

				// Parse filename to extract components for notes filename
				const parsed = parseFilename(screenshot.filename);
				let notesFilename: string;

				if (parsed.isValid) {
					// Use the parsed date and time for notes filename
					notesFilename = `${parsed.date} - ${parsed.time} - ${parsed.name}_note.txt`;
				} else {
					// Fallback: use the original filename with _note.txt suffix
					const nameWithoutExt = screenshot.filename.replace(/\.(png|jpg|jpeg)$/i, "");
					notesFilename = `${nameWithoutExt}_note.txt`;
				}

				// Return the screenshot data and notes filename
				return {
					success: true,
					screenshot: {
						id: screenshot.id,
						filename: screenshot.filename,
						imageData: screenshot.imageData,
						mimeType: screenshot.mimeType,
						notes: screenshot.notes || "",
						notesFilename,
					},
				};
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Download with notes failed:", error);
			throw new Error("Failed to download screenshot. Please try again.");
		}
	});
