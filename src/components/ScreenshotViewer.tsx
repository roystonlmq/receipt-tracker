import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Save } from "lucide-react";
import type { Screenshot } from "@/types/screenshot";
import { updateScreenshotNotes, downloadScreenshotWithNotes } from "@/server/screenshots";

interface ScreenshotViewerProps {
	screenshot: Screenshot;
	allScreenshots?: Screenshot[];
	onClose: () => void;
	onNavigate?: (direction: "prev" | "next") => void;
	onUpdate?: (updatedScreenshot: Screenshot) => void;
}

export function ScreenshotViewer({
	screenshot,
	allScreenshots = [],
	onClose,
	onNavigate,
	onUpdate,
}: ScreenshotViewerProps) {
	const [notes, setNotes] = useState(screenshot.notes || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Update notes when screenshot changes
	useEffect(() => {
		setNotes(screenshot.notes || "");
	}, [screenshot.id, screenshot.notes]);

	// Handle ESC key to close
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowLeft" && onNavigate) {
				onNavigate("prev");
			} else if (e.key === "ArrowRight" && onNavigate) {
				onNavigate("next");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, onNavigate]);

	// Determine if navigation is available
	const currentIndex = allScreenshots.findIndex((s) => s.id === screenshot.id);
	const hasPrev = currentIndex > 0;
	const hasNext = currentIndex >= 0 && currentIndex < allScreenshots.length - 1;

	const handleSaveNotes = async () => {
		setIsSaving(true);
		setSaveSuccess(false);

		try {
			// Save to server
			await updateScreenshotNotes({
				data: {
					id: screenshot.id,
					userId: screenshot.userId,
					notes,
				},
			});

			// Update was successful - show success state
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 2000);

			// Optimistically update the parent with the new notes
			if (onUpdate) {
				onUpdate({
					...screenshot,
					notes,
					updatedAt: new Date(), // Update the timestamp
				});
			}
		} catch (error) {
			console.error("Failed to save notes:", error);
			alert("Failed to save notes. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDownload = async () => {
		setIsDownloading(true);

		try {
			// Get screenshot with notes
			const result = await downloadScreenshotWithNotes({
				data: {
					id: screenshot.id,
					userId: screenshot.userId,
				},
			});

			if (result.success && result.screenshot) {
				// Download image
				const imageLink = document.createElement("a");
				imageLink.href = result.screenshot.imageData;
				imageLink.download = result.screenshot.filename;
				document.body.appendChild(imageLink);
				imageLink.click();
				document.body.removeChild(imageLink);

				// Download notes if they exist
				if (result.screenshot.notes && result.screenshot.notes.trim()) {
					const notesBlob = new Blob([result.screenshot.notes], {
						type: "text/plain",
					});
					const notesUrl = URL.createObjectURL(notesBlob);
					const notesLink = document.createElement("a");
					notesLink.href = notesUrl;
					notesLink.download = result.screenshot.notesFilename;
					document.body.appendChild(notesLink);
					notesLink.click();
					document.body.removeChild(notesLink);
					URL.revokeObjectURL(notesUrl);
				}
			}
		} catch (error) {
			console.error("Failed to download:", error);
			alert("Failed to download screenshot. Please try again.");
		} finally {
			setIsDownloading(false);
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		// Only close if clicking the backdrop itself, not the image or notes panel
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={handleBackdropClick}>
			{/* Keyboard shortcuts hint - moved to bottom left */}
			<div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 flex items-center gap-4">
				<span className="flex items-center gap-1">
					<kbd className="px-2 py-1 bg-white/10 rounded text-white/80">ESC</kbd>
					Close
				</span>
				{hasPrev && (
					<span className="flex items-center gap-1">
						<kbd className="px-2 py-1 bg-white/10 rounded text-white/80">←</kbd>
						Previous
					</span>
				)}
				{hasNext && (
					<span className="flex items-center gap-1">
						<kbd className="px-2 py-1 bg-white/10 rounded text-white/80">→</kbd>
						Next
					</span>
				)}
			</div>

			{/* Header */}
			<div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
				<div className="flex-1 min-w-0">
					<h2 className="text-lg font-semibold text-white truncate">
						{screenshot.filename}
					</h2>
					<div className="flex items-center gap-4 text-sm text-white/60 mt-1">
						<span>Uploaded: {formatDate(screenshot.uploadDate)}</span>
						<span>Size: {formatFileSize(screenshot.fileSize)}</span>
					</div>
				</div>

				<div className="flex items-center gap-2 ml-4">
					{/* Download button */}
					<button
						type="button"
						onClick={handleDownload}
						disabled={isDownloading}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
					>
						<Download className="w-4 h-4" />
						{isDownloading ? "Downloading..." : "Download"}
					</button>

					{/* Close button */}
					<button
						type="button"
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					>
						<X className="w-6 h-6 text-white" />
					</button>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Image viewer */}
				<div className="flex-1 flex items-center justify-center p-8 relative" onClick={(e) => e.stopPropagation()}>
					{/* Navigation buttons */}
					{hasPrev && onNavigate && (
						<button
							type="button"
							onClick={() => onNavigate("prev")}
							className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
						>
							<ChevronLeft className="w-6 h-6 text-white" />
						</button>
					)}

					{hasNext && onNavigate && (
						<button
							type="button"
							onClick={() => onNavigate("next")}
							className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
						>
							<ChevronRight className="w-6 h-6 text-white" />
						</button>
					)}

					{/* Full-resolution image */}
					<img
						src={screenshot.imageData}
						alt={screenshot.filename}
						className="max-w-full max-h-full object-contain"
					/>
				</div>

				{/* Notes panel */}
				<div className="w-96 bg-black/50 border-l border-white/10 flex flex-col">
					<div className="p-4 border-b border-white/10">
						<h3 className="text-lg font-semibold text-white">Notes</h3>
					</div>

					<div className="flex-1 p-4">
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Add notes about this screenshot..."
							className="w-full h-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="p-4 border-t border-white/10">
						<button
							type="button"
							onClick={handleSaveNotes}
							disabled={isSaving || notes === (screenshot.notes || "")}
							className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors"
						>
							<Save className="w-4 h-4" />
							{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Notes"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
