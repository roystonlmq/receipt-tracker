import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "@/server/auth";

export interface AuthUser {
	id: number;
	name: string;
	email: string;
	picture?: string;
}

export interface UseAuthResult {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	devMode: boolean;
	refreshAuth: () => Promise<void>;
}

/**
 * Hook to get current authenticated user
 */
export function useAuth(): UseAuthResult {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [devMode, setDevMode] = useState(false);

	const checkAuth = useCallback(async () => {
		try {
			// Get session ID from localStorage
			const sessionId = localStorage.getItem("session_id") || undefined;
			const hadSession = !!sessionId;

			const result = await getCurrentUser({ data: { sessionId } });

			if (result.authenticated && result.user) {
				setUser(result.user);
				setDevMode(result.devMode || false);
				// Clear any expired session flag
				localStorage.removeItem("session_expired");
			} else {
				setUser(null);
				// Mark that session expired if we had one before
				if (hadSession) {
					localStorage.setItem("session_expired", "true");
				}
				// Clear invalid session
				localStorage.removeItem("session_id");
			}
		} catch (error) {
			console.error("Auth check failed:", error);
			setUser(null);
			localStorage.removeItem("session_id");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();

		// Listen for auth refresh events
		const handleAuthRefresh = () => {
			checkAuth();
		};

		window.addEventListener("auth-refresh", handleAuthRefresh);

		// Check if we just completed auth (from callback)
		const justCompleted = localStorage.getItem("auth_just_completed");
		if (justCompleted) {
			localStorage.removeItem("auth_just_completed");
			// Force a re-check after a brief delay to ensure session is ready
			setTimeout(() => {
				checkAuth();
			}, 100);
		}

		return () => {
			window.removeEventListener("auth-refresh", handleAuthRefresh);
		};
	}, [checkAuth]);

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		devMode,
		refreshAuth: checkAuth,
	};
}
