import { StickyNote } from "lucide-react";
import type { Screenshot } from "@/types/screenshot";
import { formatFolderDate } from "@/utils/filename";

interface ScreenshotCardProps {
	screenshot: Screenshot;
	isSelected: boolean;
	onSelect: (id: number) => void;
	onRename: (id: number, newName: string) => void;
	onDelete: (id: number) => void;
	onView: (id: number) => void;
}

export function ScreenshotCard({
	screenshot,
	isSelected,
	onSelect,
	onView,
}: ScreenshotCardProps) {
	const handleClick = () => {
		onSelect(screenshot.id);
	};

	const handleDoubleClick = () => {
		onView(screenshot.id);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div
			className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
				isSelected
					? "border-blue-500 ring-2 ring-blue-500/50"
					: "border-white/10 hover:border-white/30"
			}`}
			onClick={handleClick}
			onDoubleClick={handleDoubleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter") handleDoubleClick();
			}}
		>
			{/* Thumbnail */}
			<div className="aspect-video bg-black/30 flex items-center justify-center overflow-hidden">
				<img
					src={screenshot.imageData}
					alt={screenshot.filename}
					className="w-full h-full object-cover"
				/>
			</div>

			{/* Info overlay */}
			<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-white truncate">
							{screenshot.filename}
						</p>
						<p className="text-xs text-white/60">
							{formatDate(screenshot.uploadDate)}
						</p>
					</div>

					{/* Notes indicator */}
					{screenshot.notes && (
						<div className="flex-shrink-0">
							<StickyNote className="w-4 h-4 text-yellow-400" />
						</div>
					)}
				</div>
			</div>

			{/* Selection indicator */}
			{isSelected && (
				<div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
					<svg
						className="w-4 h-4 text-white"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path d="M5 13l4 4L19 7" />
					</svg>
				</div>
			)}
		</div>
	);
}
