import { getPlatform } from "@/utils/platform";

export interface KeyboardHintProps {
	keys: string | string[];
	label?: string;
	variant?: "default" | "compact" | "inline";
	className?: string;
}

/**
 * KeyboardHint component displays keyboard shortcuts with platform-aware modifier keys
 * Automatically shows Cmd on macOS and Ctrl on Windows/Linux
 */
export function KeyboardHint({
	keys,
	label,
	variant = "default",
	className = "",
}: KeyboardHintProps) {
	const platform = getPlatform();
	const keyArray = Array.isArray(keys) ? keys : [keys];

	// Replace "Cmd" or "Ctrl" with platform-appropriate modifier
	const processedKeys = keyArray.map((key) => {
		if (key === "Cmd" || key === "Ctrl") {
			return platform.modifierKey;
		}
		return key;
	});

	// Variant-specific styling with responsive behavior
	const variantStyles = {
		default: "flex items-center gap-1 max-md:hidden",
		compact: "flex items-center max-md:hidden",
		inline: "inline-flex items-center gap-0.5",
	};

	const kbdStyles = {
		default: "px-2 py-1 bg-white/10 rounded text-white/80 text-xs font-mono",
		compact: "px-1.5 py-0.5 bg-white/10 rounded text-white/80 text-[10px] font-mono",
		inline: "px-1.5 py-0.5 bg-white/10 rounded text-white/80 text-xs font-mono",
	};

	const labelStyles = {
		default: "text-xs text-white/60",
		compact: "",
		inline: "text-xs text-white/60",
	};

	return (
		<span
			className={`${variantStyles[variant]} ${className}`}
			role="note"
			aria-label={`Keyboard shortcut: ${processedKeys.join(" ")} ${label || ""}`}
		>
			{processedKeys.map((key, index) => (
				<span key={index} className="flex items-center gap-0.5">
					<kbd className={kbdStyles[variant]}>{key}</kbd>
					{index < processedKeys.length - 1 && (
						<span className="text-white/40 text-xs">+</span>
					)}
				</span>
			))}
			{label && variant !== "compact" && (
				<span className={labelStyles[variant]}>{label}</span>
			)}
		</span>
	);
}
