import { useState, useCallback } from "react";
import type { Toast, ToastType } from "@/components/Toast";

let toastCounter = 0;

export function useToast() {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback(
		(message: string, type: ToastType = "info", duration = 5000) => {
			const id = `toast-${++toastCounter}`;
			const toast: Toast = { id, message, type, duration };

			setToasts((prev) => [...prev, toast]);

			return id;
		},
		[],
	);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const success = useCallback(
		(message: string, duration?: number) => addToast(message, "success", duration),
		[addToast],
	);

	const error = useCallback(
		(message: string, duration?: number) => addToast(message, "error", duration),
		[addToast],
	);

	const warning = useCallback(
		(message: string, duration?: number) => addToast(message, "warning", duration),
		[addToast],
	);

	const info = useCallback(
		(message: string, duration?: number) => addToast(message, "info", duration),
		[addToast],
	);

	return {
		toasts,
		addToast,
		removeToast,
		success,
		error,
		warning,
		info,
	};
}
