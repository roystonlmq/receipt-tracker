import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Download, Trash2, Check } from "lucide-react";
import { KeyboardHint } from "./KeyboardHint";

interface ViewerHeaderProps {
	filename: string;
	uploadDate: Date;
	fileSize: number;
	downloaded: boolean;
	isDownloading: boolean;
	isDeleting: boolean;
	onRename: (newName: string) => void;
	onDownload: () => void;
	onDelete: () => void;
	onToggleDownloadStatus: () => void;
	onClose: () => void;
}

export interface ViewerHeaderRef {
	startRename: () => void;
}

export const ViewerHeader = forwardRef<ViewerHeaderRef, ViewerHeaderProps>(
	(
		{
			filename,
			uploadDate,
			fileSize,
			downloaded,
			isDownloading,
			isDeleting,
			onRename,
			onDownload,
			onDelete,
			onToggleDownloadStatus,
			onClose,
		},
		ref,
	) => {
	const [isRenaming, setIsRenaming] = useState(false);
	const [editedName, setEditedName] = useState(filename);
	const inputRef = useRef<HTMLInputElement>(null);

	// Expose startRename method to parent
	useImperativeHandle(ref, () => ({
		startRename: () => setIsRenaming(true),
	}));

	// Focus input when entering rename mode
	useEffect(() => {
		if (isRenaming && inputRef.current) {
			inputRef.current.focus();
			// Select filename without extension
			const lastDotIndex = editedName.lastIndexOf(".");
			if (lastDotIndex > 0) {
				inputRef.current.setSelectionRange(0, lastDotIndex);
			} else {
				inputRef.current.select();
			}
		}
	}, [isRenaming, editedName]);

	const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			handleSaveRename();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			handleCancelRename();
		}
	};

	const handleSaveRename = () => {
		const trimmedName = editedName.trim();
		if (trimmedName && trimmedName !== filename) {
			onRename(trimmedName);
		}
		setIsRenaming(false);
	};

	const handleCancelRename = () => {
		setEditedName(filename);
		setIsRenaming(false);
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

	return (
		<div
			className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="flex-1 min-w-0">
				{isRenaming ? (
					<input
						ref={inputRef}
						type="text"
						value={editedName}
						onChange={(e) => setEditedName(e.target.value)}
						onKeyDown={handleRenameKeyDown}
						onBlur={handleSaveRename}
						className="text-lg font-semibold text-white bg-white/10 border border-white/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full max-w-2xl"
					/>
				) : (
					<button
						type="button"
						onClick={() => setIsRenaming(true)}
						className="text-lg font-semibold text-white truncate hover:text-blue-400 transition-colors text-left group flex items-center gap-2"
					>
						<span className="truncate">{filename}</span>
						<KeyboardHint
							keys="F2"
							variant="compact"
							className="opacity-0 group-hover:opacity-60 transition-opacity"
						/>
					</button>
				)}
				<div className="flex items-center gap-4 text-sm text-white/60 mt-1">
					<span>Uploaded: {formatDate(uploadDate)}</span>
					<span>Size: {formatFileSize(fileSize)}</span>
				</div>
			</div>

			<div className="flex items-center gap-2 ml-4">
				{/* Download status checkmark */}
				<button
					type="button"
					onClick={onToggleDownloadStatus}
					className={`p-2 rounded-lg transition-colors ${
						downloaded
							? "bg-green-600/20 hover:bg-green-600/30 text-green-400"
							: "bg-white/5 hover:bg-white/10 text-white/40"
					}`}
					aria-label={
						downloaded ? "Mark as not downloaded" : "Mark as downloaded"
					}
					title={downloaded ? "Downloaded" : "Not downloaded"}
				>
					<Check className="w-5 h-5" />
				</button>

				{/* Download button with keyboard hint */}
				<button
					type="button"
					onClick={onDownload}
					disabled={isDownloading}
					className="flex items-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors group"
					aria-label={`Download screenshot (${isDownloading ? "downloading" : "Ctrl+D"})`}
					title="Download (Ctrl+D)"
				>
					<Download className="w-5 h-5" />
					{!isDownloading && (
						<KeyboardHint
							keys={["Ctrl", "D"]}
							variant="compact"
							className="opacity-70 group-hover:opacity-100 transition-opacity"
						/>
					)}
				</button>

				{/* Delete button with DEL hint */}
				<button
					type="button"
					onClick={onDelete}
					disabled={isDeleting}
					className="flex items-center gap-2 p-2 hover:bg-red-600/20 rounded-lg transition-colors group"
					aria-label="Delete screenshot (DEL key)"
				>
					<Trash2 className="w-5 h-5 text-red-500" />
					<KeyboardHint
						keys="DEL"
						variant="compact"
						className="opacity-60 group-hover:opacity-100 transition-opacity"
					/>
				</button>

				{/* Close button with ESC hint */}
				<button
					type="button"
					onClick={onClose}
					className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors group"
					aria-label="Close viewer (ESC key)"
				>
					<KeyboardHint
						keys="ESC"
						variant="compact"
						className="opacity-80 group-hover:opacity-100 transition-opacity"
					/>
				</button>
			</div>
		</div>
	);
	},
);
