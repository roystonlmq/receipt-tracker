import { useState, useEffect, useCallback } from "react";
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
					type="text"
					value={query}
					onChange={handleChange}
					placeholder={placeholder}
					className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
				/>

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
