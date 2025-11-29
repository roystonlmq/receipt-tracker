/**
 * OAuth utility functions for Google authentication
 */

export interface GoogleOAuthConfig {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}

export interface GoogleTokens {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	token_type: string;
	id_token?: string;
}

export interface GoogleUser {
	sub: string; // Google user ID
	email: string;
	name: string;
	picture?: string;
	email_verified: boolean;
}

/**
 * Build Google OAuth authorization URL with PKCE
 */
export function buildGoogleAuthUrl(params: {
	clientId: string;
	redirectUri: string;
	codeChallenge: string;
	state: string;
}): string {
	const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

	url.searchParams.set("client_id", params.clientId);
	url.searchParams.set("redirect_uri", params.redirectUri);
	url.searchParams.set("response_type", "code");
	url.searchParams.set("scope", "openid email profile");
	url.searchParams.set("code_challenge", params.codeChallenge);
	url.searchParams.set("code_challenge_method", "S256");
	url.searchParams.set("state", params.state);
	url.searchParams.set("access_type", "offline");
	url.searchParams.set("prompt", "consent");

	return url.toString();
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(params: {
	code: string;
	codeVerifier: string;
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}): Promise<GoogleTokens> {
	const response = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code: params.code,
			client_id: params.clientId,
			client_secret: params.clientSecret,
			redirect_uri: params.redirectUri,
			grant_type: "authorization_code",
			code_verifier: params.codeVerifier,
		}),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			`Failed to exchange code for tokens: ${error.error_description || response.statusText}`,
		);
	}

	return await response.json();
}

/**
 * Get user information from Google using access token
 */
export async function getGoogleUserInfo(
	accessToken: string,
): Promise<GoogleUser> {
	const response = await fetch(
		"https://www.googleapis.com/oauth2/v3/userinfo",
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to get user info: ${response.statusText}`);
	}

	return await response.json();
}
