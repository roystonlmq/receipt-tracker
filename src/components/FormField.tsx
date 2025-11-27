import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface FormFieldProps {
	label?: string;
	error?: string;
	required?: boolean;
	children: ReactNode;
	htmlFor?: string;
}

/**
 * FormField component with validation error display
 * Validates: Requirements 16.4, 16.5
 */
export function FormField({
	label,
	error,
	required,
	children,
	htmlFor,
}: FormFieldProps) {
	return (
		<div className="space-y-2">
			{label && (
				<label
					htmlFor={htmlFor}
					className="block text-sm font-medium text-white"
				>
					{label}
					{required && <span className="text-red-400 ml-1">*</span>}
				</label>
			)}

			<div className={error ? "ring-2 ring-red-500/50 rounded-lg" : ""}>
				{children}
			</div>

			{error && (
				<div className="flex items-start gap-2 text-sm text-red-300">
					<AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			)}
		</div>
	);
}

interface ValidationError {
	field: string;
	message: string;
}

/**
 * Validate form data before submission
 * Validates: Requirements 16.4
 */
export function validateForm(
	data: Record<string, unknown>,
	rules: Record<string, (value: unknown) => string | null>,
): ValidationError[] {
	const errors: ValidationError[] = [];

	for (const [field, validator] of Object.entries(rules)) {
		const value = data[field];
		const error = validator(value);

		if (error) {
			errors.push({ field, message: error });
		}
	}

	return errors;
}

/**
 * Common validation rules
 */
export const validators = {
	required: (fieldName: string) => (value: unknown) => {
		if (value === null || value === undefined || value === "") {
			return `${fieldName} is required`;
		}
		return null;
	},

	minLength: (fieldName: string, min: number) => (value: unknown) => {
		if (typeof value === "string" && value.length < min) {
			return `${fieldName} must be at least ${min} characters`;
		}
		return null;
	},

	maxLength: (fieldName: string, max: number) => (value: unknown) => {
		if (typeof value === "string" && value.length > max) {
			return `${fieldName} must be at most ${max} characters`;
		}
		return null;
	},

	email: (fieldName: string) => (value: unknown) => {
		if (typeof value === "string" && value.length > 0) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) {
				return `${fieldName} must be a valid email address`;
			}
		}
		return null;
	},

	pattern: (fieldName: string, pattern: RegExp, message: string) => (
		value: unknown,
	) => {
		if (typeof value === "string" && value.length > 0) {
			if (!pattern.test(value)) {
				return message;
			}
		}
		return null;
	},
};
