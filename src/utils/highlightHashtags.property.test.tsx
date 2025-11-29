/**
 * Property-based tests for hashtag highlighting
 * Feature: enhanced-notes, Property 20
 * Validates: Requirements 1.2, 1.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import { highlightHashtags, highlightHashtagsClickable } from "./highlightHashtags";
import { arbTextWithHashtags, arbHashtag } from "@/test/generators";

describe("Property-Based Tests: Hashtag Highlighting", () => {
	describe("Property 20: Hashtag highlighting consistency", () => {
		it("should preserve original text content", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const result = highlightHashtags(text);
					const { container } = render(<div>{result}</div>);

					// Rendered text should match original
					return container.textContent === text;
				}),
				{ numRuns: 100 },
			);
		});

		it("should apply consistent styling to all hashtags", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const result = highlightHashtags(text);
					const { container } = render(<div>{result}</div>);

					// All hashtags should have the same styling class
					const hashtags = container.querySelectorAll(".text-blue-400");
					const allHaveSameClass = Array.from(hashtags).every((el) =>
						el.classList.contains("font-semibold"),
					);

					return allHaveSameClass;
				}),
				{ numRuns: 100 },
			);
		});

		it("should highlight all hashtags in text", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const result = highlightHashtags(text);
					const { container } = render(<div>{result}</div>);

					// Count hashtags in original text
					const hashtagRegex = /#[a-zA-Z0-9_-]+/g;
					const expectedCount = (text.match(hashtagRegex) || []).length;

					// Count styled hashtags in rendered output
					const styledHashtags = container.querySelectorAll(".text-blue-400");

					return styledHashtags.length === expectedCount;
				}),
				{ numRuns: 100 },
			);
		});

		it("should make hashtags clickable with consistent behavior", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					let clickedHashtag = "";
					const handleClick = (hashtag: string) => {
						clickedHashtag = hashtag;
					};

					const result = highlightHashtagsClickable(text, handleClick);
					const { container } = render(<div>{result}</div>);

					// All hashtags should be buttons
					const buttons = container.querySelectorAll("button");
					const hashtagRegex = /#[a-zA-Z0-9_-]+/g;
					const expectedCount = (text.match(hashtagRegex) || []).length;

					return buttons.length === expectedCount;
				}),
				{ numRuns: 100 },
			);
		});

		it("should preserve text content with clickable hashtags", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const handleClick = () => {};
					const result = highlightHashtagsClickable(text, handleClick);
					const { container } = render(<div>{result}</div>);

					// Rendered text should match original
					return container.textContent === text;
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Edge cases", () => {
		it("should handle empty strings", () => {
			const result = highlightHashtags("");
			expect(result).toHaveLength(0);
		});

		it("should handle text without hashtags", () => {
			fc.assert(
				fc.property(fc.lorem(), (text) => {
					const result = highlightHashtags(text);
					const { container } = render(<div>{result}</div>);

					// Should have no styled hashtags
					const styledHashtags = container.querySelectorAll(".text-blue-400");
					return styledHashtags.length === 0;
				}),
				{ numRuns: 50 },
			);
		});

		it("should handle consecutive hashtags", () => {
			fc.assert(
				fc.property(
					fc.array(arbHashtag(), { minLength: 2, maxLength: 5 }),
					(hashtags) => {
						const text = hashtags.join(" ");
						const result = highlightHashtags(text);
						const { container } = render(<div>{result}</div>);

						const styledHashtags = container.querySelectorAll(".text-blue-400");
						return styledHashtags.length === hashtags.length;
					},
				),
				{ numRuns: 50 },
			);
		});
	});
});
