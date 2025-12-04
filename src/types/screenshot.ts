export interface Screenshot {
	id: number;
	userId: number;
	filename: string;
	originalFilename: string;
	imageData: string;
	mimeType: string;
	fileSize: number;
	captureDate: Date | null;
	uploadDate: Date;
	notes: string | null;
	folderDate: string;
	downloaded: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Folder {
	date: string; // DDMMYY format
	displayDate: string; // Formatted for display
	screenshotCount: number;
	screenshots: Screenshot[];
}

export interface UploadScreenshotInput {
	file: {
		name: string;
		type: string;
		size: number;
		data: string; // base64 encoded
	};
	userId: number;
	customFilename?: string;
}

export interface RenameScreenshotInput {
	id: number;
	userId: number;
	newFilename: string;
}

export interface DeleteScreenshotInput {
	id: number;
	userId: number;
}

export interface UpdateNotesInput {
	id: number;
	userId: number;
	notes: string;
}

export interface GetScreenshotsInput {
	userId: number;
	folderDate?: string;
	searchQuery?: string;
}

export interface BatchDeleteInput {
	ids: number[];
	userId: number;
}

export interface BatchMoveInput {
	ids: number[];
	userId: number;
	targetFolderDate: string; // DDMMYY format
}

export interface DownloadInput {
	id: number;
	userId: number;
}
