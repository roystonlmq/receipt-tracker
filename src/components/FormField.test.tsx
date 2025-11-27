import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField, validateForm, validators } from "./FormField";

describe("FormField", () => {
	it("should render label when provided", () => {
		render(
			<FormField label="Test Field">
				<input type="text" />
			</FormField>,
		);

		expect(screen.getByText("Test Field")).toBeInTheDocument();
	});

	it("should show required indicator when required is true", () => {
		render(
			<FormField label="Test Field" required>
				<input type="text" />
			</FormField>,
		);

		expect(screen.getByText("*")).toBeInTheDocument();
	});

	it("should display error message when error is provided", () => {
		render(
			<FormField label="Test Field" error="This field is required">
				<input type="text" />
			</FormField>,
		);

		expect(screen.getByText("This field is required")).toBeInTheDocument();
	});

	it("should render children", () => {
		render(
			<FormField label="Test Field">
				<input type="text" data-testid="test-input" />
			</FormField>,
		);

		expect(screen.getByTestId("test-input")).toBeInTheDocument();
	});
});

describe("validateForm", () => {
	it("should return no errors for valid data", () => {
		const data = { name: "John", email: "john@example.com" };
		const rules = {
			name: validators.required("Name"),
			email: validators.required("Email"),
		};

		const errors = validateForm(data, rules);

		expect(errors).toHaveLength(0);
	});

	it("should return errors for invalid data", () => {
		const data = { name: "", email: "" };
		const rules = {
			name: validators.required("Name"),
			email: validators.required("Email"),
		};

		const errors = validateForm(data, rules);

		expect(errors).toHaveLength(2);
		expect(errors[0].field).toBe("name");
		expect(errors[0].message).toBe("Name is required");
		expect(errors[1].field).toBe("email");
		expect(errors[1].message).toBe("Email is required");
	});
});

describe("validators", () => {
	describe("required", () => {
		it("should return error for empty string", () => {
			const validator = validators.required("Name");
			expect(validator("")).toBe("Name is required");
		});

		it("should return error for null", () => {
			const validator = validators.required("Name");
			expect(validator(null)).toBe("Name is required");
		});

		it("should return null for valid value", () => {
			const validator = validators.required("Name");
			expect(validator("John")).toBeNull();
		});
	});

	describe("minLength", () => {
		it("should return error for string shorter than min", () => {
			const validator = validators.minLength("Password", 8);
			expect(validator("short")).toBe("Password must be at least 8 characters");
		});

		it("should return null for string meeting min length", () => {
			const validator = validators.minLength("Password", 8);
			expect(validator("longenough")).toBeNull();
		});
	});

	describe("maxLength", () => {
		it("should return error for string longer than max", () => {
			const validator = validators.maxLength("Username", 10);
			expect(validator("verylongusername")).toBe(
				"Username must be at most 10 characters",
			);
		});

		it("should return null for string within max length", () => {
			const validator = validators.maxLength("Username", 10);
			expect(validator("short")).toBeNull();
		});
	});

	describe("email", () => {
		it("should return error for invalid email", () => {
			const validator = validators.email("Email");
			expect(validator("notanemail")).toBe(
				"Email must be a valid email address",
			);
		});

		it("should return null for valid email", () => {
			const validator = validators.email("Email");
			expect(validator("test@example.com")).toBeNull();
		});

		it("should return null for empty string", () => {
			const validator = validators.email("Email");
			expect(validator("")).toBeNull();
		});
	});

	describe("pattern", () => {
		it("should return error for string not matching pattern", () => {
			const validator = validators.pattern(
				"Phone",
				/^\d{3}-\d{3}-\d{4}$/,
				"Phone must be in format XXX-XXX-XXXX",
			);
			expect(validator("1234567890")).toBe(
				"Phone must be in format XXX-XXX-XXXX",
			);
		});

		it("should return null for string matching pattern", () => {
			const validator = validators.pattern(
				"Phone",
				/^\d{3}-\d{3}-\d{4}$/,
				"Phone must be in format XXX-XXX-XXXX",
			);
			expect(validator("123-456-7890")).toBeNull();
		});
	});
});
