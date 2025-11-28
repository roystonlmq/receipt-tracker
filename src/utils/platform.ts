export type Platform = "mac" | "windows" | "linux" | "unknown";

export interface PlatformInfo {
	platform: Platform;
	isMac: boolean;
	isWindows: boolean;
	isLinux: boolean;
	modifierKey: "Cmd" | "Ctrl";
	modifierSymbol: "⌘" | "Ctrl";
}

let cachedPlatform: PlatformInfo | null = null;

/**
 * Reset the cached platform (for testing purposes)
 * @internal
 */
export function resetPlatformCache(): void {
	cachedPlatform = null;
}

/**
 * Detect the user's operating system platform
 * Uses navigator.platform and falls back to user agent parsing
 */
export function detectPlatform(): PlatformInfo {
	if (cachedPlatform) {
		return cachedPlatform;
	}

	let platform: Platform = "unknown";

	// Try navigator.platform first (most reliable)
	if (typeof navigator !== "undefined") {
		const navPlatform = navigator.platform || "";
		const userAgent = navigator.userAgent || "";

		// Check for Mac
		if (/Mac|iPhone|iPad|iPod/.test(navPlatform) || /Macintosh/.test(userAgent)) {
			platform = "mac";
		}
		// Check for Windows
		else if (/Win/.test(navPlatform) || /Windows/.test(userAgent)) {
			platform = "windows";
		}
		// Check for Linux
		else if (/Linux/.test(navPlatform) || /Linux/.test(userAgent)) {
			platform = "linux";
		}
	}

	const isMac = platform === "mac";
	const isWindows = platform === "windows";
	const isLinux = platform === "linux";

	cachedPlatform = {
		platform,
		isMac,
		isWindows,
		isLinux,
		modifierKey: isMac ? "Cmd" : "Ctrl",
		modifierSymbol: isMac ? "⌘" : "Ctrl",
	};

	return cachedPlatform;
}

/**
 * Get cached platform information
 * Calls detectPlatform() if not already cached
 */
export function getPlatform(): PlatformInfo {
	return detectPlatform();
}

/**
 * Format a keyboard shortcut with the correct modifier key for the platform
 * @param key - The key to format (e.g., "D", "S", "K")
 * @param useSymbol - Whether to use symbol (⌘) or text (Cmd) for Mac
 * @returns Formatted shortcut string (e.g., "Cmd+D" or "⌘+D" or "Ctrl+D")
 */
export function formatShortcut(key: string, useSymbol = false): string {
	const platform = getPlatform();
	const modifier = useSymbol ? platform.modifierSymbol : platform.modifierKey;
	return `${modifier}+${key}`;
}
