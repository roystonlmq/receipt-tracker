import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import { ScreenshotViewer } from "@/components/ScreenshotViewer";
import { ToastContainer } from "@/components/Toast";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import type { Screenshot } from "@/types/screenshot";

export const Route = createFileRoute("/screenshots")({
	component: ScreenshotsPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			query: search.query ? decodeURIComponent(search.query as string) : undefined,
			folder: (search.folder as string) || undefined,
			screenshot: search.screenshot ? Number(search.screenshot) : undefined,
		};
	},
});

function ScreenshotsPage() {
	const searchParams = useSearch({ from: "/screenshots" });
	const { user } = useAuth();
	const [refreshKey, setRefreshKey] = useState(0);
	const [viewingScreenshot, setViewingScreenshot] = useState<Screenshot | null>(null);
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

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
				<div className="container mx-auto px-4 py-8">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-white mb-2">
							My Screenshots
						</h1>
						<p className="text-white/60">
							Manage your screenshots and receipts
						</p>
					</div>

					{/* Upload section */}
					{user && (
						<div className="mb-8">
							<ScreenshotUpload
								userId={user.id}
								onUploadComplete={handleUploadComplete}
								onViewScreenshot={handleViewScreenshot}
								onError={handleUploadError}
								onSuccess={handleUploadSuccess}
							/>
						</div>
					)}

					{/* File explorer */}
					{user && (
						<div>
							<FileExplorer
								key={refreshKey}
								userId={user.id}
								currentPath={searchParams.folder}
								initialSearchQuery={searchParams.query}
								initialScreenshotId={searchParams.screenshot}
								onError={handleUploadError}
							/>
						</div>
					)}
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
		</AuthGuard>
	);
}
