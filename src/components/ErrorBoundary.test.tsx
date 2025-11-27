import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) {
		throw new Error("Test error");
	}
	return <div>No error</div>;
}

describe("ErrorBoundary", () => {
	// Suppress console.error for these tests
	const originalError = console.error;
	beforeAll(() => {
		console.error = vi.fn();
	});

	afterAll(() => {
		console.error = originalError;
	});

	it("should render children when no error occurs", () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={false} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("No error")).toBeInTheDocument();
	});

	it("should render error UI when error occurs", () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		expect(
			screen.getByText(/An unexpected error occurred/),
		).toBeInTheDocument();
	});

	it("should display Try Again button", () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
	});

	it("should use custom fallback when provided", () => {
		const customFallback = (error: Error) => (
			<div>Custom error: {error.message}</div>
		);

		render(
			<ErrorBoundary fallback={customFallback}>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
	});
});
