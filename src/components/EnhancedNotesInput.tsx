import { useState, useEffect, useRef, useCallback } from "react";
import { getTagSuggestions } from "@/server/tags";
import type { TagSuggestion } from "@/server/tags";
import { Hash } from "lucide-react";

interface EnhancedNotesInputProps {
	value: string;
	onChange: (value: string) => void;
	userId: number;
	placeholder?: string;
	className?: string;
}

export function EnhancedNotesInput({
	value,
	onChange,
	userId,
	placeholder = "Add notes... Use #tags to organize",
	className = "",
}: EnhancedNotesInputProps) {
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [currentHashtag, setCurrentHashtag] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Detect # character and fetch suggestions
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = e.target.value;
			onChange(newValue);

			// Get cursor position
			const cursorPosition = e.target.selectionStart;
			const textBeforeCursor = newValue.slice(0, cursorPosition);

			// Check if we're typing a hashtag
			const hashtagMatch = textBeforeCursor.match(/#([a-zA-Z0-9_-]*)$/);

			if (hashtagMatch) {
				const query = hashtagMatch[1];
				setCurrentHashtag(query);

				// Debounce the suggestions fetch
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
				}

				debounceTimerRef.current = setTimeout(async () => {
					try {
						const results = await getTagSuggestions({
							data: { userId, query },
						});
						setSuggestions(results);
						setShowSuggestions(results.length > 0);
						setSelectedIndex(0);
					} catch (error) {
						console.error("Failed to fetch tag suggestions:", error);
						setSuggestions([]);
						setShowSuggestions(false);
					}
				}, 100);
			} else {
				setShowSuggestions(false);
				setCurrentHashtag(null);
				setSuggestions([]);
			}
		},
		[onChange, userId],
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (!showSuggestions || suggestions.length === 0) return;

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setSelectedIndex((prev) =>
						prev < suggestions.length - 1 ? prev + 1 : prev,
					);
					break;

				case "ArrowUp":
					e.preventDefault();
					setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
					break;

				case "Tab":
				case "Enter":
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						insertSelectedTag();
					} else if (e.key === "Tab") {
						e.preventDefault();
						insertSelectedTag();
					}
					break;

				case "Escape":
					e.preventDefault();
					setShowSuggestions(false);
					break;
			}
		},
		[showSuggestions, suggestions, selectedIndex],
	);

	// Insert selected tag at cursor position
	const insertSelectedTag = useCallback(() => {
		if (!textareaRef.current || suggestions.length === 0) return;

		const textarea = textareaRef.current;
		const cursorPosition = textarea.selectionStart;
		const textBeforeCursor = value.slice(0, cursorPosition);
		const textAfterCursor = value.slice(cursorPosition);

		// Find the # position
		const hashPosition = textBeforeCursor.lastIndexOf("#");
		if (hashPosition === -1) return;

		// Replace from # to cursor with the selected tag
		const selectedTag = suggestions[selectedIndex].tag;
		const newValue =
			value.slice(0, hashPosition) + `#${selectedTag} ` + textAfterCursor;

		onChange(newValue);
		setShowSuggestions(false);

		// Set cursor position after the inserted tag
		setTimeout(() => {
			const newCursorPosition = hashPosition + selectedTag.length + 2; // +2 for # and space
			textarea.setSelectionRange(newCursorPosition, newCursorPosition);
			textarea.focus();
		}, 0);
	}, [value, suggestions, selectedIndex, onChange]);

	// Handle tag selection from dropdown
	const handleSelectTag = useCallback(
		(tag: string) => {
			if (!textareaRef.current) return;

			const textarea = textareaRef.current;
			const cursorPosition = textarea.selectionStart;
			const textBeforeCursor = value.slice(0, cursorPosition);
			const textAfterCursor = value.slice(cursorPosition);

			// Find the # position
			const hashPosition = textBeforeCursor.lastIndexOf("#");
			if (hashPosition === -1) return;

			// Replace from # to cursor with the selected tag
			const newValue =
				value.slice(0, hashPosition) + `#${tag} ` + textAfterCursor;

			onChange(newValue);
			setShowSuggestions(false);

			// Set cursor position after the inserted tag
			setTimeout(() => {
				const newCursorPosition = hashPosition + tag.length + 2; // +2 for # and space
				textarea.setSelectionRange(newCursorPosition, newCursorPosition);
				textarea.focus();
			}, 0);
		},
		[value, onChange],
	);

	// Cleanup debounce timer
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	return (
		<div className="relative">
			{/* Actual textarea */}
			<textarea
				ref={textareaRef}
				value={value}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className={`w-full min-h-[120px] p-3 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y ${className}`}
			/>

			{/* Tag suggestions dropdown - positioned relative to textarea */}
			{showSuggestions && suggestions.length > 0 && (
				<div className="relative">
					<div className="absolute left-0 top-1 z-50 w-64 bg-zinc-800 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
						<div className="p-2">
							<div className="text-xs text-white/40 px-2 py-1 mb-1 flex items-center justify-between">
								<span>Tag suggestions</span>
								<span className="text-white/60">
									<kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
										Tab
									</kbd>{" "}
									to select
								</span>
							</div>
							{suggestions.map((suggestion, index) => (
								<button
									key={suggestion.tag}
									data-index={index}
									type="button"
									onClick={() => handleSelectTag(suggestion.tag)}
									className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
										index === selectedIndex
											? "bg-blue-600 text-white"
											: "text-white/80 hover:bg-white/5"
									}`}
								>
									<div className="flex items-center gap-2">
										<span className="text-blue-400">#</span>
										<span className="font-medium">{suggestion.tag}</span>
									</div>
									<span className="text-xs text-white/40">
										{suggestion.usageCount} use
										{suggestion.usageCount !== 1 ? "s" : ""}
									</span>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
