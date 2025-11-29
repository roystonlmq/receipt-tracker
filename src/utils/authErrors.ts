/**
 * Authentication error codes and user-friendly messages
 */

export interface AuthError {
	code: string;
	message: string;
	action?: string;
}

/**
 * OAuth error codes from Google
 */
export const OAUTH_ERRORS: Record<string, AuthError> = {
	access_denied: {
		code: "access_denied",
		message: "You cancelled the sign-in process.",
		action: "Please try signing in again to access the application.",
	},
	invalid_request: {
		code: "invalid_request",
		message: "The authentication request was invalid.",
		action: "Please try again or contact support if the problem persists.",
	},
	unauthorized_client: {
		code: "unauthorized_client",
		message: "This application is not authorized.",
		action: "Please contact the administrator.",
	},
	invalid_grant: {
		code: "invalid_grant",
		message: "The authorization code is invalid or expired.",
		action: "Please try signing in again.",
	},
	server_error: {
		code: "server_error",
		message: "Google's authentication service encountered an error.",
		action: "Please try again in a few moments.",
	},
	temporarily_unavailable: {
		code: "temporarily_unavailable",
		message: "The authentication service is temporarily unavailable.",
		action: "Please try again in a few moments.",
	},
};

/**
 * Session error codes
 */
export const SESSION_ERRORS: Record<string, AuthError> = {
	session_expired: {
		code: "session_expired",
		message: "Your session has expired.",
		action: "Please sign in again to continue.",
	},
	session_invalid: {
		code: "session_invalid",
		message: "Your session is invalid.",
		action: "Please sign in again.",
	},
	session_not_found: {
		code: "session_not_found",
		message: "No active session found.",
		action: "Please sign in to access the application.",
	},
	state_mismatch: {
		code: "state_mismatch",
		message: "Invalid authentication state.",
		action: "Please try signing in again.",
	},
};

/**
 * Network and configuration errors
 */
export const SYSTEM_ERRORS: Record<string, AuthError> = {
	network_error: {
		code: "network_error",
		message: "Connection error. Please check your internet connection.",
		action: "Try again once you're back online.",
	},
	config_missing: {
		code: "config_missing",
		message: "Authentication is not configured.",
		action: "Please contact the administrator.",
	},
	unknown_error: {
		code: "unknown_error",
		message: "An unexpected error occurred.",
		action: "Please try again or contact support if the problem persists.",
	},
};

/**
 * Get user-friendly error message for an error code
 */
export function getAuthError(errorCode: string): AuthError {
	// Check OAuth errors
	if (OAUTH_ERRORS[errorCode]) {
		return OAUTH_ERRORS[errorCode];
	}

	// Check session errors
	if (SESSION_ERRORS[errorCode]) {
		return SESSION_ERRORS[errorCode];
	}

	// Check system errors
	if (SYSTEM_ERRORS[errorCode]) {
		return SYSTEM_ERRORS[errorCode];
	}

	// Default to unknown error
	return SYSTEM_ERRORS.unknown_error;
}

/**
 * Format error for display
 */
export function formatAuthError(error: string | AuthError): {
	message: string;
	action?: string;
} {
	if (typeof error === "string") {
		const authError = getAuthError(error);
		return {
			message: authError.message,
			action: authError.action,
		};
	}

	return {
		message: error.message,
		action: error.action,
	};
}
