import { Client } from "pg";
import { generateSessionId } from "@/utils/session";

export interface Session {
	id: string;
	userId: number;
	expiresAt: Date;
	createdAt: Date;
}

export interface TempSession {
	id: string;
	codeVerifier: string;
	expiresAt: Date;
	createdAt: Date;
}

/**
 * Create a new session for a user
 * @param userId The user ID to create a session for
 * @param expiresInDays Number of days until session expires (default 30)
 * @returns The created session
 */
export async function createSession(
	userId: number,
	expiresInDays = 30,
): Promise<Session> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		const sessionId = generateSessionId();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + expiresInDays);

		const result = await client.query(
			`INSERT INTO sessions (id, user_id, expires_at)
			 VALUES ($1, $2, $3)
			 RETURNING id, user_id as "userId", expires_at as "expiresAt", created_at as "createdAt"`,
			[sessionId, userId, expiresAt],
		);

		return result.rows[0];
	} finally {
		await client.end();
	}
}

/**
 * Get a session by ID
 * @param sessionId The session ID to retrieve
 * @returns The session if found and not expired, null otherwise
 */
export async function getSession(
	sessionId: string,
): Promise<Session | null> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		const result = await client.query(
			`SELECT id, user_id as "userId", expires_at as "expiresAt", created_at as "createdAt"
			 FROM sessions
			 WHERE id = $1`,
			[sessionId],
		);

		if (result.rows.length === 0) {
			return null;
		}

		const session = result.rows[0];

		// Check if session is expired
		if (new Date(session.expiresAt) < new Date()) {
			// Session expired, delete it
			await deleteSession(sessionId);
			return null;
		}

		return session;
	} finally {
		await client.end();
	}
}

/**
 * Delete a session
 * @param sessionId The session ID to delete
 */
export async function deleteSession(sessionId: string): Promise<void> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		await client.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
	} finally {
		await client.end();
	}
}

/**
 * Store a temporary session for OAuth flow (stores PKCE code verifier)
 * @param codeVerifier The PKCE code verifier to store
 * @param expiresInMinutes Number of minutes until temp session expires (default 10)
 * @returns The temporary session ID (state parameter)
 */
export async function storeTempSession(
	codeVerifier: string,
	expiresInMinutes = 10,
): Promise<string> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		const tempSessionId = generateSessionId();
		const expiresAt = new Date();
		expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

		await client.query(
			`INSERT INTO temp_sessions (id, code_verifier, expires_at)
			 VALUES ($1, $2, $3)`,
			[tempSessionId, codeVerifier, expiresAt],
		);

		return tempSessionId;
	} finally {
		await client.end();
	}
}

/**
 * Get a temporary session by ID
 * @param tempSessionId The temporary session ID (state parameter)
 * @returns The code verifier if found and not expired, null otherwise
 */
export async function getTempSession(
	tempSessionId: string,
): Promise<string | null> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		const result = await client.query(
			`SELECT code_verifier as "codeVerifier", expires_at as "expiresAt"
			 FROM temp_sessions
			 WHERE id = $1`,
			[tempSessionId],
		);

		if (result.rows.length === 0) {
			return null;
		}

		const tempSession = result.rows[0];

		// Check if temp session is expired
		if (new Date(tempSession.expiresAt) < new Date()) {
			// Temp session expired, delete it
			await deleteTempSession(tempSessionId);
			return null;
		}

		return tempSession.codeVerifier;
	} finally {
		await client.end();
	}
}

/**
 * Delete a temporary session
 * @param tempSessionId The temporary session ID to delete
 */
export async function deleteTempSession(tempSessionId: string): Promise<void> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		await client.query(`DELETE FROM temp_sessions WHERE id = $1`, [
			tempSessionId,
		]);
	} finally {
		await client.end();
	}
}

/**
 * Clean up expired sessions and temporary sessions
 * Should be run periodically (e.g., hourly)
 */
export async function cleanupExpiredSessions(): Promise<{
	sessionsDeleted: number;
	tempSessionsDeleted: number;
}> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL!,
	});

	try {
		await client.connect();

		// Delete expired sessions
		const sessionsResult = await client.query(
			`DELETE FROM sessions WHERE expires_at < NOW()`,
		);

		// Delete expired temp sessions
		const tempSessionsResult = await client.query(
			`DELETE FROM temp_sessions WHERE expires_at < NOW()`,
		);

		return {
			sessionsDeleted: sessionsResult.rowCount || 0,
			tempSessionsDeleted: tempSessionsResult.rowCount || 0,
		};
	} finally {
		await client.end();
	}
}
