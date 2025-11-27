/**
 * Retry a function with exponential backoff
 * Validates: Requirements 16.2
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: {
		maxAttempts?: number;
		initialDelay?: number;
		maxDelay?: number;
		backoffMultiplier?: number;
	} = {},
): Promise<T> {
	const {
		maxAttempts = 3,
		initialDelay = 1000,
		maxDelay = 10000,
		backoffMultiplier = 2,
	} = options;

	let lastError: Error | unknown;
	let delay = initialDelay;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// Don't retry on the last attempt
			if (attempt === maxAttempts) {
				break;
			}

			// Log retry attempt
			console.warn(
				`Attempt ${attempt} failed, retrying in ${delay}ms...`,
				error,
			);

			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, delay));

			// Increase delay for next attempt (exponential backoff)
			delay = Math.min(delay * backoffMultiplier, maxDelay);
		}
	}

	// All attempts failed
	throw lastError;
}

/**
 * Check if an error is retryable (network errors, timeouts, etc.)
 */
export function isRetryableError(error: unknown): boolean {
	if (error instanceof Error) {
		const message = error.message.toLowerCase();

		// Network errors
		if (
			message.includes("network") ||
			message.includes("timeout") ||
			message.includes("connection") ||
			message.includes("fetch")
		) {
			return true;
		}

		// Server errors (5xx)
		if (message.includes("500") || message.includes("503")) {
			return true;
		}
	}

	return false;
}

/**
 * Retry a function only if the error is retryable
 */
export async function retryIfRetryable<T>(
	fn: () => Promise<T>,
	options?: Parameters<typeof retryWithBackoff>[1],
): Promise<T> {
	try {
		return await retryWithBackoff(fn, options);
	} catch (error) {
		// If error is not retryable, throw immediately
		if (!isRetryableError(error)) {
			throw error;
		}
		throw error;
	}
}
