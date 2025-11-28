import { describe, it, expect } from "vitest";
import {
	extractHashtags,
	normalizeTag,
	formatTag,
	isValidHashtag,
} from "./tags";

describe("extractHashtags", () => {
	it("should extract single hashtag", () => {
		const result = extractHashtags("This is a #test");
		expect(result).toEqual(["test"]);
	});

	it("should extract multiple hashtags", () => {
		const result = extractHashtags("This is #test and #example");
		expect(result).toEqual(["test", "example"]);
	});

	it("should handle hashtags with hyphens", () => {
		const result = extractHashtags("Project #project-alpha is ready");
		expect(result).toEqual(["project-alpha"]);
	});

	it("should handle hashtags with underscores", () => {
		const result = extractHashtags("Meeting with #john_doe");
		expect(result).toEqual(["john_doe"]);
	});

	it("should normalize to lowercase", () => {
		const result = extractHashtags("This is #Test and #EXAMPLE");
		expect(result).toEqual(["test", "example"]);
	});

	it("should remove duplicate hashtags", () => {
		const result = extractHashtags("#test #example #test");
		expect(result).toEqual(["test", "example"]);
	});

	it("should handle hashtags at end of sentence", () => {
		const result = extractHashtags("This is a test #receipt.");
		expect(result).toEqual(["receipt"]);
	});

	it("should handle hashtags with punctuation", () => {
		const result = extractHashtags("Tags: #tag1, #tag2, #tag3!");
		expect(result).toEqual(["tag1", "tag2", "tag3"]);
	});

	it("should handle hashtags at end of text", () => {
		const result = extractHashtags("This is #test");
		expect(result).toEqual(["test"]);
	});

	it("should return empty array for text without hashtags", () => {
		const result = extractHashtags("This is just plain text");
		expect(result).toEqual([]);
	});

	it("should handle multiple # symbols", () => {
		const result = extractHashtags("##test should only match once");
		expect(result).toEqual(["test"]);
	});

	it("should not match # followed by space", () => {
		const result = extractHashtags("This is # not a tag");
		expect(result).toEqual([]);
	});

	it("should not match # followed by special characters", () => {
		const result = extractHashtags("This is #@invalid");
		expect(result).toEqual([]);
	});
});

describe("normalizeTag", () => {
	it("should remove # prefix", () => {
		expect(normalizeTag("#test")).toBe("test");
	});

	it("should convert to lowercase", () => {
		expect(normalizeTag("#Test")).toBe("test");
		expect(normalizeTag("#TEST")).toBe("test");
	});

	it("should trim whitespace", () => {
		expect(normalizeTag(" test ")).toBe("test");
		expect(normalizeTag("#test ")).toBe("test");
	});

	it("should handle tag without #", () => {
		expect(normalizeTag("test")).toBe("test");
	});

	it("should handle empty string", () => {
		expect(normalizeTag("")).toBe("");
	});
});

describe("formatTag", () => {
	it("should add # prefix if missing", () => {
		expect(formatTag("test")).toBe("#test");
	});

	it("should not add # if already present", () => {
		expect(formatTag("#test")).toBe("#test");
	});

	it("should handle empty string", () => {
		expect(formatTag("")).toBe("#");
	});
});

describe("isValidHashtag", () => {
	it("should validate correct hashtags", () => {
		expect(isValidHashtag("#test")).toBe(true);
		expect(isValidHashtag("#test123")).toBe(true);
		expect(isValidHashtag("#test-tag")).toBe(true);
		expect(isValidHashtag("#test_tag")).toBe(true);
	});

	it("should reject hashtags without #", () => {
		expect(isValidHashtag("test")).toBe(false);
	});

	it("should reject hashtags with spaces", () => {
		expect(isValidHashtag("#test tag")).toBe(false);
	});

	it("should reject hashtags with special characters", () => {
		expect(isValidHashtag("#test@tag")).toBe(false);
		expect(isValidHashtag("#test!")).toBe(false);
		expect(isValidHashtag("#test.tag")).toBe(false);
	});

	it("should reject empty hashtag", () => {
		expect(isValidHashtag("#")).toBe(false);
	});

	it("should reject hashtag with only #", () => {
		expect(isValidHashtag("##")).toBe(false);
	});
});
