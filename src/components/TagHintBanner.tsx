import { useState, useEffect } from "react";
import { X, Hash } from "lucide-react";

interface TagHintBannerProps {
	userId: number;
	onDismiss?: () => void;
}

export function TagHintBanner({ userId, onDismiss }: TagHintBannerProps) {
	const [isVisible, setIsVisible] = useState(false);
	const storageKey = `tag-hint-dismissed-${userId}`;

	useEffect(() => {
		// Check if user has dismissed the hint
		const dismissed = localStorage.getItem(storageKey);
		if (!dismissed) {
			setIsVisible(true);
		}
	}, [storageKey]);

	const handleDismiss = () => {
		setIsVisible(false);
		localStorage.setItem(storageKey, "true");
		onDismiss?.();
	};

	if (!isVisible) return null;

	return (
		<div className="mb-4 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
			<Hash className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
			<div className="flex-1">
				<p className="text-sm text-white/80">
					<span className="font-semibold">Tip:</span> Use hashtags like{" "}
					<span className="text-blue-400 font-semibold">#project</span> or{" "}
					<span className="text-blue-400 font-semibold">#receipt</span> to
					organize your screenshots. Type <span className="font-mono">#</span> to
					see your previous tags.
				</p>
			</div>
			<button
				type="button"
				onClick={handleDismiss}
				className="text-white/40 hover:text-white/80 transition-colors"
				aria-label="Dismiss hint"
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	);
}
