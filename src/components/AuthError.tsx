import { AlertCircle, X } from "lucide-react";
import { formatAuthError } from "@/utils/authErrors";

interface AuthErrorProps {
	error: string;
	onRetry?: () => void;
	onDismiss?: () => void;
	className?: string;
}

/**
 * Display authentication errors with user-friendly messages
 */
export function AuthError({
	error,
	onRetry,
	onDismiss,
	className = "",
}: AuthErrorProps) {
	const { message, action } = formatAuthError(error);

	return (
		<div
			className={`bg-red-500/10 border border-red-500/50 rounded-lg p-4 ${className}`}
		>
			<div className="flex items-start gap-3">
				<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
				<div className="flex-1 min-w-0">
					<p className="text-red-300 text-sm font-medium mb-1">{message}</p>
					{action && (
						<p className="text-red-300/80 text-xs mb-3">{action}</p>
					)}
					{onRetry && (
						<button
							type="button"
							onClick={onRetry}
							className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
						>
							Try Again
						</button>
					)}
				</div>
				{onDismiss && (
					<button
						type="button"
						onClick={onDismiss}
						className="p-1 hover:bg-red-500/20 rounded transition-colors"
						aria-label="Dismiss error"
					>
						<X className="w-4 h-4 text-red-400" />
					</button>
				)}
			</div>
		</div>
	);
}
