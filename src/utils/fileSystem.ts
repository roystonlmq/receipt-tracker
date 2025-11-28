/**
 * Utility functions for File System Access API with IndexedDB persistence
 * Provides persistent download directory functionality with fallback support
 */

const DB_NAME = "receipts-tracker-fs";
const DB_VERSION = 1;
const STORE_NAME = "directory-handles";
const DIRECTORY_KEY = "download-directory";

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
	return (
		"showDirectoryPicker" in window &&
		typeof (window as any).showDirectoryPicker === "function"
	);
}

/**
 * Open IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
	});
}

/**
 * Store directory handle in IndexedDB
 */
async function storeDirectoryHandle(
	handle: FileSystemDirectoryHandle,
): Promise<void> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.put(handle, DIRECTORY_KEY);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();

		transaction.oncomplete = () => db.close();
	});
}

/**
 * Retrieve directory handle from IndexedDB
 */
async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readonly");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.get(DIRECTORY_KEY);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result || null);

		transaction.oncomplete = () => db.close();
	});
}

/**
 * Request permission for a directory handle
 */
async function requestPermission(
	handle: FileSystemDirectoryHandle,
): Promise<boolean> {
	const options = { mode: "readwrite" as const };

	try {
		// Check if we already have permission
		if (typeof (handle as any).queryPermission === "function") {
			if ((await (handle as any).queryPermission(options)) === "granted") {
				return true;
			}
		}

		// Request permission
		if (typeof (handle as any).requestPermission === "function") {
			if ((await (handle as any).requestPermission(options)) === "granted") {
				return true;
			}
		}

		// If methods don't exist, assume we have permission (older API)
		return true;
	} catch (error) {
		console.error("Permission request failed:", error);
		return false;
	}
}

/**
 * Pick a directory using the File System Access API
 */
export async function pickDownloadDirectory(): Promise<FileSystemDirectoryHandle | null> {
	if (!isFileSystemAccessSupported()) {
		throw new Error("File System Access API is not supported in this browser");
	}

	try {
		const handle = await (window as any).showDirectoryPicker({
			mode: "readwrite",
			startIn: "downloads",
		});

		// Store the handle for future use
		await storeDirectoryHandle(handle);

		return handle;
	} catch (error) {
		// User cancelled or error occurred
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				// User cancelled - not an error
				return null;
			}
			if (error.name === "SecurityError") {
				throw new Error("Permission denied. Please allow access to select a download directory.");
			}
			if (error.name === "NotAllowedError") {
				throw new Error("Browser blocked the request. Please check your browser settings.");
			}
		}
		throw error;
	}
}

/**
 * Get the stored download directory handle with permission check
 */
export async function getDownloadDirectory(): Promise<FileSystemDirectoryHandle | null> {
	if (!isFileSystemAccessSupported()) {
		return null;
	}

	try {
		const handle = await getStoredDirectoryHandle();
		if (!handle) {
			return null;
		}

		// Verify we still have permission
		const hasPermission = await requestPermission(handle);
		if (!hasPermission) {
			// Permission denied - clear stored handle
			await clearStoredDirectory();
			return null;
		}

		return handle;
	} catch (error) {
		console.error("Failed to get stored directory:", error);
		// Clear invalid handle
		await clearStoredDirectory();
		return null;
	}
}

/**
 * Clear the stored directory handle
 */
export async function clearStoredDirectory(): Promise<void> {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.delete(DIRECTORY_KEY);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();

		transaction.oncomplete = () => db.close();
	});
}

/**
 * Save a file to the specified directory
 */
export async function saveFileToDirectory(
	directoryHandle: FileSystemDirectoryHandle,
	filename: string,
	content: Blob | string,
): Promise<void> {
	try {
		// Create or get the file
		const fileHandle = await directoryHandle.getFileHandle(filename, {
			create: true,
		});

		// Create a writable stream
		const writable = await fileHandle.createWritable();

		// Write the content
		if (typeof content === "string") {
			await writable.write(content);
		} else {
			await writable.write(content);
		}

		// Close the stream
		await writable.close();
	} catch (error) {
		console.error("Failed to save file:", error);
		
		if (error instanceof Error) {
			if (error.name === "NotAllowedError" || error.name === "SecurityError") {
				throw new Error("Permission denied. Please allow access to save files to the selected directory.");
			}
			if (error.name === "QuotaExceededError") {
				throw new Error("Not enough storage space available.");
			}
			if (error.name === "InvalidModificationError") {
				throw new Error(`Cannot save file: ${filename}. The file may be in use.`);
			}
		}
		
		throw new Error(`Failed to save file: ${filename}`);
	}
}

/**
 * Download file using traditional method (fallback)
 */
export function downloadFileFallback(
	filename: string,
	content: string | Blob,
	mimeType?: string,
): void {
	let blob: Blob;

	if (typeof content === "string") {
		// Check if it's a data URL
		if (content.startsWith("data:")) {
			// Create link directly with data URL
			const link = document.createElement("a");
			link.href = content;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			return;
		}

		// Create blob from string
		blob = new Blob([content], { type: mimeType || "text/plain" });
	} else {
		blob = content;
	}

	// Create object URL and download
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Download a file with persistent directory support
 * Falls back to traditional download if File System Access API is not available
 * Returns false if user cancels the directory picker
 */
export async function downloadFile(
	filename: string,
	content: string | Blob,
	mimeType?: string,
): Promise<{ success: boolean; usedPersistentDirectory: boolean; cancelled?: boolean }> {
	// Try to use persistent directory if supported
	if (isFileSystemAccessSupported()) {
		try {
			let directoryHandle = await getDownloadDirectory();

			// If no directory is stored or permission denied, ask user
			if (!directoryHandle) {
				directoryHandle = await pickDownloadDirectory();
				
				// User cancelled the directory picker - abort download
				if (!directoryHandle) {
					return { success: false, usedPersistentDirectory: false, cancelled: true };
				}
			}

			// If user selected a directory, save there
			if (directoryHandle) {
				// Convert data URL to blob if needed
				let blobContent: Blob;
				if (typeof content === "string" && content.startsWith("data:")) {
					// Extract base64 data from data URL
					const base64Data = content.split(",")[1];
					const binaryData = atob(base64Data);
					const bytes = new Uint8Array(binaryData.length);
					for (let i = 0; i < binaryData.length; i++) {
						bytes[i] = binaryData.charCodeAt(i);
					}
					blobContent = new Blob([bytes], {
						type: mimeType || "application/octet-stream",
					});
				} else if (typeof content === "string") {
					blobContent = new Blob([content], {
						type: mimeType || "text/plain",
					});
				} else {
					blobContent = content;
				}

				await saveFileToDirectory(directoryHandle, filename, blobContent);
				return { success: true, usedPersistentDirectory: true };
			}
		} catch (error) {
			console.error("Failed to use persistent directory:", error);
			// Fall through to traditional download
		}
	}

	// Fallback to traditional download
	downloadFileFallback(filename, content, mimeType);
	return { success: true, usedPersistentDirectory: false };
}
