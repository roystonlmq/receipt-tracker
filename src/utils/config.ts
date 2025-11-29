/**
 * Configuration validation utilities
 */

export interface ConfigValidationResult {
	valid: boolean;
	missing: string[];
	errors: string[];
}

/**
 * Required environment variables for OAuth
 */
const REQUIRED_OAUTH_VARS = [
	"GOOGLE_CLIENT_ID",
	"GOOGLE_CLIENT_SECRET",
	"GOOGLE_REDIRECT_URI",
];

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(): ConfigValidationResult {
	const missing: string[] = [];
	const errors: string[] = [];

	// Check for required environment variables
	for (const varName of REQUIRED_OAUTH_VARS) {
		const value = process.env[varName];
		if (!value || value.trim() === "") {
			missing.push(varName);
		}
	}

	// Validate redirect URI format
	const redirectUri = process.env.GOOGLE_REDIRECT_URI;
	if (redirectUri && !isValidUrl(redirectUri)) {
		errors.push(
			`GOOGLE_REDIRECT_URI must be a valid URL (got: ${redirectUri})`,
		);
	}

	// Validate client ID format (should end with .apps.googleusercontent.com)
	const clientId = process.env.GOOGLE_CLIENT_ID;
	if (clientId && !clientId.includes(".apps.googleusercontent.com")) {
		errors.push(
			"GOOGLE_CLIENT_ID should be from Google Cloud Console (ends with .apps.googleusercontent.com)",
		);
	}

	return {
		valid: missing.length === 0 && errors.length === 0,
		missing,
		errors,
	};
}

/**
 * Check if OAuth is configured (allows dev mode bypass)
 */
export function isOAuthConfigured(): boolean {
	// Allow dev mode to bypass OAuth config
	if (process.env.DEV_MODE === "true") {
		return true;
	}

	const result = validateOAuthConfig();
	return result.valid;
}

/**
 * Get setup instructions for missing configuration
 */
export function getSetupInstructions(
	validation: ConfigValidationResult,
): string {
	const lines: string[] = [];

	lines.push("Google OAuth is not properly configured.");
	lines.push("");

	if (validation.missing.length > 0) {
		lines.push("Missing environment variables:");
		for (const varName of validation.missing) {
			lines.push(`  - ${varName}`);
		}
		lines.push("");
	}

	if (validation.errors.length > 0) {
		lines.push("Configuration errors:");
		for (const error of validation.errors) {
			lines.push(`  - ${error}`);
		}
		lines.push("");
	}

	lines.push("Setup instructions:");
	lines.push("1. Create a project in Google Cloud Console");
	lines.push("2. Enable Google+ API");
	lines.push("3. Create OAuth 2.0 credentials");
	lines.push("4. Add authorized redirect URIs");
	lines.push("5. Copy Client ID and Client Secret to .env.local");
	lines.push("");
	lines.push("Example .env.local:");
	lines.push('GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"');
	lines.push('GOOGLE_CLIENT_SECRET="your-client-secret"');
	lines.push('GOOGLE_REDIRECT_URI="http://localhost:3000/auth/callback"');
	lines.push("");
	lines.push("For development without OAuth, set:");
	lines.push('DEV_MODE="true"');
	lines.push('DEV_USER_ID="1"');

	return lines.join("\n");
}

/**
 * Log configuration status on startup
 */
export function logConfigStatus(): void {
	const validation = validateOAuthConfig();

	if (process.env.DEV_MODE === "true") {
		console.warn("⚠️  Development mode is enabled - authentication is bypassed");
		console.warn(
			`   Using DEV_USER_ID: ${process.env.DEV_USER_ID || "1"}`,
		);
		return;
	}

	if (validation.valid) {
		console.log("✓ Google OAuth is configured");
		return;
	}

	console.error("✗ Google OAuth configuration is invalid");
	console.error(getSetupInstructions(validation));
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
