/**
 * Cursor position utilities for textarea caret tracking
 */

/**
 * Represents the calculated position of the cursor in viewport coordinates
 */
export interface CursorPosition {
	/** Pixels from viewport top */
	top: number;
	/** Pixels from viewport left */
	left: number;
	/** Whether dropdown should appear below or above the cursor */
	placement: "below" | "above";
}

/**
 * Viewport dimensions and scroll position
 */
export interface ViewportBounds {
	/** Viewport width in pixels */
	width: number;
	/** Viewport height in pixels */
	height: number;
	/** Horizontal scroll offset */
	scrollX: number;
	/** Vertical scroll offset */
	scrollY: number;
}

/**
 * Get current viewport bounds
 */
export function getViewportBounds(): ViewportBounds {
	return {
		width: window.innerWidth,
		height: window.innerHeight,
		scrollX: window.scrollX,
		scrollY: window.scrollY,
	};
}

/**
 * Check if a position is near the bottom of the viewport
 * @param top - Y coordinate in viewport
 * @param threshold - Distance from bottom to consider "near" (default 300px)
 */
export function isNearBottomEdge(top: number, threshold = 300): boolean {
	const viewportHeight = window.innerHeight;
	return top > viewportHeight - threshold;
}

/**
 * Check if a position is near the right edge of the viewport
 * @param left - X coordinate in viewport
 * @param dropdownWidth - Width of the dropdown (default 256px)
 * @param threshold - Distance from edge to consider "near" (default 20px)
 */
export function isNearRightEdge(
	left: number,
	dropdownWidth = 256,
	threshold = 20,
): boolean {
	const viewportWidth = window.innerWidth;
	return left + dropdownWidth > viewportWidth - threshold;
}

/**
 * Adjust left position to keep dropdown within viewport bounds
 * @param left - Original left position
 * @param dropdownWidth - Width of the dropdown (default 256px)
 */
export function constrainToViewport(
	left: number,
	dropdownWidth = 256,
): number {
	const viewportWidth = window.innerWidth;
	const maxLeft = viewportWidth - dropdownWidth - 20; // 20px margin
	return Math.min(left, maxLeft);
}
