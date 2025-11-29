import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Save, Sparkles } from "lucide-react";
import type { Screenshot } from "@/types/screenshot";
import { updateScreenshotNotes, downloadScreenshotWithNotes } from "@/server/screenshots";
import { downloadFile } from "@/utils/fileSystem";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EnhancedNotesInput } from "@/components/EnhancedNotesInput";
import { MarkdownNotes } from "@/components/MarkdownNotes";
import { TagHintBanner } from "@/components/TagHintBanner";
import { KeyboardHint } from "@/components/KeyboardHint";
import { generateNotesWithAI, checkAIAvailability } from "@/server/ai";

interface ScreenshotViewerProps {
	screenshot: Screenshot;
	allScreenshots?: Screenshot[];
	onClose: () => void;
	onNavigate?: (direction: "prev" | "next") => void;
	onUpdate?: (updatedScreenshot: Screenshot) => void;
	onHashtagClick?: (hashtag: string) => void;
}

export function ScreenshotViewer({
	screenshot,
	allScreenshots = [],
	onClose,
	onNavigate,
	onUpdate,
	onHashtagClick,
}: ScreenshotViewerProps) {
	const [notes, setNotes] = useState(screenshot.notes || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isGeneratingAI, setIsGeneratingAI] = useState(false);
	const [aiAvailable, setAiAvailable] = useState(false);
	const [showDiscardDialog, setShowDiscardDialog] = useState(false);
	const [pendingAction, setPendingAction] = useState<"close" | "cancel" | null>(null);
	const toast = useToast();

	// Check AI availability on mount
	useEffect(() => {
		checkAIAvailability({ data: undefined })
			.then((result) => setAiAvailable(result.available))
			.catch(() => setAiAvailable(false));
	}, []);

	// Update notes when screenshot changes
	useEffect(() => {
		setNotes(screenshot.notes || "");
	}, [screenshot.id, screenshot.notes]);

	const hasUnsavedChanges = () => notes !== (screenshot.notes || "");

	const handleCancelEdit = () => {
		if (hasUnsavedChanges()) {
			setPendingAction("cancel");
			setShowDiscardDialog(true);
		} else {
			// No unsaved changes, just exit edit mode
			setIsEditMode(false);
			setNotes(screenshot.notes || "");
		}
	};

	const handleClose = () => {
		if (isEditMode && hasUnsavedChanges()) {
			setPendingAction("close");
			setShowDiscardDialog(true);
		} else {
			onClose();
		}
	};

	const handleDiscardConfirm = () => {
		setShowDiscardDialog(false);
		
		if (pendingAction === "close") {
			onClose();
		} else if (pendingAction === "cancel") {
			setIsEditMode(false);
			setNotes(screenshot.notes || "");
		}
		
		setPendingAction(null);
	};

	const handleDiscardCancel = () => {
		setShowDiscardDialog(false);
		setPendingAction(null);
	};

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't handle shortcuts if user is typing in textarea
			const isTyping = document.activeElement?.tagName === "TEXTAREA";
			
			if (e.key === "Escape") {
				e.preventDefault();
				if (isEditMode) {
					// Exit edit mode with confirmation if there are unsaved changes
					handleCancelEdit();
				} else {
					// Close viewer with confirmation if there are unsaved changes
					handleClose();
				}
			} else if (e.key === "ArrowLeft" && onNavigate && !isTyping) {
				onNavigate("prev");
			} else if (e.key === "ArrowRight" && onNavigate && !isTyping) {
				onNavigate("next");
			} else if (e.key.toLowerCase() === "e" && !isTyping && !e.ctrlKey && !e.metaKey && !isEditMode) {
				// Press 'E' to enter edit mode
				e.preventDefault();
				setIsEditMode(true);
			} else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				// Ctrl+S (Windows/Linux) or Cmd+S (Mac) to save notes
				e.preventDefault(); // Prevent browser save dialog
				if (isEditMode && notes !== (screenshot.notes || "")) {
					handleSaveNotes();
				}
			} else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
				// Ctrl+D (Windows/Linux) or Cmd+D (Mac) to download
				e.preventDefault(); // Prevent browser bookmark dialog
				if (!isDownloading) {
					handleDownload();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, onNavigate, notes, screenshot.notes, isDownloading, isEditMode]);

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
			toast.success("Notes saved successfully!");
			
			// Exit edit mode after successful save
			setIsEditMode(false);

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

			// Handle specific error cases
			if (error instanceof Error) {
				if (error.message.includes("network")) {
					toast.error(
						"Network error. Please check your connection and try again.",
						7000,
					);
				} else if (error.message.includes("access denied")) {
					toast.error(
						"You don't have permission to edit this screenshot.",
						7000,
					);
				} else {
					toast.error(`Failed to save notes: ${error.message}`, 7000);
				}
			} else {
				toast.error("Failed to save notes. Please try again.", 5000);
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleGenerateWithAI = async () => {
		setIsGeneratingAI(true);

		try {
			const result = await generateNotesWithAI({
				data: {
					screenshotId: screenshot.id,
					userId: screenshot.userId,
				},
			});

			if (result.success && result.notes) {
				// Append to existing notes instead of replacing
				const existingNotes = notes.trim();
				const generatedNotes = result.notes.trim();
				
				if (existingNotes) {
					// Add a separator and append
					setNotes(`${existingNotes}\n\n---\n\n${generatedNotes}`);
				} else {
					// No existing notes, just set the generated ones
					setNotes(generatedNotes);
				}
				
				toast.success(
					`Notes generated with ${result.provider}! ${result.tokensUsed ? `(${result.tokensUsed} tokens)` : ""}`,
				);
				
				// Enter edit mode so user can review/edit the generated notes
				setIsEditMode(true);
			} else {
				toast.error(result.error || "Failed to generate notes", 7000);
			}
		} catch (error) {
			console.error("Failed to generate notes with AI:", error);
			toast.error("Failed to generate notes. Please try again.", 5000);
		} finally {
			setIsGeneratingAI(false);
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
				// Download image using persistent directory
				const imageResult = await downloadFile(
					result.screenshot.filename,
					result.screenshot.imageData,
					result.screenshot.mimeType,
				);

				// Check if user cancelled
				if (imageResult.cancelled) {
					// User cancelled - don't show error, just abort silently
					return;
				}

				// If image download succeeded, download notes if they exist
				if (imageResult.success && result.screenshot.notes && result.screenshot.notes.trim()) {
					const notesResult = await downloadFile(
						result.screenshot.notesFilename,
						result.screenshot.notes,
						"text/plain",
					);
					
					// Check if user cancelled notes download
					if (notesResult.cancelled) {
						return;
					}
				}

				// Show success message only if download completed
				if (imageResult.success) {
					toast.success("Files saved successfully!", 3000);
				}
			}
		} catch (error) {
			console.error("Failed to download:", error);

			// Handle specific error cases
			if (error instanceof Error) {
				if (error.message.includes("network")) {
					toast.error(
						"Network error. Please check your connection and try again.",
						7000,
					);
				} else if (error.message.includes("access denied") || error.message.includes("Permission denied")) {
					toast.error(
						"Permission denied. Please allow access to save files.",
						7000,
					);
				} else if (error.message.includes("not supported")) {
					toast.warning(
						"Your browser doesn't support this feature. Using standard download instead.",
						7000,
					);
					// Try fallback download
					// This would be handled by the downloadFile function automatically
				} else {
					toast.error(`Download failed: ${error.message}`, 7000);
				}
			} else {
				toast.error("Failed to download screenshot. Please try again.", 5000);
			}
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

	const handleHashtagClickInternal = (hashtag: string) => {
		// Close viewer and trigger search
		onClose();
		if (onHashtagClick) {
			onHashtagClick(hashtag);
		}
	};

	return (
		<>
			<ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
			<ConfirmDialog
				isOpen={showDiscardDialog}
				title="Discard Changes?"
				message="You have unsaved changes. Do you want to discard them?"
				confirmText="Discard"
				cancelText="Keep Editing"
				onConfirm={handleDiscardConfirm}
				onCancel={handleDiscardCancel}
			/>
			<div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={handleBackdropClick}>
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
					{/* Download button with keyboard hint */}
					<button
						type="button"
						onClick={handleDownload}
						disabled={isDownloading}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
						aria-label={`Download screenshot (${isDownloading ? "downloading" : "Cmd+D or Ctrl+D"})`}
					>
						<Download className="w-4 h-4" />
						{isDownloading ? "Downloading..." : "Download"}
						{!isDownloading && (
							<KeyboardHint keys={["Cmd", "D"]} variant="compact" className="ml-1 opacity-70" />
						)}
					</button>

					{/* Close button with ESC hint */}
					<button
						type="button"
						onClick={handleClose}
						className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors group"
						aria-label="Close viewer (Escape key)"
					>
						<X className="w-6 h-6 text-white" />
						<KeyboardHint keys="Escape" variant="compact" className="opacity-60 group-hover:opacity-100 transition-opacity" />
					</button>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Image viewer */}
				<div className="flex-1 flex items-center justify-center p-8 relative" onClick={(e) => e.stopPropagation()}>
					{/* Navigation buttons with keyboard hints */}
					{hasPrev && onNavigate && (
						<button
							type="button"
							onClick={() => onNavigate("prev")}
							className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors group"
							aria-label="Previous screenshot (Left arrow key)"
						>
							<div className="flex items-center gap-2">
								<KeyboardHint keys="←" variant="compact" className="opacity-60 group-hover:opacity-100 transition-opacity" />
								<ChevronLeft className="w-6 h-6 text-white" />
							</div>
						</button>
					)}

					{hasNext && onNavigate && (
						<button
							type="button"
							onClick={() => onNavigate("next")}
							className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors group"
							aria-label="Next screenshot (Right arrow key)"
						>
							<div className="flex items-center gap-2">
								<ChevronRight className="w-6 h-6 text-white" />
								<KeyboardHint keys="→" variant="compact" className="opacity-60 group-hover:opacity-100 transition-opacity" />
							</div>
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
					<div className="p-4 border-b border-white/10 flex items-center justify-between">
						<h3 className="text-lg font-semibold text-white">Notes</h3>
						{!isEditMode && (
							<button
								type="button"
								onClick={() => setIsEditMode(true)}
								className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
							>
								Edit
								<KeyboardHint keys="E" variant="compact" className="opacity-70" />
							</button>
						)}
					</div>

					<div className="flex-1 flex flex-col overflow-hidden">
						{!isEditMode ? (
							/* View mode - display saved notes with clickable hashtags */
							<>
								{screenshot.notes && screenshot.notes.trim() ? (
									<>
										<div className="flex-1 p-4 overflow-y-auto">
											<MarkdownNotes
												content={screenshot.notes}
												onHashtagClick={onHashtagClick ? handleHashtagClickInternal : undefined}
											/>
										</div>
										<div className="px-4 pb-4 text-xs text-white/40 border-t border-white/10 pt-3">
											Press <KeyboardHint keys="E" variant="inline" /> to edit
										</div>
									</>
								) : (
									<div className="flex-1 flex items-center justify-center p-4">
										<div className="text-center space-y-3">
											<p className="text-white/40 mb-3">No notes yet</p>
											<div className="flex flex-col gap-2">
												{aiAvailable && (
													<button
														type="button"
														onClick={handleGenerateWithAI}
														disabled={isGeneratingAI}
														className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white rounded-lg transition-colors"
													>
														<Sparkles className="w-4 h-4" />
														{isGeneratingAI ? "Generating..." : "Generate with AI"}
													</button>
												)}
												<button
													type="button"
													onClick={() => setIsEditMode(true)}
													className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
												>
													Add Notes Manually
													<KeyboardHint keys="E" variant="compact" className="opacity-70" />
												</button>
											</div>
										</div>
									</div>
								)}
							</>
						) : (
							/* Edit mode - show input with tag hints */
							<>
								<div className="p-4 pb-0 flex-shrink-0">
									{/* Tag hint banner */}
									<TagHintBanner userId={screenshot.userId} />

									{/* AI Generate button */}
									{aiAvailable && (
										<button
											type="button"
											onClick={handleGenerateWithAI}
											disabled={isGeneratingAI}
											className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white rounded-lg transition-colors"
										>
											<Sparkles className="w-4 h-4" />
											{isGeneratingAI ? "Generating..." : "Generate with AI"}
										</button>
									)}
								</div>

								{/* Enhanced notes input with hashtag support - takes all available space */}
								<div className="flex-1 px-4 overflow-visible">
									<EnhancedNotesInput
										value={notes}
										onChange={setNotes}
										userId={screenshot.userId}
										placeholder="Add notes... Use #tags to organize"
										className="h-full"
										autoFocus={true}
									/>
								</div>

								<div className="px-4 pb-4 pt-2 text-xs text-white/40 space-y-1 flex-shrink-0">
									<div>Press <KeyboardHint keys={["Cmd", "S"]} variant="inline" /> to save</div>
									<div>Press <KeyboardHint keys="Escape" variant="inline" /> to cancel</div>
								</div>
							</>
						)}
					</div>

					{isEditMode && (
						<div className="p-4 border-t border-white/10 flex gap-2">
							<button
								type="button"
								onClick={handleCancelEdit}
								className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleSaveNotes}
								disabled={isSaving || notes === (screenshot.notes || "")}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors"
							>
								<Save className="w-4 h-4" />
								{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
		</>
	);
}
