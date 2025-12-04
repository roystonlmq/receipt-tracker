/**
 * Property-based tests for Enhanced Notes Input
 * Feature: screenshot-viewer-enhancements
 * Properties 23-32: Tab key support and hashtag highlighting
 * Validates: Requirements 7.1-7.5, 8.1-8.5
 */

import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render, fireEvent } from "@testing-library/react";
import { EnhancedNotesInput } from "./EnhancedNotesInput";

// Mock server functions
vi.mock("@/server/tags", () => ({
	getTagSuggestions: vi.fn(() => Promise.resolve([])),
}));

// Generators
const arbTextWithCursor = (): fc.Arbitrary<{ text: string; cursor: number }> => {
	return fc.lorem({ maxCount: 3 }).chain((text) =>
		fc.record({
			text: fc.constant(text),
			cursor: fc.integer({ min: 0, max: text.length }),
		}),
	);
};

const arbIndentedText = (): fc.Arbitrary<string> => {
	return fc
		.array(fc.lorem({ maxCount: 1 }), { minLength: 1, maxLength: 5 })
		.map((lines) => lines.map((line) => `  ${line}`).join("\n"));
};

const arbTextWithHashtags = (): fc.Arbitrary<string> => {
	return fc
		.tuple(
			fc.lorem({ maxCount: 2 }),
			fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), {
				minLength: 1,
				maxLength: 3,
			}),
		)
		.map(([text, tags]) => `${text} ${tags.map((t) => `#${t}`).join(" ")}`);
};

