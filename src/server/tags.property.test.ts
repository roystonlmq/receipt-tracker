/**
 * Property-based tests for tag storage and search server functions
 * Feature: enhanced-notes, Properties 3-10
 * Validates: Requirements 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 2.2, 2.3
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import { Client } from "pg";
import { extractAndStoreTags, getTagSuggestions, searchByTags } from "./tags";
import { arbTag, arbUserId, arbNotesWithTags } from "@/test/generators";

describe.skip("Property-Based Tests: Tag Storage and Search", () => {
	// Note: These tests are skipped by default because they require a properly configured
	// PostgreSQL database. To run them:
	// 1. Ensure DATABASE_URL is set in .env.local with valid credentials
	// 2. Remove .skip from the describe block
	// 3. Run: pnpm test tags.property.test

	let client: Client;
	const testUserIds: number[] = [];

	beforeAll(async () => {
		// Connect to test database
		client = new Client({
			connectionString: process.env.DATABASE_URL!,
		});
		await client.connect();

		// Create test users
		for (let i = 0; i < 3; i++) {
			const result = await client.query(
				`INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
				[`test-tags-${Date.now()}-${i}@example.com`, `Test User ${i}`],
			);
			testUserIds.push(result.rows[0].id);
		}
	});

	afterAll(async () => {
		// Cleanup test data
		for (const userId of testUserIds) {
			await client.query(`DELETE FROM tags WHERE user_id = $1`, [userId]);
			await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
		}
		await client.end();
	});

	describe("Property 3: Tag storage uniqueness", () => {
		it("should maintain at most one record per user+tag combination", async () => {
			await fc.assert(
				fc.asyncProperty(
					fc.constantFrom(...testUserIds),
					arbTag(),
					fc.integer({ min: 1, max: 5 }),
					async (userId, tag, repeatCount) => {
						// Store the same tag multiple times
						for (let i = 0; i < repeatCount; i++) {
							await extractAndStoreTags({
								data: {
									userId,
									screenshotId: 1,
									notes: `Test note with #${tag}`,
								},
							});
						}

						// Check database for duplicates
						const result = await client.query(
							`SELECT COUNT(*) as count FROM tags WHERE user_id = $1 AND tag = $2`,
							[userId, tag.toLowerCase()],
						);

						const count = Number.parseInt(result.rows[0].count, 10);

						// Cleanup
						await client.query(
							`DELETE FROM tags WHERE user_id = $1 AND tag = $2`,
							[userId, tag.toLowerCase()],
						);

						// Should have exactly one record
						return count === 1;
					},
				),
				{ numRuns: 50 }, // Reduced runs for database tests
			);
		});
	});

	describe("Property 4: Tag timestamp update", () => {
		it("should update lastUsed timestamp when tag is reused", async () => {
			await fc.assert(
				fc.asyncProperty(
					fc.constantFrom(...testUserIds),
					arbTag(),
					async (userId, tag) => {
						// Store tag first time
						await extractAndStoreTags({
							data: {
								userId,
								screenshotId: 1,
								notes: `First use #${tag}`,
							},
						});

						// Get first timestamp
						const firstResult = await client.query(
							`SELECT last_used FROM tags WHERE user_id = $1 AND tag = $2`,
							[userId, tag.toLowerCase()],
						);
						const firstTimestamp = new Date(firstResult.rows[0].last_used);

						// Wait a bit
						await new Promise((resolve) => setTimeout(resolve, 10));

						// Store tag second time
						await extractAndStoreTags({
							data: {
								userId,
								screenshotId: 2,
								notes: `Second use #${tag}`,
							},
						});

						// Get second timestamp
						const secondResult = await client.query(
							`SELECT last_used FROM tags WHERE user_id = $1 AND tag = $2`,
							[userId, tag.toLowerCase()],
						);
						const secondTimestamp = new Date(secondResult.rows[0].last_used);

						// Cleanup
						await client.query(
							`DELETE FROM tags WHERE user_id = $1 AND tag = $2`,
							[userId, tag.toLowerCase()],
						);

						// Second timestamp should be later
						return secondTimestamp >= firstTimestamp;
					},
				),
				{ numRuns: 30 },
			);
		});
	});

	describe("Property 6: Tag isolation by user", () => {
		it("should only return tags belonging to the requesting user", async () => {
			await fc.assert(
				fc.asyncProperty(
					fc.tuple(
						fc.constantFrom(...testUserIds),
						fc.constantFrom(...testUserIds),
					).filter(([u1, u2]) => u1 !== u2),
					arbTag(),
					arbTag(),
					async ([user1, user2], tag1, tag2) => {
						// User 1 creates tag1
						await extractAndStoreTags({
							data: {
								userId: user1,
								screenshotId: 1,
								notes: `User 1 tag #${tag1}`,
							},
						});

						// User 2 creates tag2
						await extractAndStoreTags({
							data: {
								userId: user2,
								screenshotId: 2,
								notes: `User 2 tag #${tag2}`,
							},
						});

						// Get suggestions for user 1
						const user1Suggestions = await getTagSuggestions({
							data: { userId: user1 },
						});

						// Get suggestions for user 2
						const user2Suggestions = await getTagSuggestions({
							data: { userId: user2 },
						});

						// Cleanup
						await client.query(
							`DELETE FROM tags WHERE user_id = $1 AND tag = $2`,
							[user1, tag1.toLowerCase()],
						);
						await client.query(
							`DELETE FROM tags WHERE user_id = $1 AND tag = $2`,
							[user2, tag2.toLowerCase()],
						);

						// User 1 should only see tag1, not tag2
						const user1HasTag1 = user1Suggestions.some(
							(s) => s.tag === tag1.toLowerCase(),
						);
						const user1HasTag2 = user1Suggestions.some(
							(s) => s.tag === tag2.toLowerCase(),
						);

						// User 2 should only see tag2, not tag1
						const user2HasTag2 = user2Suggestions.some(
							(s) => s.tag === tag2.toLowerCase(),
						);
						const user2HasTag1 = user2Suggestions.some(
							(s) => s.tag === tag1.toLowerCase(),
						);

						return user1HasTag1 && !user1HasTag2 && user2HasTag2 && !user2HasTag1;
					},
				),
				{ numRuns: 20 },
			);
		});
	});

	describe("Property 9: Tag suggestion filtering", () => {
		it("should return suggestions that start with query string", async () => {
			await fc.assert(
				fc.asyncProperty(
					fc.constantFrom(...testUserIds),
					fc.array(arbTag(), { minLength: 3, maxLength: 5 }),
					async (userId, tags) => {
						// Store multiple tags
						for (const tag of tags) {
							await extractAndStoreTags({
								data: {
									userId,
									screenshotId: 1,
									notes: `Test #${tag}`,
								},
							});
						}

						// Pick a tag and use first 2 characters as query
						const testTag = tags[0];
						const query = testTag.slice(0, Math.min(2, testTag.length));

						// Get filtered suggestions
						const suggestions = await getTagSuggestions({
							data: { userId, query },
						});

						// Cleanup
						for (const tag of tags) {
							await client.query(
								`DELETE FROM tags WHERE user_id = $1 AND tag = $2`,
								[userId, tag.toLowerCase()],
							);
						}

						// All suggestions should start with query (case-insensitive)
						return suggestions.every((s) =>
							s.tag.toLowerCase().startsWith(query.toLowerCase()),
						);
					},
				),
				{ numRuns: 20 },
			);
		});
	});

	describe("Property 10: Tag suggestion ordering", () => {
		it("should order suggestions by lastUsed DESC", async () => {
			await fc.assert(
				fc.asyncProperty(
					fc.constantFrom(...testUserIds),
					fc.array(arbTag(), { minLength: 3, maxLength: 5 }),
					async (userId, tags) => {
						// Store tags with delays to ensure different timestamps
						for (const tag of tags) {
							await extractAndStoreTags({
								data: {
									userId,
									screenshotId: 1,
									notes: `Test #${tag}`,
								},
							});
							await new Promise((resolve) => setTimeout(resolve, 10));
						}

						// Get suggestions
						const suggestions = await getTagSuggestions({
							data: { userId },
						});

						// Cleanup
						for (const tag of tags) {
							await client.query(
								`DELETE FROM tags WHERE user_id = $1 AND tag = $2`,
								[userId, tag.toLowerCase()],
							);
						}

						// Check if ordered by lastUsed DESC
						for (let i = 0; i < suggestions.length - 1; i++) {
							const current = new Date(suggestions[i].lastUsed);
							const next = new Date(suggestions[i + 1].lastUsed);
							if (current < next) {
								return false;
							}
						}

						return true;
					},
				),
				{ numRuns: 20 },
			);
		});
	});

	describe("Integration: Full tag workflow", () => {
		it("should handle complete tag lifecycle correctly", async () => {
			await fc.assert(
				fc.asyncProperty(
					fc.constantFrom(...testUserIds),
					arbNotesWithTags(),
					async (userId, notes) => {
						// Extract and store tags
						const result = await extractAndStoreTags({
							data: {
								userId,
								screenshotId: 1,
								notes,
							},
						});

						// Get suggestions
						const suggestions = await getTagSuggestions({
							data: { userId },
						});

						// All extracted tags should appear in suggestions
						const allTagsInSuggestions = result.tags.every((tag) =>
							suggestions.some((s) => s.tag === tag.toLowerCase()),
						);

						// Cleanup
						for (const tag of result.tags) {
							await client.query(
								`DELETE FROM tags WHERE user_id = $1 AND tag = $2`,
								[userId, tag.toLowerCase()],
							);
						}

						return allTagsInSuggestions;
					},
				),
				{ numRuns: 30 },
			);
		});
	});
});
