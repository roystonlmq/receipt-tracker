import { createServerFn } from "@tanstack/react-start";
import { Client } from "pg";
import { generateCodeVerifier, generateCodeChallenge } from "@/utils/pkce";
import {
	buildGoogleAuthUrl,
	exchangeCodeForTokens,
	getGoogleUserInfo,
} from "@/utils/oauth";
import {
	createSession,
	getSession,
	deleteSession,
	storeTempSession,
	getTempSession,
	deleteTempSession,
} from "@/server/sessions";

export interface AuthenticatedUser {
	id: number;
	name: string;
	email: string;
	picture?: string;
}

export interface GoogleCallbackInput {
	code?: string;
	state?: string;
	error?: string;
}

/**
 * Initiate Google OAuth flow
 * Generates PKCE parameters and returns Google OAuth URL
 */
export const initiateGoogleAuth = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			// Check if OAuth is configured
			const clientId = process.env.GOOGLE_CLIENT_ID;
			const redirectUri = process.env.GOOGLE_REDIRECT_URI;

			if (!clientId || !redirectUri) {
				return {
					success: false,
					error: "Google OAuth is not configured. Please contact administrator.",
				};
			}

			// Generate PKCE code verifier and challenge
			const codeVerifier = generateCodeVerifier();
			const codeChallenge = await generateCodeChallenge(codeVerifier);

			// Store code verifier in temporary session
			const state = await storeTempSession(codeVerifier);

			// Build Google OAuth URL
			const authUrl = buildGoogleAuthUrl({
				clientId,
				redirectUri,
				codeChallenge,
				state,
			});

			return { success: true, authUrl };
		} catch (error) {
			console.error("Failed to initiate Google auth:", error);
			return {
				success: false,
				error: "Failed to start authentication. Please try again.",
			};
		}
	},
);

/**
 * Handle Google OAuth callback
 * Exchanges authorization code for tokens and creates session
 */
export const handleGoogleCallback = createServerFn({ method: "GET" })
	.inputValidator((input: GoogleCallbackInput) => input)
	.handler(async ({ data }) => {
		const { code, state, error } = data;

		// Handle OAuth errors
		if (error) {
			return {
				success: false,
				error:
					error === "access_denied"
						? "Authentication cancelled"
						: "Authentication failed",
			};
		}

		if (!code || !state) {
			return { success: false, error: "Invalid callback parameters" };
		}

		try {
			// Retrieve code verifier from temp session
			const codeVerifier = await getTempSession(state);
			if (!codeVerifier) {
				return {
					success: false,
					error: "Invalid or expired authentication request",
				};
			}

			// Get OAuth configuration
			const clientId = process.env.GOOGLE_CLIENT_ID;
			const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
			const redirectUri = process.env.GOOGLE_REDIRECT_URI;

			if (!clientId || !clientSecret || !redirectUri) {
				return {
					success: false,
					error: "Google OAuth is not configured properly",
				};
			}

			// Exchange code for tokens
			const tokens = await exchangeCodeForTokens({
				code,
				codeVerifier,
				clientId,
				clientSecret,
				redirectUri,
			});

			// Get user info from Google
			const googleUser = await getGoogleUserInfo(tokens.access_token);

			// Create or update user in database
			const user = await upsertUser({
				googleId: googleUser.sub,
				email: googleUser.email,
				name: googleUser.name,
				picture: googleUser.picture,
			});

			// Create session
			const session = await createSession(user.id);

			// Clean up temp session
			await deleteTempSession(state);

			return {
				success: true,
				redirectTo: "/screenshots",
				sessionId: session.id, // Return session ID to store in localStorage
			};
		} catch (error) {
			console.error("OAuth callback failed:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Authentication failed. Please try again.",
			};
		}
	});

/**
 * Get current authenticated user
 * Validates session and returns user information
 */
