import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import { ScreenshotViewer } from "@/components/ScreenshotViewer";
import { ToastContainer } from "@/components/Toast";
import { UserProfileSelector } from "@/components/UserProfileSelector";
import { useToast } from "@/hooks/useToast";
import type { Screenshot } from "@/types/screenshot";
import { getUsers } from "@/server/users";

export const Route = createFileRoute("/screenshots")({
	component: ScreenshotsPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			query: (search.query as string) || undefined,
			folder: (search.folder as string) || undefined,
		};
	},
});

function ScreenshotsPage() {
	const searchParams = useSearch({ from: "/screenshots" });
	// User profile selection
	const [userId, setUserId] = useState<number | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [viewingScreenshot, setViewingScreenshot] = useState<Screenshot | null>(null);
	const { toasts, removeToast, success, error } = useToast();

	// Load first available user on mount
	useEffect(() => {
		const loadInitialUser = async () => {
			try {
				const users = await getUsers();
				if (users.length > 0) {
					setUserId(users[0].id);
				}
			} catch (err) {
				console.error("Failed to load users:", err);
				error("Failed to load user profiles");
			}
		};
		loadInitialUser();
	}, []);

	const handleUploadComplete = (screenshots: Screenshot[]) => {
		console.log("Uploaded screenshots:", screenshots);
		// Refresh the file explorer
		setRefreshKey((prev) => prev + 1);
	};

	const handleUploadError = (message: string) => {
		error(message);
	};

	const handleUploadSuccess = (message: string) => {
		success(message);
	};

	const handleUserChange = (newUserId: number) => {
		setUserId(newUserId);
		setRefreshKey((prev) => prev + 1); // Refresh to load new user's screenshots
	};

	const handleViewScreenshot = (screenshot: Screenshot) => {
		setViewingScreenshot(screenshot);
	};

	const handleCloseViewer = () => {
		setViewingScreenshot(null);
	};

	const handleUpdateScreenshot = (updatedScreenshot: Screenshot) => {
		// Refresh to show updated screenshot
		setRefreshKey((prev) => prev + 1);
	};

	// Don't render until we have a userId
	if (userId === null) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center">
				<div className="text-white/60">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-start justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white mb-2">
							Receipts Tracker
						</h1>
						<p className="text-white/60">
							Manage your screenshots and receipts
						</p>
					</div>
					<UserProfileSelector
						currentUserId={userId}
						onUserChange={handleUserChange}
					/>
				</div>

				{/* Upload section */}
				<div className="mb-8">
					<ScreenshotUpload
						userId={userId}
						onUploadComplete={handleUploadComplete}
						onViewScreenshot={handleViewScreenshot}
						onError={handleUploadError}
						onSuccess={handleUploadSuccess}
					/>
				</div>

				{/* File explorer */}
				<div>
					<FileExplorer
						key={refreshKey}
						userId={userId}
						initialSearchQuery={searchParams.query}
						onError={handleUploadError}
					/>
				</div>
			</div>

			{/* Toast notifications */}
			<ToastContainer toasts={toasts} onClose={removeToast} />

			{/* Screenshot Viewer Modal */}
			{viewingScreenshot && (
				<ScreenshotViewer
					screenshot={viewingScreenshot}
					onClose={handleCloseViewer}
					onUpdate={handleUpdateScreenshot}
				/>
			)}
		</div>
	);
}
