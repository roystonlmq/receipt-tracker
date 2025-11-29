import { useCallback, useEffect, useState, type RefObject } from "react";
import getCaretCoordinates from "textarea-caret";
import type { CursorPosition } from "@/utils/cursorPosition";
import {
	isNearBottomEdge,
	isNearRightEdge,
	constrainToViewport,
} from "@/utils/cursorPosition";

export interface UseCursorPositionOptions {
	/** Reference to the textarea element */
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	/** Whether cursor position tracking is enabled */
	enabled: boolean;
}

/**
 * Hook for tracking cursor position in a textarea
 * Returns viewport-relative coordinates for positioning a dropdown at the cursor
 *
 * @param options - Configuration options
 * @returns Cursor position or null if calculation fails/disabled
 */
export function useCursorPosition(
	options: UseCursorPositionOptions,
): CursorPosition | null {
	const { textareaRef, enabled } = options;
	const [position, setPosition] = useState<CursorPosition | null>(null);

	const calculatePosition = useCallback(() => {
		if (!enabled || !textareaRef.current) {
			setPosition(null);
			return;
		}

		try {
			const textarea = textareaRef.current;
			const cursorIndex = textarea.selectionStart;

			// Use textarea-caret to get cursor coordinates relative to textarea
			const coordinates = getCaretCoordinates(textarea, cursorIndex);

			// Get textarea's position in viewport
			const textareaRect = textarea.getBoundingClientRect();

			// Convert to viewport coordinates
			let top = textareaRect.top + coordinates.top;
			let left = textareaRect.left + coordinates.left;

			// Determine placement (above or below cursor)
			const placement = isNearBottomEdge(top) ? "above" : "below";

			// Adjust for placement
			if (placement === "below") {
				top += coordinates.height + 4; // 4px below cursor
			} else {
				top -= 4; // 4px above cursor (dropdown will transform up)
			}

			// Constrain to viewport horizontally
			if (isNearRightEdge(left)) {
				left = constrainToViewport(left);
			}

			setPosition({ top, left, placement });
		} catch (error) {
			console.warn("[useCursorPosition] Failed to calculate cursor position:", error);
			setPosition(null);
		}
	}, [enabled, textareaRef]);

	// Recalculate on enabled state change with debouncing
	useEffect(() => {
		if (!enabled) {
			setPosition(null);
			return;
		}

		// Debounce calculation by 100ms
		const timeoutId = setTimeout(() => {
			calculatePosition();
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [enabled, calculatePosition]);

	return position;
}