export const getCurrentUser = createServerFn({ method: "GET" })
	.inputValidator((input: { sessionId?: string }) => input)
	.handler(async ({ data }) => {
		try {
			// Development mode bypass
			if (process.env.DEV_MODE === "true") {
				const devUserId = Number.parseInt(process.env.DEV_USER_ID || "1", 10);
				const user = await getUserById(devUserId);

				if (user) {
					return {
						authenticated: true,
						devMode: true,
						user: {
							id: user.id,
							name: user.name,
							email: user.email,
							picture: user.picture,
						},
					};
				}
			}

			// Get session ID from input (passed from client localStorage)
			const sessionId = data.sessionId;

			if (!sessionId) {
				return { authenticated: false };
			}

			// Validate session
			const session = await getSession(sessionId);

			if (!session) {
				return { authenticated: false };
			}

			// Get user info
			const user = await getUserById(session.userId);

			if (!user) {
				return { authenticated: false };
			}

			return {
				authenticated: true,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					picture: user.picture,
				},
			};
		} catch (error) {
			console.error("Failed to get current user:", error);
			return { authenticated: false };
		}
	});

/**
 * Sign out current user
 * Deletes session and clears localStorage
 */
export const signOut = createServerFn({ method: "POST" })
	.inputValidator((input: { sessionId?: string }) => input)
	.handler(async ({ data }) => {
		try {
			// Get session ID from input
			const sessionId = data.sessionId;

			if (sessionId) {
				// Delete session from database
				await deleteSession(sessionId);
			}

			return { success: true };
		} catch (error) {
			console.error("Sign out failed:", error);
			return { success: false, error: "Failed to sign out" };
		}
	});

/**
 * Create or update user from Google OAuth data
 */
async function upsertUser(data: {
	googleId: string;
	email: string;
	name: string;
	picture?: string;
}): Promise<{ id: number; name: string; email: string; picture?: string }> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		// Check if user exists by google_id
		let result = await client.query(
			`SELECT id, name, email, picture FROM users WHERE google_id = $1`,
			[data.googleId],
		);

		if (result.rows.length > 0) {
			// User exists, update name and picture
			result = await client.query(
				`UPDATE users 
				 SET name = $1, picture = $2, updated_at = NOW()
				 WHERE google_id = $3
				 RETURNING id, name, email, picture`,
				[data.name, data.picture, data.googleId],
			);
			return result.rows[0];
		}

		// Check if user exists by email (for migration)
		result = await client.query(
			`SELECT id, name, email, picture FROM users WHERE email = $1`,
			[data.email],
		);

		if (result.rows.length > 0) {
			// User exists by email, add google_id
			result = await client.query(
				`UPDATE users 
				 SET google_id = $1, name = $2, picture = $3, updated_at = NOW()
				 WHERE email = $4
				 RETURNING id, name, email, picture`,
				[data.googleId, data.name, data.picture, data.email],
			);
			return result.rows[0];
		}

		// Create new user
		result = await client.query(
			`INSERT INTO users (google_id, email, name, picture)
			 VALUES ($1, $2, $3, $4)
			 RETURNING id, name, email, picture`,
			[data.googleId, data.email, data.name, data.picture],
		);

		return result.rows[0];
	} finally {
		await client.end();
	}
}

/**
 * Get user by ID
 */
async function getUserById(
	userId: number,
): Promise<{ id: number; name: string; email: string; picture?: string } | null> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		const result = await client.query(
			`SELECT id, name, email, picture FROM users WHERE id = $1`,
			[userId],
		);

		if (result.rows.length === 0) {
			return null;
		}

		return result.rows[0];
	} finally {
		await client.end();
	}
}

/**
 * Check if AI features are available (for development mode)
 */
export const checkAuthAvailability = createServerFn({ method: "GET" }).handler(
	async () => {
		const isConfigured =
			!!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

		const devMode = process.env.DEV_MODE === "true";

		return {
			available: isConfigured || devMode,
			devMode,
		};
	},
);
