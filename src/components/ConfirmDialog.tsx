import { AlertTriangle, X, Info, AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmShortcut?: string;
	cancelShortcut?: string;
	variant?: "danger" | "warning" | "info";
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	isOpen,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	confirmShortcut = "Enter",
	cancelShortcut = "ESC",
	variant = "warning",
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return;

			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				onCancel();
			} else if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				onConfirm();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onConfirm, onCancel]);

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

	// Variant-specific styling
	const variantStyles = {
		danger: {
			iconBg: "bg-red-500/20",
			iconColor: "text-red-500",
			icon: AlertTriangle,
			buttonBg: "bg-red-600 hover:bg-red-700",
		},
		warning: {
			iconBg: "bg-yellow-500/20",
			iconColor: "text-yellow-500",
			icon: AlertCircle,
			buttonBg: "bg-yellow-600 hover:bg-yellow-700",
		},
		info: {
			iconBg: "bg-blue-500/20",
			iconColor: "text-blue-500",
			icon: Info,
			buttonBg: "bg-blue-600 hover:bg-blue-700",
		},
	};

	const style = variantStyles[variant];
	const Icon = style.icon;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
				onClick={onCancel}
				aria-hidden="true"
			/>

			{/* Dialog */}
			<div
				className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
							<div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center`}>
								<Icon className={`w-5 h-5 ${style.iconColor}`} />
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
								className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
							>
								{cancelText}
								{cancelShortcut && (
									<kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
										{cancelShortcut}
									</kbd>
								)}
							</button>
							<button
								onClick={onConfirm}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg ${style.buttonBg} text-white font-medium transition-colors`}
							>
								{confirmText}
								{confirmShortcut && (
									<kbd className="px-2 py-1 bg-black/20 rounded text-xs text-white/80">
										{confirmShortcut}
									</kbd>
								)}
							</button>
						</div>
						
						{/* Keyboard shortcut hint */}
						<div className="flex items-center justify-center gap-4 text-xs text-white/40 pt-2 border-t border-white/10">
							<div className="flex items-center gap-2">
								<kbd className="px-2 py-1 bg-white/10 rounded text-white/60">{confirmShortcut}</kbd>
								<span>Confirm</span>
							</div>
							<div className="flex items-center gap-2">
								<kbd className="px-2 py-1 bg-white/10 rounded text-white/60">{cancelShortcut}</kbd>
								<span>Cancel</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
