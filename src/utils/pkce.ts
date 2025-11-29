import crypto from "node:crypto";

/**
 * Generate a cryptographically secure code verifier for PKCE
 * Returns a base64url-encoded random string (128 characters)
 */
export function generateCodeVerifier(): string {
	// Generate 96 random bytes (will be 128 chars when base64url encoded)
	const randomBytes = crypto.randomBytes(96);
	return base64UrlEncode(randomBytes);
}

/**
 * Generate a code challenge from a code verifier using SHA-256
 * @param verifier The code verifier to hash
 * @returns Base64url-encoded SHA-256 hash of the verifier
 */
export async function generateCodeChallenge(
	verifier: string,
): Promise<string> {
	// Create SHA-256 hash of the verifier
	const hash = crypto.createHash("sha256").update(verifier).digest();
	return base64UrlEncode(hash);
}

/**
 * Base64url encode a buffer (URL-safe base64 without padding)
 * @param buffer Buffer to encode
 * @returns Base64url-encoded string
 */
function base64UrlEncode(buffer: Buffer): string {
	return buffer
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
}
