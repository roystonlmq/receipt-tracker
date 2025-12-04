import { useState, useRef, useEffect } from "react";
import { StickyNote, Trash2, Edit2, Check } from "lucide-react";
import type { Screenshot } from "@/types/screenshot";
import { highlightHashtagsClickable } from "@/utils/highlightHashtags";
import { toggleDownloadStatus } from "@/server/screenshots";
import { useToast } from "@/hooks/useToast";

interface ScreenshotCardProps {
	screenshot: Screenshot;
	isSelected: boolean;
	onSelect: (id: number) => void;
	onRename: (id: number, newName: string) => void;
	onDelete: (id: number) => void;
	onView: (id: number) => void;
	onHashtagClick?: (hashtag: string) => void;
	onUpdate?: (updatedScreenshot: Screenshot) => void;
	selectionMode: boolean;
}

export function ScreenshotCard({
	screenshot,
	isSelected,
	onSelect,
	onView,
	onRename,
	onDelete,
	onHashtagClick,
	onUpdate,
	selectionMode,
}: ScreenshotCardProps) {
	const [isRenaming, setIsRenaming] = useState(false);
	const [newName, setNewName] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const toast = useToast();

	useEffect(() => {
		if (isRenaming && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isRenaming]);

	const handleClick = () => {
		// In selection mode, clicking toggles selection
		// Otherwise, clicking views the screenshot
		if (selectionMode) {
			onSelect(screenshot.id);
		} else {
			onView(screenshot.id);
		}
	};

	const handleCheckboxClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onSelect(screenshot.id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (isRenaming) return;

		if (e.key === "Enter") {
			onView(screenshot.id);
		} else if (e.key === "F2") {
			startRename();
		} else if (e.key === "Delete") {
			onDelete(screenshot.id);
		}
	};

	const startRename = () => {
		// Extract just the name part without extension
		const nameMatch = screenshot.filename.match(/\d{6} - \d{4} - (.+)\.png$/i);
		const currentName = nameMatch
			? nameMatch[1]
			: screenshot.filename.replace(/\.png$/i, "");
		setNewName(currentName);
		setIsRenaming(true);
	};

	const handleRenameSubmit = () => {
		if (newName.trim()) {
			onRename(screenshot.id, newName.trim());
		}
		setIsRenaming(false);
	};

	const handleRenameCancel = () => {
		setIsRenaming(false);
		setNewName("");
	};

	const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleRenameSubmit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			handleRenameCancel();
		}
	};

	const handleToggleDownloadStatus = async (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();

		try {
			const result = await toggleDownloadStatus({
				data: {
					id: screenshot.id,
					userId: screenshot.userId,
					downloaded: !screenshot.downloaded,
				},
			});

			if (result.success && result.screenshot && onUpdate) {
				onUpdate(result.screenshot);
				toast.success(
					result.screenshot.downloaded
						? "Marked as downloaded"
						: "Unmarked as downloaded",
					2000,
				);
			}
		} catch (error) {
			console.error("Failed to toggle download status:", error);
			toast.error("Failed to update download status", 3000);
		}
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
		<>
			<div
				className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
					isSelected
						? "border-blue-500 ring-2 ring-blue-500/50"
						: "border-white/10 hover:border-white/30"
				}`}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				tabIndex={0}
			>
			{/* Thumbnail */}
			<div className="aspect-video bg-black/30 flex items-center justify-center overflow-hidden relative">
				<img
					src={screenshot.imageData}
					alt={screenshot.filename}
					className="w-full h-full object-cover"
				/>
				
				{/* Download status checkmark - positioned in top-right of thumbnail */}
				{screenshot.downloaded && (
					<button
						type="button"
						onClick={handleToggleDownloadStatus}
						className="absolute top-2 right-2 p-1.5 bg-green-600/90 hover:bg-green-700 rounded-full transition-colors shadow-lg"
						title="Downloaded (click to unmark)"
					>
						<Check className="w-3.5 h-3.5 text-white" />
					</button>
				)}
			</div>

			{/* Checkbox - always visible in selection mode, shown on hover otherwise */}
			<div
				className={`absolute top-2 left-2 ${selectionMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
			>
				<label
					className="flex items-center justify-center w-6 h-6 bg-black/70 hover:bg-black/90 rounded-md cursor-pointer transition-all"
					onClick={handleCheckboxClick}
				>
					<input
						type="checkbox"
						checked={isSelected}
						onChange={() => {}}
						className="sr-only"
					/>
					<div className={`relative w-4 h-4 border-2 rounded transition-all duration-200 ${
						isSelected 
							? "bg-blue-500 border-blue-500 scale-110" 
							: "border-white/60 scale-100"
					}`}>
						{isSelected && (
							<svg
								className="absolute inset-0 w-full h-full text-white animate-in fade-in zoom-in duration-200"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								viewBox="0 0 24 24"
							>
								<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						)}
					</div>
				</label>
			</div>

			{/* Action buttons - shown on hover (only when not in selection mode) */}
			{!selectionMode && (
				<div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							startRename();
						}}
						className="p-1.5 bg-black/70 hover:bg-black/90 rounded-md transition-colors"
						title="Rename (F2)"
					>
						<Edit2 className="w-3.5 h-3.5 text-white" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(screenshot.id);
						}}
						className="p-1.5 bg-black/70 hover:bg-red-600 rounded-md transition-colors"
						title="Delete (Del)"
					>
						<Trash2 className="w-3.5 h-3.5 text-white" />
					</button>
				</div>
			)}

			{/* Info overlay */}
			<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
				{isRenaming ? (
					<div
						className="flex items-center gap-2"
						onClick={(e) => e.stopPropagation()}
					>
						<input
							ref={inputRef}
							type="text"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={handleRenameKeyDown}
							onBlur={handleRenameSubmit}
							className="flex-1 px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter name..."
						/>
					</div>
				) : (
					<div className="space-y-1">
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

						{/* Notes preview with clickable hashtags */}
						{screenshot.notes && onHashtagClick && (
							<div
								className="text-xs text-white/80 line-clamp-2"
								onClick={(e) => e.stopPropagation()}
							>
								{highlightHashtagsClickable(screenshot.notes, onHashtagClick)}
							</div>
						)}
					</div>
				)}
			</div>
			</div>
		</>
	);
}
