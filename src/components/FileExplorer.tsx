import { useState, useEffect } from "react";
import { Folder, ChevronLeft, Loader2, Trash2, Download } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Screenshot, Folder as FolderType } from "@/types/screenshot";
import { ScreenshotCard } from "./ScreenshotCard";
import { ScreenshotViewer } from "./ScreenshotViewer";
import { SearchBar } from "./SearchBar";
import { formatFolderDate } from "@/utils/filename";
import { getScreenshots, downloadScreenshotWithNotes } from "@/server/screenshots";
import { retryWithBackoff } from "@/utils/retry";

interface FileExplorerProps {
	userId: number;
	currentPath?: string;
	onError?: (message: string) => void;
}

export function FileExplorer({
	userId,
	currentPath,
	onError,
}: FileExplorerProps) {
	const navigate = useNavigate();
	const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
	const [folders, setFolders] = useState<FolderType[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
	const [selectionMode, setSelectionMode] = useState(false);
	const [currentFolder, setCurrentFolder] = useState<string | null>(
		currentPath || null,
	);
	const [viewingScreenshot, setViewingScreenshot] = useState<Screenshot | null>(
		null,
	);
	const [searchQuery, setSearchQuery] = useState("");

	// Load screenshots
	useEffect(() => {
		loadScreenshots();
	}, [userId, currentFolder, searchQuery]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't handle if viewing a screenshot
			if (viewingScreenshot) return;

			// ESC key - go back to folders if in a folder
			if (e.key === "Escape" && currentFolder) {
				e.preventDefault();
				handleBackClick();
				return;
			}

			// Only handle delete/rename if we have selected screenshots
			if (selectedIds.size === 0) return;

			if (e.key === "Delete") {
				e.preventDefault();
				// Delete all selected screenshots
				const selectedArray = Array.from(selectedIds);
				if (selectedArray.length === 1) {
					handleDelete(selectedArray[0]);
				} else if (selectedArray.length > 1) {
					handleBatchDelete(selectedArray);
				}
			} else if (e.key === "F2" && selectedIds.size === 1) {
				e.preventDefault();
				// Trigger rename on the single selected screenshot
				const id = Array.from(selectedIds)[0];
				const screenshot = screenshots.find((s) => s.id === id);
				if (screenshot) {
					const nameMatch = screenshot.filename.match(
						/\d{6} - \d{4} - (.+)\.png$/i,
					);
					const currentName = nameMatch
						? nameMatch[1]
						: screenshot.filename.replace(/\.png$/i, "");
					const newName = prompt("Enter new name:", currentName);
					if (newName && newName.trim()) {
						handleRename(id, newName.trim());
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedIds, screenshots, viewingScreenshot, currentFolder]);

	const loadScreenshots = async () => {
		setLoading(true);
		try {
			// Call server function with retry logic
			const results = await retryWithBackoff(
				async () => {
					return await getScreenshots({
						data: {
							userId,
							folderDate: currentFolder || undefined,
							searchQuery: searchQuery || undefined,
						},
					});
				},
				{ maxAttempts: 3, initialDelay: 1000 },
			);

			setScreenshots(results);

			// Update viewing screenshot if it's currently open
			if (viewingScreenshot) {
				const updatedScreenshot = results.find(
					(s) => s.id === viewingScreenshot.id,
				);
				if (updatedScreenshot) {
					setViewingScreenshot(updatedScreenshot);
				}
			}

			// Group by folders if we're at root and not searching
			if (!currentFolder && !searchQuery) {
				const folderMap = new Map<string, Screenshot[]>();

				for (const screenshot of results) {
					const date = screenshot.folderDate;
					if (!folderMap.has(date)) {
						folderMap.set(date, []);
					}
					folderMap.get(date)?.push(screenshot);
				}

				// Convert to folder objects and sort by date descending
				const folderList: FolderType[] = Array.from(folderMap.entries())
					.map(([date, screenshots]) => ({
						date,
						displayDate: formatFolderDate(date),
						screenshotCount: screenshots.length,
						screenshots,
					}))
					.sort((a, b) => {
						// Sort by date descending (most recent first)
						return b.date.localeCompare(a.date);
					});

				setFolders(folderList);
			}
		} catch (error) {
			console.error("Failed to load screenshots:", error);
			const errorMessage = "Failed to load screenshots. Please try again.";
			onError?.(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleFolderClick = (folderDate: string) => {
		setCurrentFolder(folderDate);
		// Update URL with folder parameter
		navigate({
			to: "/screenshots",
			search: (prev: any) => ({ ...prev, folder: folderDate }),
		});
	};

	const handleBackClick = () => {
		setCurrentFolder(null);
		// Clear folder parameter from URL
		navigate({
			to: "/screenshots",
			search: (prev: any) => {
				const { folder, ...rest } = prev;
				return rest;
			},
		});
	};

	const handleSelect = (id: number) => {
		setSelectedIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
		// Enable selection mode when items are selected
		if (!selectionMode) {
			setSelectionMode(true);
		}
	};

	const handleSelectAll = () => {
		if (selectedIds.size === screenshots.length) {
			// Deselect all
			setSelectedIds(new Set());
			setSelectionMode(false);
		} else {
			// Select all
			setSelectedIds(new Set(screenshots.map((s) => s.id)));
			setSelectionMode(true);
		}
	};

	const handleCancelSelection = () => {
		setSelectedIds(new Set());
		setSelectionMode(false);
	};

	const handleView = (id: number) => {
		const screenshot = screenshots.find((s) => s.id === id);
		if (screenshot) {
			setViewingScreenshot(screenshot);
		}
	};

	const handleCloseViewer = () => {
		setViewingScreenshot(null);
	};

	const handleNavigateViewer = (direction: "prev" | "next") => {
		if (!viewingScreenshot) return;

		const currentIndex = screenshots.findIndex(
			(s) => s.id === viewingScreenshot.id,
		);

		if (direction === "prev" && currentIndex > 0) {
			setViewingScreenshot(screenshots[currentIndex - 1]);
		} else if (direction === "next" && currentIndex < screenshots.length - 1) {
			setViewingScreenshot(screenshots[currentIndex + 1]);
		}
	};

	const handleViewerUpdate = (updatedScreenshot: Screenshot) => {
		// Optimistically update the screenshot in the list without reloading
		setScreenshots((prevScreenshots) =>
			prevScreenshots.map((s) =>
				s.id === updatedScreenshot.id ? updatedScreenshot : s,
			),
		);
		
		// Also update the viewing screenshot if it's the same one
		if (viewingScreenshot && viewingScreenshot.id === updatedScreenshot.id) {
			setViewingScreenshot(updatedScreenshot);
		}
	};

	const handleRename = async (id: number, newName: string) => {
		try {
			const { renameScreenshot } = await import("@/server/screenshots");
			const { generateUniqueFilename } = await import("@/utils/filename");

			// Generate proper filename format: DDMMYY - HHMM - name.png
			const now = new Date();
			const day = String(now.getDate()).padStart(2, "0");
			const month = String(now.getMonth() + 1).padStart(2, "0");
			const year = String(now.getFullYear()).slice(-2);
			const hour = String(now.getHours()).padStart(2, "0");
			const minute = String(now.getMinutes()).padStart(2, "0");

			// Create base filename with the new name
			const baseFilename = `${day}${month}${year} - ${hour}${minute} - ${newName}.png`;

			// Get existing filenames (excluding the current screenshot being renamed)
			const existingFilenames = screenshots
				.filter((s) => s.id !== id)
				.map((s) => s.filename);

			// Generate unique filename
			const finalFilename = generateUniqueFilename(
				baseFilename,
				existingFilenames,
			);

			await renameScreenshot({
				data: {
					id,
					userId,
					newFilename: finalFilename,
				},
			});

			// Reload screenshots
			await loadScreenshots();
		} catch (error) {
			console.error("Failed to rename screenshot:", error);
			onError?.("Failed to rename screenshot. Please try again.");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this screenshot?")) {
			return;
		}

		try {
			const { deleteScreenshot } = await import("@/server/screenshots");

			await deleteScreenshot({
				data: {
					id,
					userId,
				},
			});

			// Clear selection
			setSelectedIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});

			// Reload screenshots
			await loadScreenshots();
		} catch (error) {
			console.error("Failed to delete screenshot:", error);
			onError?.("Failed to delete screenshot. Please try again.");
		}
	};

	const handleBatchDelete = async (ids: number[]) => {
		if (
			!confirm(`Are you sure you want to delete ${ids.length} screenshots?`)
		) {
			return;
		}

		try {
			const { batchDeleteScreenshots } = await import("@/server/screenshots");

			await batchDeleteScreenshots({
				data: {
					ids,
					userId,
				},
			});

			// Clear selection and exit selection mode
			setSelectedIds(new Set());
			setSelectionMode(false);

			// Reload screenshots
			await loadScreenshots();
		} catch (error) {
			console.error("Failed to delete screenshots:", error);
			onError?.("Failed to delete screenshots. Please try again.");
		}
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		// Clear current folder when searching
		if (query) {
			setCurrentFolder(null);
		}
	};

	const handleSelectFolder = (folderDate: string) => {
		setSelectedFolders((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(folderDate)) {
				newSet.delete(folderDate);
			} else {
				newSet.add(folderDate);
			}
			return newSet;
		});
	};

	const handleSelectAllFolders = () => {
		if (selectedFolders.size === folders.length) {
			setSelectedFolders(new Set());
		} else {
			setSelectedFolders(new Set(folders.map((f) => f.date)));
		}
	};

	const handleBatchDeleteFolders = async () => {
		// Get all screenshot IDs from selected folders
		const screenshotIds: number[] = [];
		for (const folderDate of selectedFolders) {
			const folder = folders.find((f) => f.date === folderDate);
			if (folder) {
				screenshotIds.push(...folder.screenshots.map((s) => s.id));
			}
		}

		if (screenshotIds.length === 0) return;

		if (
			!confirm(
				`Are you sure you want to delete ${selectedFolders.size} folder${selectedFolders.size === 1 ? "" : "s"} (${screenshotIds.length} screenshot${screenshotIds.length === 1 ? "" : "s"})?`,
			)
		) {
			return;
		}

		try {
			const { batchDeleteScreenshots } = await import("@/server/screenshots");

			await batchDeleteScreenshots({
				data: {
					ids: screenshotIds,
					userId,
				},
			});

			// Clear selection
			setSelectedFolders(new Set());

			// Reload screenshots
			await loadScreenshots();
		} catch (error) {
			console.error("Failed to delete folders:", error);
			onError?.("Failed to delete folders. Please try again.");
		}
	};

	const handleBatchDownloadFolders = async () => {
		// Get all screenshots from selected folders
		const screenshotsToDownload: Screenshot[] = [];
		for (const folderDate of selectedFolders) {
			const folder = folders.find((f) => f.date === folderDate);
			if (folder) {
				screenshotsToDownload.push(...folder.screenshots);
			}
		}

		if (screenshotsToDownload.length === 0) return;

		// Download each screenshot
		for (const screenshot of screenshotsToDownload) {
			try {
				const result = await downloadScreenshotWithNotes({
					data: { id: screenshot.id, userId },
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

				// Small delay between downloads to avoid overwhelming the browser
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				console.error(`Failed to download screenshot ${screenshot.id}:`, error);
			}
		}
	};

	const handleBatchDownload = async (ids: number[]) => {
		try {
			for (const id of ids) {
				const screenshot = screenshots.find((s) => s.id === id);
				if (!screenshot) continue;

				const result = await downloadScreenshotWithNotes({
					data: { id, userId },
				});

				if (result.success && result.screenshot) {
					// Use File System Access API if available (Chrome/Edge)
					if ('showSaveFilePicker' in window) {
						try {
							// Convert base64 to blob
							const response = await fetch(result.screenshot.imageData);
							const blob = await response.blob();
							
							// @ts-ignore - File System Access API
							const handle = await window.showSaveFilePicker({
								suggestedName: result.screenshot.filename,
								types: [{
									description: 'PNG Image',
									accept: { 'image/png': ['.png'] },
								}],
							});
							
							const writable = await handle.createWritable();
							await writable.write(blob);
							await writable.close();
							
							// Download notes if they exist
							if (result.screenshot.notes && result.screenshot.notes.trim()) {
								const notesBlob = new Blob([result.screenshot.notes], {
									type: "text/plain",
								});
								
								// @ts-ignore
								const notesHandle = await window.showSaveFilePicker({
									suggestedName: result.screenshot.notesFilename,
									types: [{
										description: 'Text File',
										accept: { 'text/plain': ['.txt'] },
									}],
								});
								
								const notesWritable = await notesHandle.createWritable();
								await notesWritable.write(notesBlob);
								await notesWritable.close();
							}
						} catch (err) {
							// User cancelled or error occurred
							if (err instanceof Error && err.name !== 'AbortError') {
								console.error('Save failed:', err);
							}
						}
					} else {
						// Fallback to traditional download
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
				}

				// Add small delay between downloads to avoid browser blocking
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		} catch (error) {
			console.error("Failed to download screenshots:", error);
			onError?.("Failed to download screenshots. Please try again.");
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<SearchBar onSearch={handleSearch} />
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-8 h-8 text-white/60 animate-spin" />
				</div>
			</div>
		);
	}

	// Toolbar component to avoid duplication
	const Toolbar = () => (
		<div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<label className="flex items-center gap-2 cursor-pointer group">
					<div className={`relative w-5 h-5 border-2 rounded transition-all duration-200 ${
						selectedIds.size === screenshots.length && screenshots.length > 0
							? "bg-blue-500 border-blue-500 scale-110" 
							: "border-white/60 scale-100 group-hover:border-white/80"
					}`}>
						{selectedIds.size === screenshots.length && screenshots.length > 0 && (
							<svg
								className="absolute inset-0 w-full h-full text-white"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								viewBox="0 0 24 24"
							>
								<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						)}
					</div>
					<input
						type="checkbox"
						checked={selectedIds.size === screenshots.length && screenshots.length > 0}
						onChange={handleSelectAll}
						className="sr-only"
					/>
					<span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
						{selectionMode 
							? `${selectedIds.size} ${selectedIds.size === 1 ? "item" : "items"} selected`
							: "Select all"
						}
					</span>
				</label>
			</div>
			{/* Always show buttons, but disable when nothing selected - prevents layout shift */}
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => handleBatchDownload(Array.from(selectedIds))}
					disabled={!selectionMode}
					className={`p-2 rounded-lg transition-colors ${
						selectionMode 
							? "hover:bg-white/10 cursor-pointer" 
							: "opacity-40 cursor-not-allowed"
					}`}
					title={selectionMode ? "Download selected" : "Select items to download"}
				>
					<Download className="w-5 h-5 text-white" />
				</button>
				<button
					type="button"
					onClick={() => handleBatchDelete(Array.from(selectedIds))}
					disabled={!selectionMode}
					className={`p-2 rounded-lg transition-colors ${
						selectionMode 
							? "hover:bg-red-500/20 cursor-pointer" 
							: "opacity-40 cursor-not-allowed"
					}`}
					title={selectionMode ? "Delete selected" : "Select items to delete"}
				>
					<Trash2 className="w-5 h-5 text-red-400" />
				</button>
			</div>
		</div>
	);

	// Search results view
	if (searchQuery) {
		return (
			<div className="space-y-6">
				<SearchBar onSearch={handleSearch} resultsCount={screenshots.length} />
				<Toolbar />

				{screenshots.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-white/60">No screenshots found</p>
						<p className="text-white/40 text-sm mt-2">
							Try a different search term
						</p>
					</div>
				) : (
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-white">Search Results</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{screenshots.map((screenshot) => (
								<div key={screenshot.id} className="space-y-2">
									<ScreenshotCard
										screenshot={screenshot}
										isSelected={selectedIds.has(screenshot.id)}
										onSelect={handleSelect}
										onView={handleView}
										onRename={handleRename}
										onDelete={handleDelete}
										selectionMode={selectionMode}
									/>
									{/* Folder indication */}
									<div className="text-xs text-white/40 text-center">
										{formatFolderDate(screenshot.folderDate)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Screenshot Viewer Modal */}
				{viewingScreenshot && (
					<ScreenshotViewer
						screenshot={viewingScreenshot}
						allScreenshots={screenshots}
						onClose={handleCloseViewer}
						onNavigate={handleNavigateViewer}
						onUpdate={handleViewerUpdate}
					/>
				)}
			</div>
		);
	}

	// Root view - show folders
	if (!currentFolder) {
		if (folders.length === 0) {
			return (
				<div className="space-y-6">
					<SearchBar onSearch={handleSearch} />
					<div className="text-center py-12">
						<Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
						<p className="text-white/60">No screenshots yet</p>
						<p className="text-white/40 text-sm mt-2">
							Upload some screenshots to get started
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				<SearchBar onSearch={handleSearch} />

				{/* Folder Selection Toolbar - matches screenshot toolbar design */}
				<div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<label className="flex items-center gap-2 cursor-pointer group">
							<div className={`relative w-5 h-5 border-2 rounded transition-all duration-200 ${
								selectedFolders.size === folders.length && folders.length > 0
									? "bg-blue-500 border-blue-500 scale-110" 
									: "border-white/60 scale-100 group-hover:border-white/80"
							}`}>
								{selectedFolders.size === folders.length && folders.length > 0 && (
									<svg
										className="absolute inset-0 w-full h-full text-white"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										viewBox="0 0 24 24"
									>
										<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								)}
							</div>
							<input
								type="checkbox"
								checked={selectedFolders.size === folders.length && folders.length > 0}
								onChange={handleSelectAllFolders}
								className="sr-only"
							/>
							<span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
								{selectedFolders.size > 0
									? `${selectedFolders.size} ${selectedFolders.size === 1 ? "folder" : "folders"} selected`
									: "Select all folders"
								}
							</span>
						</label>
					</div>
					{/* Always show buttons, but disable when nothing selected - prevents layout shift */}
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleBatchDownloadFolders}
							disabled={selectedFolders.size === 0}
							className={`p-2 rounded-lg transition-colors ${
								selectedFolders.size > 0
									? "hover:bg-white/10 cursor-pointer" 
									: "opacity-40 cursor-not-allowed"
							}`}
							title={selectedFolders.size > 0 ? "Download all screenshots from selected folders" : "Select folders to download"}
						>
							<Download className="w-5 h-5 text-white" />
						</button>
						<button
							type="button"
							onClick={handleBatchDeleteFolders}
							disabled={selectedFolders.size === 0}
							className={`p-2 rounded-lg transition-colors ${
								selectedFolders.size > 0
									? "hover:bg-red-500/20 cursor-pointer" 
									: "opacity-40 cursor-not-allowed"
							}`}
							title={selectedFolders.size > 0 ? "Delete all screenshots from selected folders" : "Select folders to delete"}
						>
							<Trash2 className="w-5 h-5 text-red-400" />
						</button>
					</div>
				</div>

				<div className="space-y-4">
					<h2 className="text-xl font-semibold text-white mb-4">Folders</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{folders.map((folder) => (
							<div
								key={folder.date}
								className={`group relative rounded-lg p-6 transition-all border-2 ${
									selectedFolders.has(folder.date)
										? "bg-blue-600/20 border-blue-500"
										: "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
								}`}
							>
								{/* Selection checkbox */}
								<input
									type="checkbox"
									checked={selectedFolders.has(folder.date)}
									onChange={() => handleSelectFolder(folder.date)}
									className="absolute top-3 right-3 w-5 h-5 rounded border-2 border-white/20 bg-white/10 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
									onClick={(e) => e.stopPropagation()}
								/>

								{/* Folder button */}
								<button
									type="button"
									onClick={() => handleFolderClick(folder.date)}
									className="w-full text-left cursor-pointer"
								>
									<Folder className="w-12 h-12 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
									<p className="text-white font-medium mb-1">
										{folder.displayDate}
									</p>
									<p className="text-white/60 text-sm">
										{folder.screenshotCount}{" "}
										{folder.screenshotCount === 1 ? "screenshot" : "screenshots"}
									</p>
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Folder view - show screenshots
	return (
		<>
			<div className="space-y-6">
				<SearchBar onSearch={handleSearch} />
				<Toolbar />

				<div className="space-y-4">
					{/* Back button and keyboard hint */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={handleBackClick}
								className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
							>
								<ChevronLeft className="w-5 h-5" />
								<span>Back to folders</span>
							</button>
							<h2 className="text-xl font-semibold text-white">
								{formatFolderDate(currentFolder)}
							</h2>
						</div>
						
						{/* Keyboard shortcut hint */}
						<div className="flex items-center gap-2 text-xs text-white/40">
							<kbd className="px-2 py-1 bg-white/10 rounded text-white/60">ESC</kbd>
							<span>Back to folders</span>
						</div>
					</div>

					{/* Screenshots grid */}
					{screenshots.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-white/60">No screenshots in this folder</p>
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{screenshots.map((screenshot) => (
								<ScreenshotCard
									key={screenshot.id}
									screenshot={screenshot}
									isSelected={selectedIds.has(screenshot.id)}
									onSelect={handleSelect}
									onView={handleView}
									onRename={handleRename}
									onDelete={handleDelete}
									selectionMode={selectionMode}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Screenshot Viewer Modal */}
			{viewingScreenshot && (
				<ScreenshotViewer
					screenshot={viewingScreenshot}
					allScreenshots={screenshots}
					onClose={handleCloseViewer}
					onNavigate={handleNavigateViewer}
					onUpdate={handleViewerUpdate}
				/>
			)}
		</>
	);
}
