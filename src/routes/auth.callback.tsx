import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { handleGoogleCallback } from "@/server/auth";

export const Route = createFileRoute("/auth/callback")({
	component: CallbackPage,
});

function CallbackPage() {
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		handleCallback();
	}, []);

	const handleCallback = async () => {
		try {
			// Get code, state, and error from URL parameters
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			const state = params.get("state");
			const error = params.get("error");

			// Call server function to handle callback
			const result = await handleGoogleCallback({
				data: { code: code || undefined, state: state || undefined, error: error || undefined },
			});

			if (result.success) {
				setStatus("success");

				// Store session ID in localStorage (temporary solution)
				if (result.sessionId) {
					localStorage.setItem("session_id", result.sessionId);
					// Set a flag to indicate fresh login
					localStorage.setItem("auth_just_completed", "true");
					// Dispatch event to notify auth hooks to refresh
					window.dispatchEvent(new Event("auth-refresh"));
				}

				// Redirect to main app after brief success message
				setTimeout(() => {
					navigate({ to: result.redirectTo || "/screenshots", search: { query: undefined, folder: undefined } });
				}, 1000);
			} else {
				setStatus("error");
				setError(result.error || "Authentication failed");
			}
		} catch (err) {
			console.error("Callback handling failed:", err);
			setStatus("error");
			setError("An unexpected error occurred. Please try again.");
		}
	};

	const handleRetry = () => {
		navigate({ to: "/login", search: { expired: undefined } });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="bg-white/5 border border-white/10 rounded-lg p-8">
					{status === "loading" && (
						<div className="text-center">
							<Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-white mb-2">
								Completing sign in...
							</h2>
							<p className="text-white/60 text-sm">
								Please wait while we verify your account
							</p>
						</div>
					)}

					{status === "success" && (
						<div className="text-center">
							<div className="inline-flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-full mb-4">
								<CheckCircle className="w-8 h-8 text-green-400" />
							</div>
							<h2 className="text-xl font-semibold text-white mb-2">
								Sign in successful!
							</h2>
							<p className="text-white/60 text-sm">Redirecting to your screenshots...</p>
						</div>
					)}

					{status === "error" && (
						<div className="text-center">
							<div className="inline-flex items-center justify-center w-12 h-12 bg-red-600/20 rounded-full mb-4">
								<AlertCircle className="w-8 h-8 text-red-400" />
							</div>
							<h2 className="text-xl font-semibold text-white mb-2">
								Authentication failed
							</h2>
							<p className="text-red-300 text-sm mb-6">{error}</p>
							<button
								type="button"
								onClick={handleRetry}
								className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
							>
								Try Again
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
