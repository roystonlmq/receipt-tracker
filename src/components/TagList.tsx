import { useState, useEffect } from "react";
import { getUserTags } from "@/server/tags";
import type { TagStatistics } from "@/server/tags";
import { Hash, TrendingUp, Clock, AlertCircle } from "lucide-react";

interface TagListProps {
	userId: number;
	onTagClick: (tag: string) => void;
}

export function TagList({ userId, onTagClick }: TagListProps) {
	const [tags, setTags] = useState<TagStatistics[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<"usage" | "alphabetical" | "recent">(
		"usage",
	);

	useEffect(() => {
		loadTags();
	}, [userId, sortBy]);

	const loadTags = async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await getUserTags({ data: { userId, sortBy } });
			setTags(result);
		} catch (err) {
			console.error("Failed to load tags:", err);
			setError("Failed to load tags");
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-white/60">Loading tags...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-red-400 flex items-center gap-2">
					<AlertCircle className="w-5 h-5" />
					<span>{error}</span>
				</div>
			</div>
		);
	}

	if (tags.length === 0) {
		return (
			<div className="text-center py-8">
				<Hash className="w-12 h-12 text-white/20 mx-auto mb-3" />
				<p className="text-white/60">No tags yet</p>
				<p className="text-white/40 text-sm mt-1">
					Start using hashtags in your notes to organize screenshots
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Sort controls */}
			<div className="flex items-center gap-2">
				<span className="text-sm text-white/60">Sort by:</span>
				<div className="flex gap-1">
					<button
						type="button"
						onClick={() => setSortBy("usage")}
						className={`px-3 py-1 text-sm rounded-md transition-colors ${
							sortBy === "usage"
								? "bg-blue-600 text-white"
								: "bg-white/5 text-white/60 hover:bg-white/10"
						}`}
					>
						<TrendingUp className="w-3 h-3 inline mr-1" />
						Usage
					</button>
					<button
						type="button"
						onClick={() => setSortBy("recent")}
						className={`px-3 py-1 text-sm rounded-md transition-colors ${
							sortBy === "recent"
								? "bg-blue-600 text-white"
								: "bg-white/5 text-white/60 hover:bg-white/10"
						}`}
					>
						<Clock className="w-3 h-3 inline mr-1" />
						Recent
					</button>
					<button
						type="button"
						onClick={() => setSortBy("alphabetical")}
						className={`px-3 py-1 text-sm rounded-md transition-colors ${
							sortBy === "alphabetical"
								? "bg-blue-600 text-white"
								: "bg-white/5 text-white/60 hover:bg-white/10"
						}`}
					>
						A-Z
					</button>
				</div>
			</div>

			{/* Tags list */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{tags.map((tag) => (
					<button
						key={tag.tag}
						type="button"
						onClick={() => onTagClick(`#${tag.tag}`)}
						className={`p-4 rounded-lg border transition-colors text-left ${
							tag.isInactive
								? "bg-white/5 border-white/10 hover:bg-white/10"
								: "bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/20"
						}`}
					>
						<div className="flex items-start justify-between mb-2">
							<div className="flex items-center gap-2">
								<Hash className="w-4 h-4 text-blue-400" />
								<span className="font-semibold text-white">#{tag.tag}</span>
							</div>
							{tag.isInactive && (
								<span className="text-xs text-white/40">Inactive</span>
							)}
						</div>
						<div className="space-y-1 text-xs text-white/60">
							<div>
								{tag.usageCount} screenshot{tag.usageCount !== 1 ? "s" : ""}
							</div>
							<div>Last used: {formatDate(tag.lastUsed)}</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
