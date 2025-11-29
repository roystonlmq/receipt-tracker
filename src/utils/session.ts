import crypto from "node:crypto";

/**
 * Generate a cryptographically secure session ID
 * Returns a 64-character hexadecimal string
 */
export function generateSessionId(): string {
	return crypto.randomBytes(32).toString("hex");
}

/**
 * Session cookie configuration
 */
export interface SessionCookieOptions {
	sessionId: string;
	maxAge?: number; // in seconds
}

/**
 * Serialize a session cookie with security flags
 */
export function serializeSessionCookie(
	options: SessionCookieOptions,
): string {
	const { sessionId, maxAge = 30 * 24 * 60 * 60 } = options; // Default 30 days

	const cookieParts = [
		`session_id=${sessionId}`,
		`Max-Age=${maxAge}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
	];

	// Add Secure flag in production
	if (process.env.NODE_ENV === "production") {
		cookieParts.push("Secure");
	}

	return cookieParts.join("; ");
}

/**
 * Parse session ID from cookie header
 */
export function getSessionIdFromCookie(cookieHeader: string | null): string | null {
	if (!cookieHeader) {
		return null;
	}

	const cookies = parseCookies(cookieHeader);
	return cookies.session_id || null;
}

/**
 * Create a cookie string to clear the session
 */
export function clearSessionCookie(): string {
	const cookieParts = [
		"session_id=",
		"Max-Age=0",
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
	];

	if (process.env.NODE_ENV === "production") {
		cookieParts.push("Secure");
	}

	return cookieParts.join("; ");
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
	const cookies: Record<string, string> = {};

	for (const cookie of cookieHeader.split(";")) {
		const [name, ...rest] = cookie.trim().split("=");
		if (name && rest.length > 0) {
			cookies[name] = rest.join("=");
		}
	}

	return cookies;
}