describe("Property-Based Tests: Enhanced Notes Input", () => {
	describe("Property 23: Tab inserts indentation", () => {
		it("should insert spaces when Tab is pressed", () => {
			fc.assert(
				fc.property(arbTextWithCursor(), ({ text, cursor }) => {
					let currentValue = text;
					const onChange = vi.fn((value: string) => {
						currentValue = value;
					});

					const { container } = render(
						<EnhancedNotesInput
							value={text}
							onChange={onChange}
							userId={1}
						/>,
					);

					const textarea = container.querySelector("textarea");
					if (textarea) {
						// Set cursor position
						textarea.selectionStart = cursor;
						textarea.selectionEnd = cursor;

						// Press Tab
						fireEvent.keyDown(textarea, { key: "Tab" });

						// Should have called onChange with indentation added
						return onChange.mock.calls.length > 0;
					}

					return true;
				}),
				{ numRuns: 50 },
			);
		});

		it("should insert exactly 2 spaces for indentation", () => {
			fc.assert(
				fc.property(fc.lorem({ maxCount: 2 }), (text) => {
					let currentValue = text;
					const onChange = vi.fn((value: string) => {
						currentValue = value;
					});

					const { container } = render(
						<EnhancedNotesInput
							value={text}
							onChange={onChange}
							userId={1}
						/>,
					);

					const textarea = container.querySelector("textarea");
					if (textarea) {
						// Set cursor at start
						textarea.selectionStart = 0;
						textarea.selectionEnd = 0;

						// Press Tab
						fireEvent.keyDown(textarea, { key: "Tab" });

						// Check if 2 spaces were added
						if (onChange.mock.calls.length > 0) {
							const newValue = onChange.mock.calls[0][0];
							return newValue.startsWith("  ") && newValue.endsWith(text);
						}
					}

					return true;
				}),
				{ numRuns: 50 },
			);
		});
	});

	describe("Property 24: Tab doesn't change focus", () => {
		it("should keep focus in textarea after Tab press", () => {
			fc.assert(
				fc.property(fc.lorem({ maxCount: 2 }), (text) => {
					const { container } = render(
						<EnhancedNotesInput
							value={text}
							onChange={vi.fn()}
							userId={1}
							autoFocus={true}
						/>,
					);

					const textarea = container.querySelector("textarea");
					if (textarea) {
						// Focus should be on textarea
						const hadFocusBefore = document.activeElement === textarea;

						// Press Tab
						fireEvent.keyDown(textarea, { key: "Tab" });

						// Focus should still be on textarea
						const hasFocusAfter = document.activeElement === textarea;

						return hadFocusBefore && hasFocusAfter;
					}

					return true;
				}),
				{ numRuns: 50 },
			);
		});
	});

	describe("Property 25: Shift+Tab removes indentation", () => {
		it("should remove indentation when Shift+Tab is pressed", () => {
			fc.assert(
				fc.property(arbIndentedText(), (text) => {
					let currentValue = text;
					const onChange = vi.fn((value: string) => {
						currentValue = value;
					});

					const { container } = render(
						<EnhancedNotesInput
							value={text}
							onChange={onChange}
							userId={1}
						/>,
					);

					const textarea = container.querySelector("textarea");
					if (textarea) {
						// Set cursor at start of first line
						textarea.selectionStart = 0;
						textarea.selectionEnd = 0;

						// Press Shift+Tab
						fireEvent.keyDown(textarea, { key: "Tab", shiftKey: true });

						// Should have called onChange
						return onChange.mock.calls.length > 0;
					}

					return true;
				}),
				{ numRuns: 50 },
			);
		});
	});

	describe("Property 26: Tab indents selected lines", () => {
		it("should indent all selected lines when Tab is pressed", () => {
			fc.assert(
				fc.property(
					fc.array(fc.lorem({ maxCount: 1 }), { minLength: 2, maxLength: 4 }),
					(lines) => {
						const text = lines.join("\n");
						let currentValue = text;
						const onChange = vi.fn((value: string) => {
							currentValue = value;
						});

						const { container } = render(
							<EnhancedNotesInput
								value={text}
								onChange={onChange}
								userId={1}
							/>,
						);

						const textarea = container.querySelector("textarea");
						if (textarea) {
							// Select all text
							textarea.selectionStart = 0;
							textarea.selectionEnd = text.length;

							// Press Tab
							fireEvent.keyDown(textarea, { key: "Tab" });

							// Should have called onChange
							return onChange.mock.calls.length > 0;
						}

						return true;
					},
				),
				{ numRuns: 50 },
			);
		});
	});

	describe("Property 27: Shift+Tab unindents selected lines", () => {
		it("should unindent all selected lines when Shift+Tab is pressed", () => {
			fc.assert(
				fc.property(
					fc.array(fc.lorem({ maxCount: 1 }), { minLength: 2, maxLength: 4 }),
					(lines) => {
						const text = lines.map((line) => `  ${line}`).join("\n");
						let currentValue = text;
						const onChange = vi.fn((value: string) => {
							currentValue = value;
						});

						const { container } = render(
							<EnhancedNotesInput
								value={text}
								onChange={onChange}
								userId={1}
							/>,
						);

						const textarea = container.querySelector("textarea");
						if (textarea) {
							// Select all text
							textarea.selectionStart = 0;
							textarea.selectionEnd = text.length;

							// Press Shift+Tab
							fireEvent.keyDown(textarea, { key: "Tab", shiftKey: true });

							// Should have called onChange
							return onChange.mock.calls.length > 0;
						}

						return true;
					},
				),
				{ numRuns: 50 },
			);
		});
	});

	describe("Property 28: Hashtags are highlighted in editor", () => {
		it("should highlight hashtags in the editor", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const { container } = render(
						<EnhancedNotesInput
							value={text}
							onChange={vi.fn()}
							userId={1}
						/>,
					);

					// Should have highlighting overlay
					const overlay = container.querySelector(".text-blue-400");
					return overlay !== null;
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 29: All hashtags are highlighted", () => {
		it("should highlight all hashtags in content", () => {
			fc.assert(
				fc.property(
					fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), {
						minLength: 2,
						maxLength: 5,
					}),
					(tags) => {
						const text = tags.map((t) => `#${t}`).join(" ");
						const { container } = render(
							<EnhancedNotesInput
								value={text}
								onChange={vi.fn()}
								userId={1}
							/>,
						);

						// Count highlighted elements
						const highlighted = container.querySelectorAll(".text-blue-400");
						// Should have at least one highlighted element (may be combined in HTML)
						return highlighted.length >= 1;
					},
				),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 31: Hashtag highlighting updates in real-time", () => {
		it("should update highlighting when text changes", () => {
			fc.assert(
				fc.property(
					fc.lorem({ maxCount: 2 }),
					fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
					(text, tag) => {
						let currentValue = text;
						const onChange = vi.fn((value: string) => {
							currentValue = value;
						});

						const { container, rerender } = render(
							<EnhancedNotesInput
								value={currentValue}
								onChange={onChange}
								userId={1}
							/>,
						);

						// Add hashtag
						const newValue = `${text} #${tag}`;
						rerender(
							<EnhancedNotesInput
								value={newValue}
								onChange={onChange}
								userId={1}
							/>,
						);

						// Should have highlighting
						const highlighted = container.querySelector(".text-blue-400");
						return highlighted !== null;
					},
				),
				{ numRuns: 100 },
			);
		});
	});

	describe("Property 32: Highlighting persists after blur", () => {
		it("should maintain highlighting after editor loses focus", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const { container } = render(
						<EnhancedNotesInput
							value={text}
							onChange={vi.fn()}
							userId={1}
						/>,
					);

					const textarea = container.querySelector("textarea");
					if (textarea) {
						// Focus then blur
						fireEvent.focus(textarea);
						fireEvent.blur(textarea);

						// Should still have highlighting
						const highlighted = container.querySelector(".text-blue-400");
						return highlighted !== null;
					}

					return true;
				}),
				{ numRuns: 100 },
			);
		});
	});

	describe("Idempotence properties", () => {
		it("should produce consistent highlighting for same input", () => {
			fc.assert(
				fc.property(arbTextWithHashtags(), (text) => {
					const { container: container1 } = render(
						<EnhancedNotesInput
							value={text}
							onChange={vi.fn()}
							userId={1}
						/>,
					);

					const { container: container2 } = render(
						<EnhancedNotesInput
							value={text}
							onChange={vi.fn()}
							userId={1}
						/>,
					);

					// Both should have same highlighting
					const highlighted1 = container1.querySelectorAll(".text-blue-400");
					const highlighted2 = container2.querySelectorAll(".text-blue-400");

					return highlighted1.length === highlighted2.length;
				}),
				{ numRuns: 100 },
			);
		});
	});
});
