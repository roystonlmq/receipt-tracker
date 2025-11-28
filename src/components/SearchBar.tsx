import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
	onSearch: (query: string) => void;
	placeholder?: string;
	resultsCount?: number;
}

export function SearchBar({
	onSearch,
	placeholder = "Search screenshots...",
	resultsCount,
}: SearchBarProps) {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// Debounce search input (500ms delay)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, 500);

		return () => clearTimeout(timer);
	}, [query]);

	// Trigger search when debounced query changes
	useEffect(() => {
		onSearch(debouncedQuery);
	}, [debouncedQuery, onSearch]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl+K or / to focus search (unless already in an input)
			if (
				((e.ctrlKey || e.metaKey) && e.key === "k") ||
				(e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement))
			) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleClear = useCallback(() => {
		setQuery("");
		setDebouncedQuery("");
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	return (
		<div className="w-full space-y-2">
			{/* Search input */}
			<div className="relative">
				<div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
					<Search className="w-5 h-5 text-white/40" />
				</div>

				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={handleChange}
					placeholder={placeholder}
					className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-32 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
				/>

				{/* Keyboard shortcut hint - only show when not focused and no query */}
				{!query && (
					<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-white/40 pointer-events-none">
						<kbd className="px-2 py-1 bg-white/10 rounded text-white/60">Ctrl+K</kbd>
						<span>or</span>
						<kbd className="px-2 py-1 bg-white/10 rounded text-white/60">/</kbd>
					</div>
				)}

				{query && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
						aria-label="Clear search"
					>
						<X className="w-5 h-5" />
					</button>
				)}
			</div>

			{/* Results count */}
			{query && resultsCount !== undefined && (
				<div className="text-sm text-white/60">
					{resultsCount === 0 ? (
						<span>No results found</span>
					) : (
						<span>
							{resultsCount} {resultsCount === 1 ? "result" : "results"} found
						</span>
					)}
				</div>
			)}
		</div>
	);
}
