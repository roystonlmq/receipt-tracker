import { useState, useEffect } from "react";
import { Folder, ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Screenshot, Folder as FolderType } from "@/types/screenshot";
import { ScreenshotCard } from "./ScreenshotCard";
import { formatFolderDate } from "@/utils/filename";
import { getScreenshots } from "@/server/screenshots";

interface FileExplorerProps {
	userId: number;
	currentPath?: string;
}

export function FileExplorer({ userId, currentPath }: FileExplorerProps) {
	const navigate = useNavigate();
	const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
	const [folders, setFolders] = useState<FolderType[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [currentFolder, setCurrentFolder] = useState<string | null>(
		currentPath || null,
	);

	// Load screenshots
	useEffect(() => {
		loadScreenshots();
	}, [userId, currentFolder]);

	const loadScreenshots = async () => {
		setLoading(true);
		try {
			// Call server function with data wrapped
			const results = await getScreenshots({
				data: {
					userId,
					folderDate: currentFolder || undefined,
				},
			});

			setScreenshots(results);

			// Group by folders if we're at root
			if (!currentFolder) {
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
	};

	const handleView = (id: number) => {
		// TODO: Open screenshot viewer
		console.log("View screenshot:", id);
	};

	const handleRename = (id: number, newName: string) => {
		// TODO: Implement rename
		console.log("Rename screenshot:", id, newName);
	};

	const handleDelete = (id: number) => {
		// TODO: Implement delete
		console.log("Delete screenshot:", id);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="w-8 h-8 text-white/60 animate-spin" />
			</div>
		);
	}

	// Root view - show folders
	if (!currentFolder) {
		if (folders.length === 0) {
			return (
				<div className="text-center py-12">
					<Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
					<p className="text-white/60">No screenshots yet</p>
					<p className="text-white/40 text-sm mt-2">
						Upload some screenshots to get started
					</p>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-white mb-4">Folders</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{folders.map((folder) => (
						<button
							key={folder.date}
							type="button"
							onClick={() => handleFolderClick(folder.date)}
							className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-6 transition-all text-left"
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
					))}
				</div>
			</div>
		);
	}

	// Folder view - show screenshots
	return (
		<div className="space-y-4">
			{/* Back button */}
			<div className="flex items-center gap-4 mb-6">
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
						/>
					))}
				</div>
			)}
		</div>
	);
}
