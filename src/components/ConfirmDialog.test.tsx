import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
	it("should not render when isOpen is false", () => {
		const { container } = render(
			<ConfirmDialog
				isOpen={false}
				title="Test Title"
				message="Test message"
				onConfirm={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(container.firstChild).toBeNull();
	});

	it("should render with title and message when isOpen is true", () => {
		render(
			<ConfirmDialog
				isOpen={true}
				title="Delete Screenshot"
				message="Are you sure you want to delete this screenshot?"
				onConfirm={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText("Delete Screenshot")).toBeInTheDocument();
		expect(
			screen.getByText("Are you sure you want to delete this screenshot?"),
		).toBeInTheDocument();
	});

	it("should render with default button text", () => {
		render(
			<ConfirmDialog
				isOpen={true}
				title="Test"
				message="Test message"
				onConfirm={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText("Confirm")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	it("should render with custom button text", () => {
		render(
			<ConfirmDialog
				isOpen={true}
				title="Test"
				message="Test message"
				confirmText="Delete"
				cancelText="Keep"
				onConfirm={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText("Delete")).toBeInTheDocument();
		expect(screen.getByText("Keep")).toBeInTheDocument();
	});

	it("should call onConfirm when confirm button is clicked", () => {
		const onConfirm = vi.fn();
		render(
			<ConfirmDialog
				isOpen={true}
				title="Test"
				message="Test message"
				onConfirm={onConfirm}
				onCancel={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByText("Confirm"));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("should call onCancel when cancel button is clicked", () => {
		const onCancel = vi.fn();
		render(
			<ConfirmDialog
				isOpen={true}
				title="Test"
				message="Test message"
				onConfirm={vi.fn()}
				onCancel={onCancel}
			/>,
		);

		fireEvent.click(screen.getByText("Cancel"));
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("should call onCancel when close button is clicked", () => {
		const onCancel = vi.fn();
		render(
			<ConfirmDialog
				isOpen={true}
				title="Test"
				message="Test message"
				onConfirm={vi.fn()}
				onCancel={onCancel}
			/>,
		);

		const closeButton = screen.getByLabelText("Close dialog");
		fireEvent.click(closeButton);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("should call onCancel when backdrop is clicked", () => {
		const onCancel = vi.fn();
		const { container } = render(
			<ConfirmDialog
				isOpen={true}
				title="Test"
				message="Test message"
				onConfirm={vi.fn()}
				onCancel={onCancel}
			/>,
		);

		// Click the backdrop (first child is the backdrop)
		const backdrop = container.querySelector(".fixed.inset-0.bg-black\\/60");
		if (backdrop) {
			fireEvent.click(backdrop);
			expect(onCancel).toHaveBeenCalledTimes(1);
		}
	});
});
