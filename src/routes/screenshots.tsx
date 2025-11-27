import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import { ToastContainer } from "@/components/Toast";
import { UserProfileSelector } from "@/components/UserProfileSelector";
import { useToast } from "@/hooks/useToast";
import type { Screenshot } from "@/types/screenshot";

export const Route = createFileRoute("/screenshots")({
	component: ScreenshotsPage,
});

function ScreenshotsPage() {
	// User profile selection
	const [userId, setUserId] = useState(1);
	const [refreshKey, setRefreshKey] = useState(0);
	const { toasts, removeToast, success, error } = useToast();

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
						onError={handleUploadError}
						onSuccess={handleUploadSuccess}
					/>
				</div>

				{/* File explorer */}
				<div>
					<FileExplorer key={refreshKey} userId={userId} onError={handleUploadError} />
				</div>
			</div>

			{/* Toast notifications */}
			<ToastContainer toasts={toasts} onClose={removeToast} />
		</div>
	);
}
