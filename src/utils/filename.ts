export interface ParsedFilename {
	date: string; // DDMMYY
	time: string; // HHMM
	name: string;
	isValid: boolean;
}

/**
 * Parse filename in "DDMMYY - HHMM - screenshot name.png" format
 * @param filename The filename to parse
 * @returns Parsed components or invalid result
 */
export function parseFilename(filename: string): ParsedFilename {
	// Remove file extension
	const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg)$/i, "");

	// Pattern: DDMMYY - HHMM - name
	const pattern = /^(\d{6})\s*-\s*(\d{4})\s*-\s*(.+)$/;
	const match = nameWithoutExt.match(pattern);

	if (!match) {
		return {
			date: "",
			time: "",
			name: "",
			isValid: false,
		};
	}

	const [, date, time, name] = match;

	// Validate date components
	const day = Number.parseInt(date.substring(0, 2), 10);
	const month = Number.parseInt(date.substring(2, 4), 10);
	const year = Number.parseInt(date.substring(4, 6), 10);

	if (day < 1 || day > 31 || month < 1 || month > 12) {
		return {
			date: "",
			time: "",
			name: "",
			isValid: false,
		};
	}

	// Validate time components
	const hour = Number.parseInt(time.substring(0, 2), 10);
	const minute = Number.parseInt(time.substring(2, 4), 10);

	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
		return {
			date: "",
			time: "",
			name: "",
			isValid: false,
		};
	}

	return {
		date,
		time,
		name: name.trim(),
		isValid: true,
	};
}

/**
 * Generate filename with current timestamp in "DDMMYY - HHMM - name.png" format
 * @param name The name part of the filename (default: "screenshot")
 * @returns Generated filename
 */
export function generateFilename(name = "screenshot"): string {
	const now = new Date();

	const day = now.getDate().toString().padStart(2, "0");
	const month = (now.getMonth() + 1).toString().padStart(2, "0");
	const year = now.getFullYear().toString().substring(2);

	const hour = now.getHours().toString().padStart(2, "0");
	const minute = now.getMinutes().toString().padStart(2, "0");

	return `${day}${month}${year} - ${hour}${minute} - ${name}.png`;
}

/**
 * Format DDMMYY for display
 * @param ddmmyy Date in DDMMYY format
 * @returns Formatted date string
 */
export function formatFolderDate(ddmmyy: string): string {
	// For now, return as-is. Can add separators later if needed
	// e.g., "271124" -> "27/11/24"
	if (ddmmyy.length !== 6) {
		return ddmmyy;
	}

	const day = ddmmyy.substring(0, 2);
	const month = ddmmyy.substring(2, 4);
	const year = ddmmyy.substring(4, 6);

	return `${day}/${month}/${year}`;
}

/**
 * Extract DDMMYY from filename or use current date
 * @param filename The filename to extract date from
 * @returns Date in DDMMYY format
 */
export function extractFolderDate(filename: string): string {
	const parsed = parseFilename(filename);

	if (parsed.isValid) {
		return parsed.date;
	}

	// Fallback to current date
	const now = new Date();
	const day = now.getDate().toString().padStart(2, "0");
	const month = (now.getMonth() + 1).toString().padStart(2, "0");
	const year = now.getFullYear().toString().substring(2);

	return `${day}${month}${year}`;
}
