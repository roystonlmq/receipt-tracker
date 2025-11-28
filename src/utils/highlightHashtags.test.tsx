import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { highlightHashtags } from "./highlightHashtags";

describe("highlightHashtags", () => {
	it("should return plain text when no hashtags", () => {
		const result = highlightHashtags("This is plain text");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("This is plain text");
	});

	it("should highlight single hashtag", () => {
		const result = highlightHashtags("This is #test");
		const { container } = render(<div>{result}</div>);

		expect(container.textContent).toBe("This is #test");
		const hashtag = container.querySelector(".text-blue-400");
		expect(hashtag).toBeTruthy();
		expect(hashtag?.textContent).toBe("#test");
	});

	it("should highlight multiple hashtags", () => {
		const result = highlightHashtags("This is #test and #example");
		const { container } = render(<div>{result}</div>);

		expect(container.textContent).toBe("This is #test and #example");
		const hashtags = container.querySelectorAll(".text-blue-400");
		expect(hashtags).toHaveLength(2);
		expect(hashtags[0].textContent).toBe("#test");
		expect(hashtags[1].textContent).toBe("#example");
	});

	it("should handle hashtags with hyphens and underscores", () => {
		const result = highlightHashtags("#project-alpha and #john_doe");
		const { container } = render(<div>{result}</div>);

		const hashtags = container.querySelectorAll(".text-blue-400");
		expect(hashtags).toHaveLength(2);
		expect(hashtags[0].textContent).toBe("#project-alpha");
		expect(hashtags[1].textContent).toBe("#john_doe");
	});

	it("should handle hashtag at start of text", () => {
		const result = highlightHashtags("#test is here");
		const { container } = render(<div>{result}</div>);

		expect(container.textContent).toBe("#test is here");
		const hashtag = container.querySelector(".text-blue-400");
		expect(hashtag?.textContent).toBe("#test");
	});

	it("should handle hashtag at end of text", () => {
		const result = highlightHashtags("This is #test");
		const { container } = render(<div>{result}</div>);

		expect(container.textContent).toBe("This is #test");
		const hashtag = container.querySelector(".text-blue-400");
		expect(hashtag?.textContent).toBe("#test");
	});

	it("should handle consecutive hashtags", () => {
		const result = highlightHashtags("#tag1 #tag2 #tag3");
		const { container } = render(<div>{result}</div>);

		const hashtags = container.querySelectorAll(".text-blue-400");
		expect(hashtags).toHaveLength(3);
	});

	it("should preserve text between hashtags", () => {
		const result = highlightHashtags("Start #middle end");
		const { container } = render(<div>{result}</div>);

		expect(container.textContent).toBe("Start #middle end");
	});

	it("should handle long text with multiple hashtags", () => {
		const longText =
			"This is a long text with #tag1 and some more text #tag2 and even more #tag3";
		const result = highlightHashtags(longText);
		const { container } = render(<div>{result}</div>);

		expect(container.textContent).toBe(longText);
		const hashtags = container.querySelectorAll(".text-blue-400");
		expect(hashtags).toHaveLength(3);
	});
});
