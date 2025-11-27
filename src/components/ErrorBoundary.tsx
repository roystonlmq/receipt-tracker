import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * ErrorBoundary component to catch and display React errors gracefully
 * Validates: Requirements 16.1
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error for debugging
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.handleReset);
			}

			// Default error UI
			return (
				<div className="min-h-screen flex items-center justify-center p-4">
					<div className="max-w-md w-full bg-white/5 border border-white/10 rounded-lg p-8 text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
							<AlertTriangle className="w-8 h-8 text-red-400" />
						</div>

						<h2 className="text-xl font-semibold text-white mb-2">
							Something went wrong
						</h2>

						<p className="text-white/60 mb-6">
							An unexpected error occurred. Please try refreshing the page or
							contact support if the problem persists.
						</p>

						<button
							type="button"
							onClick={this.handleReset}
							className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
						>
							<RefreshCw className="w-4 h-4" />
							Try Again
						</button>

						{process.env.NODE_ENV === "development" && (
							<details className="mt-6 text-left">
								<summary className="text-white/60 text-sm cursor-pointer hover:text-white/80">
									Error Details
								</summary>
								<pre className="mt-2 p-4 bg-black/20 rounded text-xs text-red-300 overflow-auto">
									{this.state.error.message}
									{"\n\n"}
									{this.state.error.stack}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
