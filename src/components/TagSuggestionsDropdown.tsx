import { useEffect, useRef } from "react";
import type { TagSuggestion } from "@/server/tags";
import { Hash } from "lucide-react";

interface TagSuggestionsDropdownProps {
	suggestions: TagSuggestion[];
	selectedIndex: number;
	onSelect: (tag: string) => void;
	onClose: () => void;
	position: { top: number; left: number };
}

export function TagSuggestionsDropdown({
	suggestions,
	selectedIndex,
	onSelect,
	onClose,
	position,
}: TagSuggestionsDropdownProps) {
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	// Scroll selected item into view
	useEffect(() => {
		const selectedElement = dropdownRef.current?.querySelector(
			`[data-index="${selectedIndex}"]`,
		);
		if (selectedElement) {
			selectedElement.scrollIntoView({ block: "nearest" });
		}
	}, [selectedIndex]);

	if (suggestions.length === 0) return null;

	return (
		<div
			ref={dropdownRef}
			className="absolute z-50 mt-1 w-64 bg-zinc-800 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto"
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
			}}
		>
			<div className="p-2">
				<div className="text-xs text-white/40 px-2 py-1 mb-1">
					Tag suggestions
				</div>
				{suggestions.map((suggestion, index) => (
					<button
						key={suggestion.tag}
						data-index={index}
						type="button"
						onClick={() => onSelect(suggestion.tag)}
						className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
							index === selectedIndex
								? "bg-blue-600 text-white"
								: "text-white/80 hover:bg-white/5"
						}`}
					>
						<div className="flex items-center gap-2">
							<Hash className="w-4 h-4" />
							<span className="font-medium">{suggestion.tag}</span>
						</div>
						<span className="text-xs text-white/40">
							{suggestion.usageCount} use{suggestion.usageCount !== 1 ? "s" : ""}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}
