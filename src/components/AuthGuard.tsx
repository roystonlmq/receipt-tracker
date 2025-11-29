import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
	children: React.ReactNode;
}

/**
 * AuthGuard component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();
	const [hasChecked, setHasChecked] = useState(false);

	useEffect(() => {
		if (!isLoading) {
			setHasChecked(true);
			
			if (!isAuthenticated) {
				// Check if session expired (had a session before)
				const hadSession = localStorage.getItem("session_expired");
				
				// Redirect to login with session expired message if applicable
				navigate({ 
					to: "/login",
					search: hadSession ? { expired: "true" } : undefined
				});
			}
		}
	}, [isLoading, isAuthenticated, navigate]);

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
					<p className="text-white/60">Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render children if not authenticated (will redirect)
	if (!isAuthenticated) {
		return null;
	}

	// Render children if authenticated
	return <>{children}</>;
}
