import { createServerFn } from "@tanstack/react-start";
import { Client } from "pg";
import { extractHashtags, normalizeTag } from "@/utils/tags";

export interface TagSuggestion {
	tag: string;
	usageCount: number;
	lastUsed: Date;
}

export interface TagStatistics {
	tag: string;
	usageCount: number;
	firstUsed: Date;
	lastUsed: Date;
	isInactive: boolean;
}

export interface ExtractTagsInput {
	userId: number;
	screenshotId: number;
	notes: string;
}

export interface GetTagSuggestionsInput {
	userId: number;
	query?: string;
}

export interface GetUserTagsInput {
	userId: number;
	sortBy?: "usage" | "alphabetical" | "recent";
}

/**
 * Extract hashtags from notes and store them in the tags table
 */
export const extractAndStoreTags = createServerFn({ method: "POST" })
	.inputValidator((input: ExtractTagsInput) => input)
	.handler(async ({ data }) => {
		const { userId, screenshotId, notes } = data;

		if (!notes || !notes.trim()) {
			return { success: true, tags: [] };
		}

		try {
			const hashtags = extractHashtags(notes);

			if (hashtags.length === 0) {
				return { success: true, tags: [] };
			}

			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Upsert each tag
				for (const tag of hashtags) {
					const normalizedTag = normalizeTag(tag);

					// Check if tag exists
					const checkResult = await client.query(
						`SELECT id, usage_count FROM tags WHERE user_id = $1 AND tag = $2`,
						[userId, normalizedTag],
					);

					if (checkResult.rows.length > 0) {
						// Update existing tag
						await client.query(
							`UPDATE tags 
							 SET last_used = NOW(), 
							     usage_count = usage_count + 1
							 WHERE user_id = $1 AND tag = $2`,
							[userId, normalizedTag],
						);
					} else {
						// Insert new tag
						await client.query(
							`INSERT INTO tags (user_id, tag, first_used, last_used, usage_count)
							 VALUES ($1, $2, NOW(), NOW(), 1)`,
							[userId, normalizedTag],
						);
					}
				}

				return { success: true, tags: hashtags };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to extract and store tags:", error);
			// Don't throw - tag extraction is optional and shouldn't block notes save
			return { success: false, tags: [] };
		}
	});

/**
 * Get tag suggestions for autocomplete
 */
export const getTagSuggestions = createServerFn({ method: "GET" })
	.inputValidator((input: GetTagSuggestionsInput) => input)
	.handler(async ({ data }) => {
		const { userId, query } = data;

		console.log("[getTagSuggestions] Called with userId:", userId, "query:", query);

		try {
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				let sql = `
					SELECT tag, usage_count as "usageCount", last_used as "lastUsed"
					FROM tags
					WHERE user_id = $1
				`;
				const params: (number | string)[] = [userId];

				// Add partial match filter if query provided
				if (query && query.trim()) {
					sql += ` AND tag ILIKE $2`;
					params.push(`${query.toLowerCase()}%`);
				}

				sql += ` ORDER BY last_used DESC LIMIT 10`;

				console.log("[getTagSuggestions] Executing SQL:", sql, "params:", params);
				const result = await client.query(sql, params);
				console.log("[getTagSuggestions] Found", result.rows.length, "suggestions");
				return result.rows as TagSuggestion[];
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to get tag suggestions:", error);
			throw new Error("Failed to retrieve tag suggestions. Please try again.");
		}
	});

/**
 * Get all user tags with statistics
 */
export const getUserTags = createServerFn({ method: "GET" })
	.inputValidator((input: GetUserTagsInput) => input)
	.handler(async ({ data }) => {
		const { userId, sortBy = "usage" } = data;

		try {
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Determine sort order
				let orderBy = "usage_count DESC";
				if (sortBy === "alphabetical") {
					orderBy = "tag ASC";
				} else if (sortBy === "recent") {
					orderBy = "last_used DESC";
				}

				const sql = `
					SELECT 
						tag,
						usage_count as "usageCount",
						first_used as "firstUsed",
						last_used as "lastUsed",
						(last_used < NOW() - INTERVAL '30 days') as "isInactive"
					FROM tags
					WHERE user_id = $1
					ORDER BY ${orderBy}
				`;

				const result = await client.query(sql, [userId]);
				return result.rows as TagStatistics[];
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to get user tags:", error);
			throw new Error("Failed to retrieve tags. Please try again.");
		}
	});


export interface SearchByTagsInput {
	userId: number;
	tags: string[];
}

/**
 * Search screenshots by hashtags
 */
export const searchByTags = createServerFn({ method: "GET" })
	.inputValidator((input: SearchByTagsInput) => input)
	.handler(async ({ data }) => {
		const { userId, tags } = data;

		if (!tags || tags.length === 0) {
			return [];
		}

		try {
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Build OR conditions for each tag
				const conditions = tags
					.map((_, index) => `notes ILIKE $${index + 2}`)
					.join(" OR ");

				const sql = `
					SELECT id, user_id as "userId", filename, original_filename as "originalFilename", 
					       image_data as "imageData", mime_type as "mimeType", file_size as "fileSize",
					       capture_date as "captureDate", upload_date as "uploadDate", notes, 
					       folder_date as "folderDate", created_at as "createdAt", updated_at as "updatedAt"
					FROM screenshots
					WHERE user_id = $1 AND (${conditions})
					ORDER BY upload_date DESC
				`;

				// Prepare parameters: userId + each tag with wildcards
				const params = [userId, ...tags.map((tag) => `%${tag}%`)];

				const result = await client.query(sql, params);
				return result.rows;
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to search by tags:", error);
			throw new Error("Failed to search screenshots. Please try again.");
		}
	});

/**
 * Clean up orphaned tags (tags that no longer reference any screenshots)
 */
export const cleanupOrphanedTags = createServerFn({ method: "POST" })
	.inputValidator((input: { userId: number }) => input)
	.handler(async ({ data }) => {
		const { userId } = data;

		try {
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Get all tags for this user
				const tagsResult = await client.query(
					`SELECT tag FROM tags WHERE user_id = $1`,
					[userId]
				);

				const allTags = tagsResult.rows.map(row => row.tag);
				const tagsToDelete: string[] = [];

				// Check each tag to see if it's still referenced in any screenshot notes
				for (const tag of allTags) {
					const screenshotsResult = await client.query(
						`SELECT COUNT(*) as count FROM screenshots 
						 WHERE user_id = $1 AND notes ILIKE $2`,
						[userId, `%#${tag}%`]
					);

					const count = Number.parseInt(screenshotsResult.rows[0].count, 10);
					if (count === 0) {
						tagsToDelete.push(tag);
					}
				}

				// Delete orphaned tags
				if (tagsToDelete.length > 0) {
					for (const tag of tagsToDelete) {
						await client.query(
							`DELETE FROM tags WHERE user_id = $1 AND tag = $2`,
							[userId, tag]
						);
					}
				}

				return { success: true, deletedCount: tagsToDelete.length, deletedTags: tagsToDelete };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to cleanup orphaned tags:", error);
			// Don't throw - tag cleanup is optional and shouldn't block deletion
			return { success: false, deletedCount: 0, deletedTags: [] };
		}
	});
