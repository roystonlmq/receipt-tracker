import { useEffect, useRef, useMemo } from "react";

interface HighlightedTextareaProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
	className?: string;
	textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
	autoFocus?: boolean;
}

/**
 * Textarea with real-time hashtag highlighting overlay
 * Synchronizes scroll and displays highlighted hashtags behind the text
 */
export function HighlightedTextarea({
	value,
	onChange,
	onKeyDown,
	placeholder = "",
	className = "",
	textareaRef: externalRef,
	autoFocus = false,
}: HighlightedTextareaProps) {
	const internalRef = useRef<HTMLTextAreaElement>(null);
	const textareaRef = externalRef || internalRef;
	const overlayRef = useRef<HTMLDivElement>(null);

	// Synchronize scroll between textarea and overlay
	const handleScroll = () => {
		if (textareaRef.current && overlayRef.current) {
			overlayRef.current.scrollTop = textareaRef.current.scrollTop;
			overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
		}
	};

	// Generate highlighted HTML for overlay
	const highlightedHtml = useMemo(() => {
		if (!value) return "";

		// Escape HTML to prevent XSS
		const escapeHtml = (text: string) =>
			text
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");

		// Replace hashtags with highlighted spans
		const hashtagRegex = /(#[a-zA-Z0-9_-]+)/g;
		const escaped = escapeHtml(value);
		
		return escaped.replace(
			hashtagRegex,
			'<span class="text-blue-400 font-semibold">$1</span>',
		);
	}, [value]);

	// Auto-focus on mount if requested
	useEffect(() => {
		if (autoFocus && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [autoFocus, textareaRef]);

	return (
		<div className="relative w-full h-full">
			{/* Highlighted overlay - positioned behind textarea */}
			<div
				ref={overlayRef}
				className={`absolute inset-0 p-3 overflow-hidden pointer-events-none whitespace-pre-wrap break-words font-mono text-transparent ${className}`}
				style={{
					lineHeight: "1.5",
					fontSize: "inherit",
					fontFamily: "inherit",
				}}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Content is escaped
				dangerouslySetInnerHTML={{ __html: highlightedHtml }}
			/>

			{/* Actual textarea - transparent text to show overlay behind */}
			<textarea
				ref={textareaRef}
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				onScroll={handleScroll}
				placeholder={placeholder}
				className={`relative w-full h-full p-3 bg-transparent border-0 text-white/90 placeholder-white/40 focus:outline-none resize-none caret-white ${className}`}
				style={{
					lineHeight: "1.5",
					background: "transparent",
				}}
			/>
		</div>
	);
}
