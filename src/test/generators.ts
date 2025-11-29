/**
 * Property-based test generators using fast-check
 * These generators create random test data for comprehensive testing
 */

import * as fc from "fast-check";

/**
 * Generate valid hashtag strings (without the # prefix)
 * Examples: "test", "project-alpha", "john_doe", "tag123"
 */
export const arbTag = (): fc.Arbitrary<string> => {
	return fc
		.stringMatching(/^[a-zA-Z0-9_-]+$/)
		.filter((s) => s.length > 0 && s.length <= 50);
};

/**
 * Generate hashtags with # prefix
 * Examples: "#test", "#project-alpha", "#john_doe"
 */
export const arbHashtag = (): fc.Arbitrary<string> => {
	return arbTag().map((tag) => `#${tag}`);
};

/**
 * Generate text containing hashtags
 * Examples: "This is #test", "Meeting with #john-doe about #project"
 */
export const arbTextWithHashtags = (): fc.Arbitrary<string> => {
	return fc
		.tuple(
			fc.array(fc.oneof(fc.lorem(), arbHashtag()), { minLength: 1, maxLength: 10 }),
		)
		.map(([parts]) => parts.join(" "));
};

/**
 * Generate text with various edge cases
 * Includes: empty strings, whitespace, special characters, multiple hashtags
 */
export const arbTextWithEdgeCases = (): fc.Arbitrary<string> => {
	return fc.oneof(
		fc.constant(""), // Empty string
		fc.constant("   "), // Whitespace only
		fc.constant("#"), // Just hash symbol
		fc.constant("##test"), // Double hash
		fc.constant("#test#another"), // Adjacent hashtags
		fc.constant("#test."), // Hashtag with punctuation
		fc.constant("#test, #another!"), // Multiple with punctuation
		fc.constant("text without hashtags"),
		arbTextWithHashtags(),
	);
};

/**
 * Generate tag with various formats (for normalization testing)
 * Examples: "#Test", "test", " #test ", "#TEST"
 */
export const arbTagVariant = (): fc.Arbitrary<string> => {
	// Generate a simple tag first (letters only for better test cases)
	const simpleTag = fc
		.stringMatching(/^[a-zA-Z]+$/)
		.filter((s) => s.length > 0 && s.length <= 20);

	return simpleTag.chain((tag) =>
		fc.oneof(
			fc.constant(tag), // lowercase
			fc.constant(tag.toUpperCase()), // uppercase
			fc.constant(`#${tag}`), // with hash
			fc.constant(` ${tag} `), // with whitespace
			fc.constant(`#${tag.toUpperCase()}`), // hash + uppercase
			fc.constant(` #${tag} `), // hash + whitespace
		),
	);
};

/**
 * Generate user ID (positive integer)
 */
export const arbUserId = (): fc.Arbitrary<number> => {
	return fc.integer({ min: 1, max: 1000 });
};

/**
 * Generate screenshot ID (positive integer)
 */
export const arbScreenshotId = (): fc.Arbitrary<number> => {
	return fc.integer({ min: 1, max: 10000 });
};

/**
 * Generate timestamp (Date object)
 */
export const arbTimestamp = (): fc.Arbitrary<Date> => {
	return fc.date({ min: new Date("2020-01-01"), max: new Date("2025-12-31") });
};

/**
 * Generate array of unique tags
 */
export const arbUniqueTags = (): fc.Arbitrary<string[]> => {
	return fc.uniqueArray(arbTag(), { minLength: 0, maxLength: 20 });
};

/**
 * Generate array of hashtags (with # prefix)
 */
export const arbHashtagArray = (): fc.Arbitrary<string[]> => {
	return fc.array(arbHashtag(), { minLength: 1, maxLength: 5 });
};

/**
 * Generate notes text with multiple hashtags
 */
export const arbNotesWithTags = (): fc.Arbitrary<string> => {
	return fc
		.tuple(
			fc.lorem({ maxCount: 3 }),
			fc.array(arbHashtag(), { minLength: 0, maxLength: 5 }),
		)
		.map(([text, tags]) => {
			if (tags.length === 0) return text;
			return `${text} ${tags.join(" ")}`;
		});
};

/**
 * Generate query string for tag suggestions (partial tag)
 */
export const arbTagQuery = (): fc.Arbitrary<string> => {
	return arbTag().map((tag) => {
		// Return first 1-3 characters as partial query
		const length = Math.min(tag.length, Math.floor(Math.random() * 3) + 1);
		return tag.slice(0, length);
	});
};
