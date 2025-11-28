import type React from "react";

/**
 * Highlight hashtags in text by wrapping them in styled spans
 * Returns an array of React nodes (text and styled hashtag spans)
 */
export function highlightHashtags(text: string): React.ReactNode[] {
	const parts: React.ReactNode[] = [];
	const hashtagRegex = /(#[a-zA-Z0-9_-]+)/g;
	let lastIndex = 0;

	for (const match of text.matchAll(hashtagRegex)) {
		// Add text before hashtag
		if (match.index !== undefined && match.index > lastIndex) {
			parts.push(text.slice(lastIndex, match.index));
		}

		// Add styled hashtag
		if (match.index !== undefined) {
			parts.push(
				<span
					key={`hashtag-${match.index}`}
					className="text-blue-400 font-semibold"
				>
					{match[0]}
				</span>,
			);
			lastIndex = match.index + match[0].length;
		}
	}

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}

	return parts;
}
