/**
 * Utility functions for managing URL parameters
 */

export interface ScreenshotUrlParams {
	screenshot?: number;
	folder?: string;
	query?: string;
}

/**
 * Parse screenshot URL parameters from search params
 */
export function parseScreenshotParams(
	search: Record<string, unknown>,
): ScreenshotUrlParams {
	const screenshotParam = search.screenshot;
	let screenshot: number | undefined;
	
	if (screenshotParam && screenshotParam !== "") {
		const num = Number(screenshotParam);
		screenshot = Number.isNaN(num) ? undefined : num;
	}
	
	return {
		screenshot,
		folder: (search.folder as string) || undefined,
		query: (search.query as string) || undefined,
	};
}

/**
 * Build URL search params from screenshot params
 */
export function buildScreenshotParams(
	params: ScreenshotUrlParams,
): Record<string, string> {
	const result: Record<string, string> = {};

	if (params.screenshot !== undefined) {
		result.screenshot = params.screenshot.toString();
	}
	if (params.folder) {
		result.folder = params.folder;
	}
	if (params.query) {
		result.query = params.query;
	}

	return result;
}

/**
 * Validate screenshot ID
 */
export function isValidScreenshotId(id: unknown): id is number {
	if (typeof id === "number") {
		return Number.isInteger(id) && id > 0;
	}
	if (typeof id === "string") {
		const num = Number(id);
		return !Number.isNaN(num) && Number.isInteger(num) && num > 0;
	}
	return false;
}

/**
 * Add screenshot ID to current URL params
 */
export function addScreenshotToParams(
	currentParams: ScreenshotUrlParams,
	screenshotId: number,
): ScreenshotUrlParams {
	return {
		...currentParams,
		screenshot: screenshotId,
	};
}

/**
 * Remove screenshot ID from current URL params
 */
export function removeScreenshotFromParams(
	currentParams: ScreenshotUrlParams,
): ScreenshotUrlParams {
	const { screenshot, ...rest } = currentParams;
	return rest;
}
