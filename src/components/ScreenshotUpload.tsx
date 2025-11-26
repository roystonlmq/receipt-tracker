import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import type { Screenshot } from "@/types/screenshot";
import { uploadScreenshot } from "@/server/screenshots";
import { validateImageFile } from "@/utils/image";

interface ScreenshotUploadProps {
	userId: number;
	onUploadComplete: (screenshots: Screenshot[]) => void;
}

export function ScreenshotUpload({
	userId,
	onUploadComplete,
}: ScreenshotUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadProgress, setUploadProgress] = useState<
		{ name: string; progress: number }[]
	>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Handle paste from clipboard
	useEffect(() => {
		const handlePaste = async (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			const files: File[] = [];
			for (const item of items) {
				if (item.type.startsWith("image/")) {
					const file = item.getAsFile();
					if (file) {
						// Generate a filename for pasted images
						const timestamp = new Date();
						const filename = `screenshot-${timestamp.getFullYear()}${(timestamp.getMonth() + 1).toString().padStart(2, "0")}${timestamp.getDate().toString().padStart(2, "0")}-${timestamp.getHours().toString().padStart(2, "0")}${timestamp.getMinutes().toString().padStart(2, "0")}${timestamp.getSeconds().toString().padStart(2, "0")}.png`;
						const renamedFile = new File([file], filename, { type: file.type });
						files.push(renamedFile);
					}
				}
			}

			if (files.length > 0) {
				const dataTransfer = new DataTransfer();
				for (const file of files) {
					dataTransfer.items.add(file);
				}
				await handleFiles(dataTransfer.files);
			}
		};

		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, [userId]);

	const handleFiles = async (files: FileList | null) => {
		if (!files || files.length === 0) return;

		setError(null);
		setUploading(true);

		const fileArray = Array.from(files);
		const validFiles = fileArray.filter((file) => {
			if (!validateImageFile(file)) {
				setError(
					`${file.name} is not a valid image file. Please upload PNG, JPG, or JPEG files under 10MB.`,
				);
				return false;
			}
			return true;
		});

		if (validFiles.length === 0) {
			setUploading(false);
			return;
		}

		// Initialize progress tracking
		setUploadProgress(
			validFiles.map((file) => ({ name: file.name, progress: 0 })),
		);

		try {
			// Upload files concurrently
			const uploadPromises = validFiles.map(async (file, index) => {
				try {
					// Convert file to base64 on client side
					const fileToBase64 = (file: File): Promise<string> => {
						return new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.onload = () => resolve(reader.result as string);
							reader.onerror = reject;
							reader.readAsDataURL(file);
						});
					};

					const imageData = await fileToBase64(file);

					const payload = {
						file: {
							name: file.name,
							type: file.type,
							size: file.size,
							data: imageData,
						},
						userId,
					};

					console.log("=== CLIENT SENDING ===");
					console.log("Payload keys:", Object.keys(payload));
					console.log("userId:", payload.userId);
					console.log("file.name:", payload.file.name);

					const result = await uploadScreenshot({ data: payload });

					// Update progress
					setUploadProgress((prev) =>
						prev.map((p, i) => (i === index ? { ...p, progress: 100 } : p)),
					);

					return result.screenshot;
				} catch (err) {
					console.error(`Failed to upload ${file.name}:`, err);
					setError(`Failed to upload ${file.name}`);
					return null;
				}
			});

			const results = await Promise.all(uploadPromises);
			const successfulUploads = results.filter(
				(r): r is Screenshot => r !== null,
			);

			if (successfulUploads.length > 0) {
				onUploadComplete(successfulUploads);
			}
		} catch (err) {
			setError("Upload failed. Please try again.");
		} finally {
			setUploading(false);
			setUploadProgress([]);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		handleFiles(e.dataTransfer.files);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFiles(e.target.files);
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="w-full">
			{/* Upload area */}
			<div
				className={`relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${
					isDragging
						? "border-blue-500 bg-blue-500/10"
						: "border-white/20 hover:border-white/40 bg-white/5"
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") handleClick();
				}}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/png,image/jpeg,image/jpg"
					multiple
					className="hidden"
					onChange={handleFileSelect}
					disabled={uploading}
				/>

				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<div
						className={`p-4 rounded-full ${isDragging ? "bg-blue-500/20" : "bg-white/10"}`}
					>
						<Upload
							className={`w-8 h-8 ${isDragging ? "text-blue-400" : "text-white/60"}`}
						/>
					</div>

					<div>
						<p className="text-lg font-medium text-white mb-1">
							{uploading ? "Uploading..." : "Upload Screenshots"}
						</p>
						<p className="text-sm text-white/60">
							Drag and drop, click to select, or paste from clipboard
						</p>
						<p className="text-xs text-white/40 mt-2">
							PNG, JPG, JPEG up to 10MB • Press Ctrl+V to paste
						</p>
					</div>
				</div>
			</div>

			{/* Upload progress */}
			{uploadProgress.length > 0 && (
				<div className="mt-4 space-y-2">
					{uploadProgress.map((file) => (
						<div
							key={file.name}
							className="bg-white/5 rounded-lg p-3 border border-white/10"
						>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-white truncate">{file.name}</span>
								<span className="text-xs text-white/60">{file.progress}%</span>
							</div>
							<div className="w-full bg-white/10 rounded-full h-1.5">
								<div
									className="bg-blue-500 h-1.5 rounded-full transition-all"
									style={{ width: `${file.progress}%` }}
								/>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Error message */}
			{error && (
				<div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
					<X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
					<div className="flex-1">
						<p className="text-sm text-red-200">{error}</p>
					</div>
					<button
						type="button"
						onClick={() => setError(null)}
						className="text-red-400 hover:text-red-300"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			)}
		</div>
	);
}
