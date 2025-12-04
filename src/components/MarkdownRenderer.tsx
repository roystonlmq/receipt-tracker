import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface MarkdownRendererProps {
	content: string;
	onHashtagClick?: (hashtag: string) => void;
	className?: string;
}

/**
 * Renders markdown content with hashtag highlighting
 * Uses marked for parsing and dompurify for sanitization
 */
export function MarkdownRenderer({
	content,
	onHashtagClick,
	className = "",
}: MarkdownRendererProps) {
	const renderedContent = useMemo(() => {
		if (!content || !content.trim()) {
			return null;
		}

		try {
			// Configure marked for better rendering
			marked.setOptions({
				breaks: true, // Convert \n to <br>
				gfm: true, // GitHub Flavored Markdown
			});

			// Parse markdown to HTML
			const rawHtml = marked.parse(content) as string;

			// Sanitize HTML to prevent XSS
			const cleanHtml = DOMPurify.sanitize(rawHtml, {
				ALLOWED_TAGS: [
					"p",
					"br",
					"strong",
					"em",
					"u",
					"s",
					"code",
					"pre",
					"ul",
					"ol",
					"li",
					"h1",
					"h2",
					"h3",
					"h4",
					"h5",
					"h6",
					"blockquote",
					"a",
					"hr",
				],
				ALLOWED_ATTR: ["href", "title", "target", "rel"],
			});

			return cleanHtml;
		} catch (error) {
			console.error("Markdown parsing error:", error);
			// Fallback to plain text on error
			return content;
		}
	}, [content]);

	// Process the HTML to add hashtag highlighting and list styling
	const processedContent = useMemo(() => {
		if (!renderedContent) return null;

		// Create a temporary div to parse the HTML
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = renderedContent;

		// Process text nodes to add hashtag highlighting
		const processNode = (node: Node): Node => {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || "";
				const hashtagRegex = /(#[a-zA-Z0-9_-]+)/g;

				if (hashtagRegex.test(text)) {
					// Create a span to hold the processed content
					const span = document.createElement("span");
					let lastIndex = 0;

					for (const match of text.matchAll(hashtagRegex)) {
						// Add text before hashtag
						if (match.index !== undefined && match.index > lastIndex) {
							span.appendChild(
								document.createTextNode(text.slice(lastIndex, match.index)),
							);
						}

						// Add hashtag
						if (match.index !== undefined) {
							const hashtag = match[0];
							if (onHashtagClick) {
								// Create clickable button
								const button = document.createElement("button");
								button.type = "button";
								button.textContent = hashtag;
								button.className =
									"text-blue-400 font-semibold hover:text-blue-300 hover:underline transition-colors cursor-pointer";
								button.onclick = (e) => {
									e.stopPropagation();
									onHashtagClick(hashtag);
								};
								span.appendChild(button);
							} else {
								// Create styled span
								const hashtagSpan = document.createElement("span");
								hashtagSpan.textContent = hashtag;
								hashtagSpan.className = "text-blue-400 font-semibold";
								span.appendChild(hashtagSpan);
							}
							lastIndex = match.index + hashtag.length;
						}
					}

					// Add remaining text
					if (lastIndex < text.length) {
						span.appendChild(document.createTextNode(text.slice(lastIndex)));
					}

					return span;
				}
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				// Process child nodes
				const element = node as Element;
				const newElement = element.cloneNode(false) as Element;

				// Add list styling to ul and ol elements
				if (element.tagName === 'UL') {
					newElement.setAttribute('style', 'list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;');
				} else if (element.tagName === 'OL') {
					newElement.setAttribute('style', 'list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0;');
				} else if (element.tagName === 'LI') {
					newElement.setAttribute('style', 'display: list-item; margin: 0.25rem 0;');
				}

				for (const child of Array.from(element.childNodes)) {
					newElement.appendChild(processNode(child));
				}

				return newElement;
			}

			return node.cloneNode(true);
		};

		// Process all child nodes
		const processedDiv = document.createElement("div");
		for (const child of Array.from(tempDiv.childNodes)) {
			processedDiv.appendChild(processNode(child));
		}

		return processedDiv.innerHTML;
	}, [renderedContent, onHashtagClick]);

	if (!processedContent) {
		return <div className={className}>No content</div>;
	}

	return (
		<div
			className={`text-sm text-white/90 leading-relaxed ${className}`}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify
			dangerouslySetInnerHTML={{ __html: processedContent }}
		/>
	);
}
