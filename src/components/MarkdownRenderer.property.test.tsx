/**
 * Property-based tests for Markdown Renderer
 * Feature: screenshot-viewer-enhancements
 * Properties 18-22: Markdown rendering correctness
 * Validates: Requirements 6.1-6.5
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "./MarkdownRenderer";

// Generators for markdown content
const arbMarkdownBold = (): fc.Arbitrary<string> => {
	return fc.lorem({ maxCount: 2 }).map((text) => `**${text}**`);
};

const arbMarkdownList = (): fc.Arbitrary<string> => {
	return fc
		.array(fc.lorem({ maxCount: 1 }), { minLength: 1, maxLength: 5 })
		.map((items) => items.map((item) => `- ${item}`).join("\n"));
};

const arbMarkdownNestedList = (): fc.Arbitrary<string> => {
	return fc
		.array(fc.lorem({ maxCount: 1 }), { minLength: 2, maxLength: 4 })
		.map((items) => {
			const result = [`- ${items[0]}`];
			for (let i = 1; i < items.length; i++) {
				result.push(`  - ${items[i]}`);
			}
			return result.join("\n");
		});
};

const arbMarkdownWithHashtag = (): fc.Arbitrary<string> => {
	return fc
		.tuple(fc.lorem({ maxCount: 2 }), fc.stringMatching(/^[a-zA-Z0-9_-]+$/))
		.map(([text, tag]) => `${text} #${tag}`);
};

const arbMalformedMarkdown = (): fc.Arbitrary<string> => {
	return fc.oneof(
		fc.constant("**unclosed bold"),
		fc.constant("- list\n  - nested\n    - too deep\n      - way too deep"),
		fc.constant("[link]("),
		fc.constant("# heading\n## subheading\n### subsubheading"),
	);
};

describe("Property-Based Tests: Markdown Renderer", () => {
	describe("Property 18: Markdown bold renders correctly", () => {
		it("should render **text** as bold HTML", () => {
			fc.assert(
				fc.property(arbMarkdownBold(), (markdown) => {
					const { container } = render(
						<MarkdownRenderer content={markdown} />,
					);

					// Should contain <strong> tag
					const strong = container.querySelector("strong");
					return strong !== null;
				}),
				{ numRuns: 100 },
			);
		});

		it("should preserve text content in bold", () => {
			fc.assert(
				fc.property(fc.lorem({ maxCount: 2 }), (text) => {
					const markdown = `**${text}**`;
					const { container } = render(
						<MarkdownRenderer content={markdown} />,
					);

					// Should contain the text
					return container.textContent?.includes(text) || false;
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 19: Markdown lists render correctly", () => {
		it("should render - item as HTML list", () => {
			fc.assert(
				fc.property(arbMarkdownList(), (markdown) => {
					const { container } = render(
						<MarkdownRenderer content={markdown} />,
					);

					// Should contain <ul> and <li> tags
					const ul = container.querySelector("ul");
					const li = container.querySelector("li");
					return ul !== null && li !== null;
				}),
				{ numRuns: 100 },
			);
		});

		it("should render correct number of list items", () => {
			fc.assert(
				fc.property(
					fc.array(fc.lorem({ maxCount: 1 }), { minLength: 1, maxLength: 5 }),
					(items) => {
						const markdown = items.map((item) => `- ${item}`).join("\n");
						const { container } = render(
							<MarkdownRenderer content={markdown} />,
						);

						// Should have same number of <li> elements as items
						const listItems = container.querySelectorAll("li");
						return listItems.length === items.length;
					},
				),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 20: Nested lists render with indentation", () => {
		it("should render nested lists with proper structure", () => {
			fc.assert(
				fc.property(arbMarkdownNestedList(), (markdown) => {
					const { container } = render(
						<MarkdownRenderer content={markdown} />,
					);

					// Should contain nested <ul> tags
					const outerUl = container.querySelector("ul");
					const nestedUl = outerUl?.querySelector("ul");
					return outerUl !== null && nestedUl !== null;
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 21: Hashtags work within markdown", () => {
		it("should render both markdown and hashtags correctly", () => {
			fc.assert(
				fc.property(arbMarkdownWithHashtag(), (markdown) => {
					const { container } = render(
						<MarkdownRenderer content={markdown} />,
					);

					// Should contain hashtag styling
					const hashtagElement = container.querySelector(".text-blue-400");
					return hashtagElement !== null;
				}),
				{ numRuns: 100 },
			);
		});

		it("should render bold markdown with hashtags", () => {
			fc.assert(
				fc.property(
					fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
					fc.lorem({ maxCount: 1 }),
					(tag, text) => {
						const markdown = `**${text}** #${tag}`;
						const { container } = render(
							<MarkdownRenderer content={markdown} />,
						);

						// Should have both bold and hashtag
						const strong = container.querySelector("strong");
						const hashtag = container.querySelector(".text-blue-400");
						return strong !== null && hashtag !== null;
					},
				),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 22: Rendering errors show raw text", () => {
		it("should not show [object Object] on any input", () => {
			fc.assert(
				fc.property(
					fc.oneof(
						fc.lorem({ maxCount: 5 }),
						arbMarkdownBold(),
						arbMarkdownList(),
						arbMalformedMarkdown(),
					),
					(markdown) => {
						const { container } = render(
							<MarkdownRenderer content={markdown} />,
						);

						// Should never contain [object Object]
						const text = container.textContent || "";
						return !text.includes("[object Object]");
					},
				),
				{ numRuns: 100 },
			);
		});

		it("should render something for any non-empty input", () => {
			fc.assert(
				fc.property(
					fc.lorem({ maxCount: 3 }).filter((s) => s.trim().length > 0),
					(markdown) => {
						const { container } = render(
							<MarkdownRenderer content={markdown} />,
						);

						// Should have some content
						const text = container.textContent || "";
						return text.trim().length > 0;
					},
				),
				{ numRuns: 100 },
			);
		});

		it("should handle empty content gracefully", () => {
			fc.assert(
				fc.property(fc.constant(""), (markdown) => {
					const { container } = render(
						<MarkdownRenderer content={markdown} />,
					);

					// Should not crash and should render something
					return container !== null;
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Round-trip properties", () => {
		it("should preserve text content through rendering", () => {
			fc.assert(
				fc.property(fc.lorem({ maxCount: 3 }), (text) => {
					const { container } = render(
						<MarkdownRenderer content={text} />,
					);

					// Rendered content should contain the original text
					const renderedText = container.textContent || "";
					return renderedText.includes(text);
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Idempotence properties", () => {
		it("should produce consistent output for same input", () => {
			fc.assert(
				fc.property(fc.lorem({ maxCount: 3 }), (markdown) => {
					const { container: container1 } = render(
						<MarkdownRenderer content={markdown} />,
					);
					const { container: container2 } = render(
						<MarkdownRenderer content={markdown} />,
					);

					// Both renders should produce same HTML
					return container1.innerHTML === container2.innerHTML;
				}),
				{ numRuns: 100 },
			);
		});
	});
});
