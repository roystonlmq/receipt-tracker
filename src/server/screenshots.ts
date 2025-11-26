import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { Client } from "pg";
import { db } from "@/db";
import { screenshots } from "@/db/schema";
import type {
	DeleteScreenshotInput,
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
				// Check if original filename follows the standard format
				const parsed = parseFilename(originalFilename);
				if (parsed.isValid) {
					filename = originalFilename;
				} else {
					// Generate new filename with current timestamp
					const nameWithoutExt = originalFilename.replace(
						/\.(png|jpg|jpeg)$/i,
						"",
					);
					filename = generateFilename(nameWithoutExt || "screenshot");
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
					`INSERT INTO screenshots (user_id, filename, original_filename, image_data, mime_type, file_size, capture_date, folder_date, notes)
					 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
					 RETURNING id, user_id as "userId", filename, original_filename as "originalFilename", 
					           image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					           capture_date as "captureDate", upload_date as "uploadDate", notes, folder_date as "folderDate",
					           created_at as "createdAt", updated_at as "updatedAt"`,
					[userId, filename, originalFilename, imageData, file.type, file.size, captureDate, folderDate, null]
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

			// Build query conditions
			const conditions = [eq(screenshots.userId, userId)];

			if (folderDate) {
				conditions.push(eq(screenshots.folderDate, folderDate));
			}

			if (searchQuery) {
				conditions.push(like(screenshots.filename, `%${searchQuery}%`));
			}

			// Query screenshots
			const results = await db
				.select()
				.from(screenshots)
				.where(and(...conditions))
				.orderBy(desc(screenshots.uploadDate));

			return results;
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

			// Verify ownership
			const [existing] = await db
				.select()
				.from(screenshots)
				.where(and(eq(screenshots.id, id), eq(screenshots.userId, userId)))
				.limit(1);

			if (!existing) {
				throw new Error("Screenshot not found or access denied");
			}

			// Update filename and updatedAt, preserve other timestamps
			const [updated] = await db
				.update(screenshots)
				.set({
					filename: newFilename,
					updatedAt: new Date(),
				})
				.where(eq(screenshots.id, id))
				.returning();

			return { success: true, screenshot: updated };
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

			// Verify ownership and delete
			const result = await db
				.delete(screenshots)
				.where(and(eq(screenshots.id, id), eq(screenshots.userId, userId)))
				.returning();

			if (result.length === 0) {
				throw new Error("Screenshot not found or access denied");
			}

			return { success: true };
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

			// Verify ownership
			const [existing] = await db
				.select()
				.from(screenshots)
				.where(and(eq(screenshots.id, id), eq(screenshots.userId, userId)))
				.limit(1);

			if (!existing) {
				throw new Error("Screenshot not found or access denied");
			}

			// Update notes
			const [updated] = await db
				.update(screenshots)
				.set({
					notes,
					updatedAt: new Date(),
				})
				.where(eq(screenshots.id, id))
				.returning();

			return { success: true, screenshot: updated };
		} catch (error) {
			console.error("Update notes failed:", error);
			throw new Error("Failed to update notes. Please try again.");
		}
	});
