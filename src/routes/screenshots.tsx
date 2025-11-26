import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import type { Screenshot } from "@/types/screenshot";

export const Route = createFileRoute("/screenshots")({
	component: ScreenshotsPage,
});

function ScreenshotsPage() {
	// For now, use a hardcoded user ID. In production, get from auth
	const userId = 1;
	const [refreshKey, setRefreshKey] = useState(0);

	const handleUploadComplete = (screenshots: Screenshot[]) => {
		console.log("Uploaded screenshots:", screenshots);
		// Refresh the file explorer
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">
						Receipts Tracker
					</h1>
					<p className="text-white/60">
						Manage your screenshots and receipts
					</p>
				</div>

				{/* Upload section */}
				<div className="mb-8">
					<ScreenshotUpload
						userId={userId}
						onUploadComplete={handleUploadComplete}
					/>
				</div>

				{/* File explorer */}
				<div>
					<FileExplorer key={refreshKey} userId={userId} />
				</div>
			</div>
		</div>
	);
}
