import { useEffect, useState } from "react";
import {
	CheckCircle,
	XCircle,
	AlertCircle,
	Info,
	X,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

interface ToastItemProps {
	toast: Toast;
	onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		const duration = toast.duration ?? 5000;
		if (duration > 0) {
			const timer = setTimeout(() => {
				setIsExiting(true);
				setTimeout(() => onClose(toast.id), 300);
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [toast.id, toast.duration, onClose]);

	const handleClose = () => {
		setIsExiting(true);
		setTimeout(() => onClose(toast.id), 300);
	};

	const icons = {
		success: <CheckCircle className="w-5 h-5 text-green-400" />,
		error: <XCircle className="w-5 h-5 text-red-400" />,
		warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
		info: <Info className="w-5 h-5 text-blue-400" />,
	};

	const styles = {
		success: "bg-green-500/10 border-green-500/50",
		error: "bg-red-500/10 border-red-500/50",
		warning: "bg-yellow-500/10 border-yellow-500/50",
		info: "bg-blue-500/10 border-blue-500/50",
	};

	return (
		<div
			className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
				styles[toast.type]
			} ${
				isExiting
					? "opacity-0 translate-x-full"
					: "opacity-100 translate-x-0"
			}`}
		>
			<div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
			<p className="flex-1 text-sm text-white">{toast.message}</p>
			<button
				type="button"
				onClick={handleClose}
				className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	);
}

interface ToastContainerProps {
	toasts: Toast[];
	onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
	return (
		<div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
			{toasts.map((toast) => (
				<div key={toast.id} className="pointer-events-auto">
					<ToastItem toast={toast} onClose={onClose} />
				</div>
			))}
		</div>
	);
}
