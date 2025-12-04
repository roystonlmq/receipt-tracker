/**
 * Unit tests for fileSystem utilities
 * Tests the downloadFileWithPicker function and fallback behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	downloadFileWithPicker,
	downloadFileFallback,
	isFileSystemAccessSupported,
} from "./fileSystem";

describe("fileSystem utilities", () => {
	describe("isFileSystemAccessSupported", () => {
		it("should return true when showDirectoryPicker is available", () => {
			// Mock window.showDirectoryPicker
			(window as any).showDirectoryPicker = vi.fn();

			const result = isFileSystemAccessSupported();

			expect(result).toBe(true);
		});

		it("should return false when showDirectoryPicker is not available", () => {
			// Remove showDirectoryPicker
			delete (window as any).showDirectoryPicker;

			const result = isFileSystemAccessSupported();

			expect(result).toBe(false);
		});
	});

	describe("downloadFileWithPicker", () => {
		let mockShowSaveFilePicker: any;
		let mockFileHandle: any;
		let mockWritable: any;

		beforeEach(() => {
			// Setup mocks
			mockWritable = {
				write: vi.fn().mockResolvedValue(undefined),
				close: vi.fn().mockResolvedValue(undefined),
			};

			mockFileHandle = {
				createWritable: vi.fn().mockResolvedValue(mockWritable),
				name: "test.png",
			};

			mockShowSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);
			(window as any).showSaveFilePicker = mockShowSaveFilePicker;

			// Mock URL methods
			if (!global.URL.createObjectURL) {
				global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
			}
			if (!global.URL.revokeObjectURL) {
				global.URL.revokeObjectURL = vi.fn();
			}
		});

		afterEach(() => {
			vi.clearAllMocks();
		});

		it("should successfully save a text file", async () => {
			const result = await downloadFileWithPicker(
				"test.txt",
				"Hello World",
				"text/plain",
			);

			expect(result.success).toBe(true);
			expect(result.cancelled).toBe(false);
			expect(mockShowSaveFilePicker).toHaveBeenCalledWith(
				expect.objectContaining({
					suggestedName: "test.txt",
				}),
			);
			expect(mockWritable.write).toHaveBeenCalled();
			expect(mockWritable.close).toHaveBeenCalled();
		});

		it("should successfully save a blob file", async () => {
			const blob = new Blob(["test content"], { type: "text/plain" });

			const result = await downloadFileWithPicker(
				"test.txt",
				blob,
				"text/plain",
			);

			expect(result.success).toBe(true);
			expect(result.cancelled).toBe(false);
			expect(mockWritable.write).toHaveBeenCalledWith(blob);
		});

		it("should handle data URL content", async () => {
			const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

			const result = await downloadFileWithPicker(
				"test.png",
				dataUrl,
				"image/png",
			);

			expect(result.success).toBe(true);
			expect(mockWritable.write).toHaveBeenCalled();
			const writtenContent = mockWritable.write.mock.calls[0][0];
			expect(writtenContent).toBeInstanceOf(Blob);
		});

		it("should return cancelled when user cancels", async () => {
			const abortError = new Error("User cancelled");
			abortError.name = "AbortError";
			mockShowSaveFilePicker.mockRejectedValue(abortError);

			const result = await downloadFileWithPicker(
				"test.txt",
				"content",
				"text/plain",
			);

			expect(result.success).toBe(false);
			expect(result.cancelled).toBe(true);
		});

		it("should fall back to traditional download when API not supported", async () => {
			delete (window as any).showSaveFilePicker;

			// Mock document methods for fallback
			const mockLink = {
				href: "",
				download: "",
				click: vi.fn(),
			};
			vi.spyOn(document, "createElement").mockReturnValue(mockLink as any);
			vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink as any);
			vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink as any);

			const result = await downloadFileWithPicker(
				"test.txt",
				"content",
				"text/plain",
			);

			expect(result.success).toBe(true);
			expect(result.cancelled).toBe(false);
			expect(mockLink.click).toHaveBeenCalled();
		});

		it("should fall back on other errors", async () => {
			mockShowSaveFilePicker.mockRejectedValue(new Error("Unknown error"));

			// Mock document methods for fallback
			const mockLink = {
				href: "",
				download: "",
				click: vi.fn(),
			};
			vi.spyOn(document, "createElement").mockReturnValue(mockLink as any);
			vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink as any);
			vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink as any);

			const result = await downloadFileWithPicker(
				"test.txt",
				"content",
				"text/plain",
			);

			expect(result.success).toBe(true);
			expect(mockLink.click).toHaveBeenCalled();
		});
	});

	describe("downloadFileFallback", () => {
		let mockLink: any;

		beforeEach(() => {
			// Mock URL methods
			if (!global.URL.createObjectURL) {
				global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
			}
			if (!global.URL.revokeObjectURL) {
				global.URL.revokeObjectURL = vi.fn();
			}

			mockLink = {
				href: "",
				download: "",
				click: vi.fn(),
			};
			vi.spyOn(document, "createElement").mockReturnValue(mockLink);
			vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink);
			vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink);
		});

		afterEach(() => {
			vi.clearAllMocks();
		});

		it("should download a text file", () => {
			downloadFileFallback("test.txt", "Hello World", "text/plain");

			expect(document.createElement).toHaveBeenCalledWith("a");
			expect(mockLink.download).toBe("test.txt");
			expect(mockLink.click).toHaveBeenCalled();
			expect(global.URL.createObjectURL).toHaveBeenCalled();
			expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
		});

		it("should download a blob file", () => {
			const blob = new Blob(["test content"], { type: "text/plain" });

			downloadFileFallback("test.txt", blob, "text/plain");

			expect(mockLink.download).toBe("test.txt");
			expect(mockLink.click).toHaveBeenCalled();
		});

		it("should handle data URL directly", () => {
			const dataUrl = "data:image/png;base64,abc123";

			downloadFileFallback("test.png", dataUrl, "image/png");

			expect(mockLink.href).toBe(dataUrl);
			expect(mockLink.download).toBe("test.png");
			expect(mockLink.click).toHaveBeenCalled();
			// Should not create object URL for data URLs
			expect(global.URL.createObjectURL).not.toHaveBeenCalled();
		});
	});
});
