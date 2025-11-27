const VALID_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate image file type and size
 * @param file The file to validate
 * @returns true if valid, false otherwise
 */
export function validateImageFile(file: File): boolean {
	// Check mime type
	if (!VALID_MIME_TYPES.includes(file.type.toLowerCase())) {
		return false;
	}

	// Check file size
	if (file.size > MAX_FILE_SIZE) {
		return false;
	}

	return true;
}

/**
 * Generate optimized thumbnail from image
 * @param imageData Base64 encoded image data
 * @param maxWidth Maximum width (default: 300)
 * @param maxHeight Maximum height (default: 300)
 * @returns Base64 encoded thumbnail
 */
export async function generateThumbnail(
	imageData: string,
	maxWidth = 300,
	maxHeight = 300,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			// Calculate new dimensions maintaining aspect ratio
			let width = img.width;
			let height = img.height;

			if (width > height) {
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}
			} else {
				if (height > maxHeight) {
					width = (width * maxHeight) / height;
					height = maxHeight;
				}
			}

			// Create canvas and draw resized image
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0, width, height);

			// Convert to base64
			const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
			resolve(thumbnail);
		};

		img.onerror = () => {
			reject(new Error("Failed to load image"));
		};

		img.src = imageData;
	});
}

/**
 * Convert File to base64 string
 * @param file The file to convert
 * @returns Base64 encoded string
 */
export async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("Failed to read file as base64"));
			}
		};

		reader.onerror = () => {
			reject(new Error("Failed to read file"));
		};

		reader.readAsDataURL(file);
	});
}

export interface ExifData {
	captureDate: Date | null;
}

/**
 * Extract EXIF metadata from image file
 * Note: This is a placeholder. For production, use a library like exif-js
 * @param _file The image file
 * @returns EXIF data or null
 */
export async function extractExifData(_file: File): Promise<ExifData | null> {
	// Placeholder implementation
	// In production, use a library like exif-js to extract actual EXIF data
	return {
		captureDate: null,
	};
}
