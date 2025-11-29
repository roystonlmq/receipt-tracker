/**
 * Property-based tests for tag utilities
 * Feature: enhanced-notes, Property 1, 2, 20
 * Validates: Requirements 3.1, 3.2, 1.2, 1.3
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
	extractHashtags,
	normalizeTag,
	formatTag,
	isValidHashtag,
} from "./tags";
import {
	arbTextWithHashtags,
	arbTagVariant,
	arbTag,
	arbHashtag,
} from "@/test/generators";

describe("Property-Based Tests: Tag Utilities", () => {
	describe("Property 1: Hashtag extraction accuracy", () => {
		it("should extract all valid hashtags from text", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const extracted = extractHashtags(text);

					// Find all hashtags manually using the same regex
					const hashtagRegex = /#([a-zA-Z0-9_-]+)(?=\s|[.,!?;:]|$)/g;
					const expected = new Set<string>();
					for (const match of text.matchAll(hashtagRegex)) {
						expected.add(match[1].toLowerCase());
					}

					// Extracted tags should match expected tags
					const extractedSet = new Set(extracted);
					return (
						extractedSet.size === expected.size &&
						[...expected].every((tag) => extractedSet.has(tag))
					);
				}),
				{ numRuns: 100 },
			);
		});

		it("should return unique tags (no duplicates)", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const extracted = extractHashtags(text);
					const uniqueExtracted = [...new Set(extracted)];

					// Length should be same (no duplicates)
					return extracted.length === uniqueExtracted.length;
				}),
				{ numRuns: 100 },
			);
		});

		it("should normalize tags to lowercase", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const extracted = extractHashtags(text);

					// All extracted tags should be lowercase
					return extracted.every((tag) => tag === tag.toLowerCase());
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 2: Tag normalization consistency (idempotence)", () => {
		it("should produce same result when normalized multiple times", () => {
			fc.assert(
				fc.property(arbTagVariant(), (tag) => {
					const normalized1 = normalizeTag(tag);
					const normalized2 = normalizeTag(normalized1);
					const normalized3 = normalizeTag(normalized2);

					// Normalizing multiple times should give same result
					return normalized1 === normalized2 && normalized2 === normalized3;
				}),
				{ numRuns: 100 },
			);
		});

		it("should always produce lowercase output", () => {
			fc.assert(
				fc.property(arbTagVariant(), (tag) => {
					const normalized = normalizeTag(tag);
					return normalized === normalized.toLowerCase();
				}),
				{ numRuns: 100 },
			);
		});

		it("should remove # prefix", () => {
			fc.assert(
				fc.property(arbHashtag(), (hashtag) => {
					const normalized = normalizeTag(hashtag);
					return !normalized.startsWith("#");
				}),
				{ numRuns: 100 },
			);
		});

		it("should trim whitespace", () => {
			fc.assert(
				fc.property(arbTag(), (tag) => {
					const withWhitespace = `  ${tag}  `;
					const normalized = normalizeTag(withWhitespace);
					return normalized === normalized.trim();
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 20: Hashtag highlighting consistency", () => {
		it("should format tags consistently", () => {
			fc.assert(
				fc.property(arbTag(), (tag) => {
					const formatted = formatTag(tag);

					// Should always start with #
					return formatted.startsWith("#");
				}),
				{ numRuns: 100 },
			);
		});

		it("should not add duplicate # prefix", () => {
			fc.assert(
				fc.property(arbHashtag(), (hashtag) => {
					const formatted = formatTag(hashtag);

					// Should not have ##
					return !formatted.startsWith("##");
				}),
				{ numRuns: 100 },
			);
		});

		it("should validate hashtags correctly", () => {
			fc.assert(
				fc.property(arbHashtag(), (hashtag) => {
					// Valid hashtags should pass validation
					return isValidHashtag(hashtag);
				}),
				{ numRuns: 100 },
			);
		});

		it("should reject invalid hashtags", () => {
			fc.assert(
				fc.property(
					fc.oneof(
						fc.constant("#"), // Just hash
						fc.constant("##test"), // Double hash
						fc.constant("#test tag"), // Space in tag
						fc.constant("#test@tag"), // Special char
						fc.constant("test"), // No hash
					),
					(invalidHashtag) => {
						// Invalid hashtags should fail validation
						return !isValidHashtag(invalidHashtag);
					},
				),
				{ numRuns: 100 },
			);
		});
	});

	describe("Round-trip properties", () => {
		it("should maintain tag identity through normalize -> format cycle", () => {
			fc.assert(
				fc.property(arbTag(), (tag) => {
					const normalized = normalizeTag(tag);
					const formatted = formatTag(normalized);
					const normalizedAgain = normalizeTag(formatted);

					// Should get back to normalized form
					return normalized === normalizedAgain;
				}),
				{ numRuns: 100 },
			);
		});
	});
});
