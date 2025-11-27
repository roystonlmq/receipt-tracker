import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	isOpen,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null);

	// Handle ESC key to close dialog
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onCancel();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onCancel]);

	// Focus trap and initial focus
	useEffect(() => {
		if (isOpen && dialogRef.current) {
			const focusableElements = dialogRef.current.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			const firstElement = focusableElements[0] as HTMLElement;
			firstElement?.focus();
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
				onClick={onCancel}
				aria-hidden="true"
			/>

			{/* Dialog */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center p-4"
				role="dialog"
				aria-modal="true"
				aria-labelledby="dialog-title"
			>
				<div
					ref={dialogRef}
					className="bg-gray-900 rounded-lg shadow-2xl border border-white/10 max-w-md w-full overflow-hidden"
				>
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b border-white/10">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
								<AlertTriangle className="w-5 h-5 text-red-500" />
							</div>
							<h2
								id="dialog-title"
								className="text-lg font-semibold text-white"
							>
								{title}
							</h2>
						</div>
						<button
							onClick={onCancel}
							className="p-2 hover:bg-white/10 rounded-lg transition-colors"
							aria-label="Close dialog"
						>
							<X size={20} className="text-white/60" />
						</button>
					</div>

					{/* Content */}
					<div className="p-6">
						<p className="text-white/80 leading-relaxed">{message}</p>
					</div>

					{/* Actions */}
					<div className="p-4 bg-black/20 space-y-3">
						<div className="flex items-center justify-end gap-3">
							<button
								onClick={onCancel}
								className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
							>
								{cancelText}
							</button>
							<button
								onClick={onConfirm}
								className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
							>
								{confirmText}
							</button>
						</div>
						
						{/* Keyboard shortcut hint */}
						<div className="flex items-center gap-2 text-xs text-white/40 pt-2 border-t border-white/10">
							<kbd className="px-2 py-1 bg-white/10 rounded text-white/60">ESC</kbd>
							<span>Cancel</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
