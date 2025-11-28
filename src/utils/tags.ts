/**
 * Extract hashtags from text
 * Matches hashtags: #word, #word-word, #word_word
 * Must start with # followed by alphanumeric, hyphen, or underscore
 * Must end with space, punctuation, or end of string
 */
export function extractHashtags(text: string): string[] {
	// Regex to match hashtags
	const hashtagRegex = /#([a-zA-Z0-9_-]+)(?=\s|[.,!?;:]|$)/g;
	const matches = text.matchAll(hashtagRegex);
	const tags = Array.from(matches, (m) => m[1].toLowerCase());
	return [...new Set(tags)]; // Remove duplicates
}

/**
 * Normalize a tag (remove # if present, convert to lowercase, trim)
 */
export function normalizeTag(tag: string): string {
	return tag.replace(/^#/, "").toLowerCase().trim();
}

/**
 * Format a tag (ensure it starts with #)
 */
export function formatTag(tag: string): string {
	return tag.startsWith("#") ? tag : `#${tag}`;
}

/**
 * Check if a tag is valid
 */
export function isValidHashtag(tag: string): boolean {
	const validHashtagRegex = /^#[a-zA-Z0-9_-]+$/;
	return validHashtagRegex.test(tag);
}
