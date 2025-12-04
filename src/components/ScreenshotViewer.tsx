import { useState, useEffect, useRef } from "react";
import { Save, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Screenshot } from "@/types/screenshot";
import { updateScreenshotNotes, downloadScreenshotWithNotes, deleteScreenshot, toggleDownloadStatus, renameScreenshot } from "@/server/screenshots";
import { downloadFileWithPicker } from "@/utils/fileSystem";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EnhancedNotesInput } from "@/components/EnhancedNotesInput";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TagHintBanner } from "@/components/TagHintBanner";
import { KeyboardHint } from "@/components/KeyboardHint";
import { ViewerHeader, type ViewerHeaderRef } from "@/components/ViewerHeader";
import { generateNotesWithAI, refineNotesWithAI, checkAIAvailability } from "@/server/ai";

interface ScreenshotViewerProps {
	screenshot: Screenshot;
	allScreenshots?: Screenshot[];
	onClose: () => void;
	onNavigate?: (direction: "prev" | "next") => void;
	onUpdate?: (updatedScreenshot: Screenshot) => void;
	onHashtagClick?: (hashtag: string) => void;
	onSuccess?: (message: string) => void;
	onError?: (message: string) => void;
}

export function ScreenshotViewer({
	screenshot,
	allScreenshots = [],
	onClose,
	onNavigate,
	onUpdate,
	onHashtagClick,
	onSuccess,
	onError,
}: ScreenshotViewerProps) {
	const [notes, setNotes] = useState(screenshot.notes || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isGeneratingAI, setIsGeneratingAI] = useState(false);
	const [isRefiningAI, setIsRefiningAI] = useState(false);
	const [aiAvailable, setAiAvailable] = useState(false);
	const [showDiscardDialog, setShowDiscardDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [pendingAction, setPendingAction] = useState<"close" | "cancel" | null>(null);
	const toast = useToast();
	const navigate = useNavigate();
	const headerRef = useRef<ViewerHeaderRef>(null);

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

	// Update URL when viewer opens or screenshot changes
	useEffect(() => {
		// Add screenshot ID to URL
		navigate({
			to: "/screenshots",
			search: (prev: any) => ({
				...prev,
				screenshot: String(screenshot.id),
			}),
			replace: false, // Add to history for back button
		});
	}, [screenshot.id]);

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
			// Remove screenshot parameter from URL
			navigate({
				to: "/screenshots",
				search: (prev: any) => {
					const { screenshot, ...rest } = prev;
					return rest;
				},
				replace: false, // Add to history for back button
			});
			onClose();
		}
	};

	const handleDiscardConfirm = () => {
		setShowDiscardDialog(false);
		
		if (pendingAction === "close") {
			// Remove screenshot parameter from URL
			navigate({
				to: "/screenshots",
				search: (prev: any) => {
					const { screenshot, ...rest } = prev;
					return rest;
				},
				replace: false,
			});
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

	// Disable background scroll when viewer is open
	useEffect(() => {
		// Store original overflow style
		const originalOverflow = document.body.style.overflow;
		const originalPosition = document.body.style.position;
		
		// Disable scroll on body
		document.body.style.overflow = "hidden";
		document.body.style.position = "relative";
		
		// Cleanup: restore original scroll behavior
		return () => {
			document.body.style.overflow = originalOverflow;
			document.body.style.position = originalPosition;
		};
	}, []);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Check if user is typing in an input field
			const target = e.target as HTMLElement;
			const isTypingInTextarea = target.tagName === "TEXTAREA";
			const isTypingInInput = target.tagName === "INPUT";
			const isTyping = isTypingInTextarea || isTypingInInput;
			
			// ESC key - works from anywhere, highest priority
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				if (isEditMode) {
					// Exit edit mode with confirmation if there are unsaved changes
					handleCancelEdit();
				} else {
					// Close viewer with confirmation if there are unsaved changes
					handleClose();
				}
				return; // Stop processing other handlers
			}
			
			// F2 key - rename screenshot (don't trigger when typing in textarea)
			if (e.key === "F2" && !isTypingInTextarea) {
				e.preventDefault();
				// Trigger rename in ViewerHeader
				headerRef.current?.startRename();
				return;
			}
			
			// Arrow navigation - don't trigger when typing
			if (e.key === "ArrowLeft" && onNavigate && !isTyping) {
				if (hasPrev) {
					const prevScreenshot = allScreenshots[currentIndex - 1];
					// Update URL with new screenshot ID
					navigate({
						to: "/screenshots",
						search: (prev: any) => ({
							...prev,
							screenshot: String(prevScreenshot.id),
						}),
						replace: true, // Replace history for navigation
					});
					onNavigate("prev");
				}
			} else if (e.key === "ArrowRight" && onNavigate && !isTyping) {
				if (hasNext) {
					const nextScreenshot = allScreenshots[currentIndex + 1];
					// Update URL with new screenshot ID
					navigate({
						to: "/screenshots",
						search: (prev: any) => ({
							...prev,
							screenshot: String(nextScreenshot.id),
						}),
						replace: true, // Replace history for navigation
					});
					onNavigate("next");
				}
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
			} else if (e.key === "Delete" && !isTyping) {
				// DEL key to delete screenshot
				e.preventDefault();
				if (!isDeleting) {
					handleDelete();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, onNavigate, notes, screenshot.notes, isDownloading, isEditMode, isDeleting]);

	// Determine if navigation is available
	const currentIndex = allScreenshots.findIndex((s) => s.id === screenshot.id);
	const hasPrev = currentIndex > 0;
	const hasNext = currentIndex >= 0 && currentIndex < allScreenshots.length - 1;

	const handleSaveNotes = async () => {
		setIsSaving(true);
		setSaveSuccess(false);

		try {
			// Save to server and get the updated screenshot back
			const result = await updateScreenshotNotes({
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

			// Use the screenshot returned from the server (includes actual updated_at timestamp)
			if (result.success && result.screenshot && onUpdate) {
				onUpdate(result.screenshot);
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

	const handleRefineWithAI = async () => {
		if (!notes.trim()) {
			toast.error("No notes to refine", 3000);
			return;
		}

		setIsRefiningAI(true);

		try {
			const result = await refineNotesWithAI({
				data: {
					userId: screenshot.userId,
					existingNotes: notes,
				},
			});

			if (result.success && result.notes) {
				// Replace notes with refined version
				setNotes(result.notes.trim());
				
				toast.success(
					`Notes refined with ${result.provider}! ${result.tokensUsed ? `(${result.tokensUsed} tokens)` : ""}`,
				);
			} else {
				toast.error(result.error || "Failed to refine notes", 7000);
			}
		} catch (error) {
			console.error("Failed to refine notes with AI:", error);
			toast.error("Failed to refine notes. Please try again.", 5000);
		} finally {
			setIsRefiningAI(false);
		}
	};

	const handleDownload = async () => {
		setIsDownloading(true);

		try {
			// Get screenshot with notes from server
			const result = await downloadScreenshotWithNotes({
				data: {
					id: screenshot.id,
					userId: screenshot.userId,
				},
			});

			if (!result.success || !result.screenshot) {
				throw new Error("Failed to fetch screenshot data");
			}

			// Download image file using showSaveFilePicker
			const imageResult = await downloadFileWithPicker(
				result.screenshot.filename,
				result.screenshot.imageData,
				result.screenshot.mimeType,
			);

			if (imageResult.cancelled) {
				// User cancelled - don't show error, just abort silently
				return;
			}

			// Download notes file if exists
			if (result.screenshot.notes && result.screenshot.notes.trim()) {
				const notesResult = await downloadFileWithPicker(
					result.screenshot.notesFilename,
					result.screenshot.notes,
					"text/plain",
				);
				
				if (notesResult.cancelled) {
					// User cancelled notes - image was already saved
					toast.success("Screenshot saved successfully!", 3000);
					return;
				}
			}

			// Mark as downloaded
			try {
				const statusResult = await toggleDownloadStatus({
					data: {
						id: screenshot.id,
						userId: screenshot.userId,
						downloaded: true,
					},
				});

				if (statusResult.success && statusResult.screenshot && onUpdate) {
					onUpdate(statusResult.screenshot);
				}
			} catch (error) {
				console.error("Failed to update download status:", error);
				// Don't block the success message if status update fails
			}

			// Show success message
			if (imageResult.directoryName) {
				toast.success(`Files saved to "${imageResult.directoryName}"`, 5000);
			} else {
				toast.success("Files saved successfully!", 3000);
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

	const handleDelete = () => {
		setShowDeleteDialog(true);
	};

	const handleConfirmDelete = async () => {
		setIsDeleting(true);
		setShowDeleteDialog(false);

		try {
			await deleteScreenshot({
				data: {
					id: screenshot.id,
					userId: screenshot.userId,
				},
			});

			// Navigate to clear URL params FIRST (before closing viewer)
			navigate({
				to: "/screenshots",
				search: (prev: any) => {
					const { screenshot: _, ...rest } = prev;
					return rest;
				},
				replace: true, // Use replace to avoid adding to history
			});
			
			// Then close viewer (this triggers refresh in parent)
			onClose();
			
			// Show success toast using parent's toast system (persists after viewer closes)
			if (onSuccess) {
				onSuccess("Screenshot deleted successfully!");
			} else {
				toast.success("Screenshot deleted successfully!");
			}
		} catch (error) {
			console.error("Failed to delete screenshot:", error);
			const errorMessage = "Failed to delete screenshot. Please try again.";
			if (onError) {
				onError(errorMessage);
			} else {
				toast.error(errorMessage, 5000);
			}
			setIsDeleting(false);
		}
	};

	const handleCancelDelete = () => {
		setShowDeleteDialog(false);
	};

	const handleToggleDownloadStatus = async () => {
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

	const handleRename = async (newFilename: string) => {
		try {
			const result = await renameScreenshot({
				data: {
					id: screenshot.id,
					userId: screenshot.userId,
					newFilename,
				},
			});

			if (result.success && result.screenshot && onUpdate) {
				onUpdate(result.screenshot);
				toast.success("Screenshot renamed successfully", 2000);
			}
		} catch (error) {
			console.error("Failed to rename screenshot:", error);
			toast.error("Failed to rename screenshot", 3000);
		}
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
			<ConfirmDialog
				isOpen={showDiscardDialog}
				title="Discard Changes?"
				message="You have unsaved changes. Do you want to discard them?"
				confirmText="Discard"
				cancelText="Keep Editing"
				variant="warning"
				onConfirm={handleDiscardConfirm}
				onCancel={handleDiscardCancel}
			/>
			<ConfirmDialog
				isOpen={showDeleteDialog}
				title="Delete Screenshot?"
				message="Are you sure you want to delete this screenshot? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
			<div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={handleBackdropClick}>
			{/* Header */}
			<ViewerHeader
				ref={headerRef}
				filename={screenshot.filename}
				uploadDate={screenshot.uploadDate}
				fileSize={screenshot.fileSize}
				downloaded={screenshot.downloaded}
				isDownloading={isDownloading}
				isDeleting={isDeleting}
				onRename={handleRename}
				onDownload={handleDownload}
				onDelete={handleDelete}
				onToggleDownloadStatus={handleToggleDownloadStatus}
				onClose={handleClose}
			/>

			{/* Main content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Image viewer */}
				<div className="flex-1 flex items-center justify-center p-8 relative" onClick={(e) => e.stopPropagation()}>
					{/* Navigation buttons with keyboard hints */}
					{hasPrev && onNavigate && (
						<button
							type="button"
							onClick={() => {
								const prevScreenshot = allScreenshots[currentIndex - 1];
								// Update URL with new screenshot ID
								navigate({
									to: "/screenshots",
									search: (prev: any) => ({
										...prev,
										screenshot: String(prevScreenshot.id),
									}),
									replace: true,
								});
								onNavigate("prev");
							}}
							className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors group"
							aria-label="Previous screenshot (Left arrow key)"
						>
							<KeyboardHint keys="←" variant="compact" className="opacity-80 group-hover:opacity-100 transition-opacity text-lg" />
						</button>
					)}

					{hasNext && onNavigate && (
						<button
							type="button"
							onClick={() => {
								const nextScreenshot = allScreenshots[currentIndex + 1];
								// Update URL with new screenshot ID
								navigate({
									to: "/screenshots",
									search: (prev: any) => ({
										...prev,
										screenshot: String(nextScreenshot.id),
									}),
									replace: true,
								});
								onNavigate("next");
							}}
							className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors group"
							aria-label="Next screenshot (Right arrow key)"
						>
							<KeyboardHint keys="→" variant="compact" className="opacity-80 group-hover:opacity-100 transition-opacity text-lg" />
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
										<div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
											<MarkdownRenderer
												content={screenshot.notes}
												onHashtagClick={onHashtagClick ? handleHashtagClickInternal : undefined}
											/>
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

									{/* AI buttons */}
									{aiAvailable && (
										<div className="flex gap-2 mb-3">
											<button
												type="button"
												onClick={handleGenerateWithAI}
												disabled={isGeneratingAI || isRefiningAI}
												className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white rounded-lg transition-colors"
											>
												<Sparkles className="w-4 h-4" />
												{isGeneratingAI ? "Generating..." : "Generate with AI"}
											</button>
											{notes.trim() && (
												<button
													type="button"
													onClick={handleRefineWithAI}
													disabled={isGeneratingAI || isRefiningAI}
													className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-600/50 disabled:to-cyan-600/50 text-white rounded-lg transition-colors"
												>
													<Sparkles className="w-4 h-4" />
													{isRefiningAI ? "Refining..." : "Refine with AI"}
												</button>
											)}
										</div>
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
									<div>Press <KeyboardHint keys="ESC" variant="inline" /> to cancel</div>
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
