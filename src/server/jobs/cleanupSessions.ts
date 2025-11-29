import { cleanupExpiredSessions } from "@/server/sessions";

/**
 * Session cleanup job
 * Removes expired sessions and temporary sessions from the database
 */
export async function runSessionCleanup(): Promise<void> {
	try {
		console.log("[Session Cleanup] Starting cleanup job...");

		const result = await cleanupExpiredSessions();

		console.log(
			`[Session Cleanup] Completed: ${result.sessionsDeleted} sessions, ${result.tempSessionsDeleted} temp sessions deleted`,
		);

		// Log warning if many sessions were deleted (might indicate an issue)
		if (result.sessionsDeleted > 100) {
			console.warn(
				`[Session Cleanup] Warning: Deleted ${result.sessionsDeleted} sessions. This is unusually high.`,
			);
		}
	} catch (error) {
		console.error("[Session Cleanup] Failed:", error);
		// Don't throw - we don't want to crash the server if cleanup fails
	}
}

/**
 * Schedule periodic session cleanup
 * @param intervalMs Interval in milliseconds (default: 1 hour)
 */
export function scheduleSessionCleanup(
	intervalMs: number = 60 * 60 * 1000,
): NodeJS.Timeout {
	console.log(
		`[Session Cleanup] Scheduling cleanup every ${intervalMs / 1000 / 60} minutes`,
	);

	// Run immediately on startup
	runSessionCleanup();

	// Schedule periodic cleanup
	const interval = setInterval(() => {
		runSessionCleanup();
	}, intervalMs);

	return interval;
}

/**
 * Stop scheduled cleanup
 */
export function stopSessionCleanup(interval: NodeJS.Timeout): void {
	clearInterval(interval);
	console.log("[Session Cleanup] Stopped scheduled cleanup");
}
