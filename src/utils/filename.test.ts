import { describe, it, expect } from "vitest";
import {
	parseFilename,
	generateFilename,
	generateUniqueFilename,
	extractFolderDate,
	formatFolderDate,
} from "./filename";

describe("parseFilename", () => {
	it("should parse valid filename format", () => {
		const result = parseFilename("271124 - 1430 - receipt.png");
		expect(result).toEqual({
			date: "271124",
			time: "1430",
			name: "receipt",
			isValid: true,
		});
	});

	it("should handle filename without extension", () => {
		const result = parseFilename("271124 - 1430 - receipt");
		expect(result).toEqual({
			date: "271124",
			time: "1430",
			name: "receipt",
			isValid: true,
		});
	});

	it("should handle different image extensions", () => {
		const resultPng = parseFilename("271124 - 1430 - receipt.png");
		const resultJpg = parseFilename("271124 - 1430 - receipt.jpg");
		const resultJpeg = parseFilename("271124 - 1430 - receipt.jpeg");

		expect(resultPng.isValid).toBe(true);
		expect(resultJpg.isValid).toBe(true);
		expect(resultJpeg.isValid).toBe(true);
	});

	it("should handle invalid format", () => {
		const result = parseFilename("invalid-filename.png");
		expect(result.isValid).toBe(false);
	});

	it("should validate date components", () => {
		const invalidDay = parseFilename("321124 - 1430 - receipt.png");
		expect(invalidDay.isValid).toBe(false);

		const invalidMonth = parseFilename("271324 - 1430 - receipt.png");
		expect(invalidMonth.isValid).toBe(false);
	});

	it("should validate time components", () => {
		const invalidHour = parseFilename("271124 - 2430 - receipt.png");
		expect(invalidHour.isValid).toBe(false);

		const invalidMinute = parseFilename("271124 - 1460 - receipt.png");
		expect(invalidMinute.isValid).toBe(false);
	});

	it("should handle spaces around separators", () => {
		const result = parseFilename("271124-1430-receipt.png");
		expect(result.isValid).toBe(true);
		expect(result.date).toBe("271124");
		expect(result.time).toBe("1430");
		expect(result.name).toBe("receipt");
	});
});

describe("generateFilename", () => {
	it("should generate filename with screenshot as name", () => {
		const filename = generateFilename();
		expect(filename).toMatch(/^\d{6} - \d{4} - screenshot\.png$/);
	});

	it("should use current timestamp", () => {
		const now = new Date();
		const filename = generateFilename();

		const day = now.getDate().toString().padStart(2, "0");
		const month = (now.getMonth() + 1).toString().padStart(2, "0");
		const year = now.getFullYear().toString().substring(2);

		expect(filename).toContain(`${day}${month}${year}`);
	});
});

describe("generateUniqueFilename", () => {
	it("should return base filename if no duplicates exist", () => {
		const baseFilename = "271124 - 1430 - screenshot.png";
		const existingFilenames: string[] = [];

		const result = generateUniqueFilename(baseFilename, existingFilenames);
		expect(result).toBe(baseFilename);
	});

	it("should increment to _2 if base filename exists", () => {
		const baseFilename = "271124 - 1430 - screenshot.png";
		const existingFilenames = ["271124 - 1430 - screenshot.png"];

		const result = generateUniqueFilename(baseFilename, existingFilenames);
		expect(result).toBe("271124 - 1430 - screenshot_2.png");
	});

	it("should increment to _3 if _2 also exists", () => {
		const baseFilename = "271124 - 1430 - screenshot.png";
		const existingFilenames = [
			"271124 - 1430 - screenshot.png",
			"271124 - 1430 - screenshot_2.png",
		];

		const result = generateUniqueFilename(baseFilename, existingFilenames);
		expect(result).toBe("271124 - 1430 - screenshot_3.png");
	});

	it("should find next available number with gaps", () => {
		const baseFilename = "271124 - 1430 - screenshot.png";
		const existingFilenames = [
			"271124 - 1430 - screenshot.png",
			"271124 - 1430 - screenshot_3.png",
		];

		const result = generateUniqueFilename(baseFilename, existingFilenames);
		expect(result).toBe("271124 - 1430 - screenshot_2.png");
	});

	it("should handle invalid base filename", () => {
		const baseFilename = "invalid-filename.png";
		const existingFilenames: string[] = [];

		const result = generateUniqueFilename(baseFilename, existingFilenames);
		expect(result).toBe(baseFilename);
	});
});

describe("formatFolderDate", () => {
	it("should format DDMMYY with slashes", () => {
		const result = formatFolderDate("271124");
		expect(result).toBe("27/11/24");
	});

	it("should handle invalid length", () => {
		const result = formatFolderDate("12345");
		expect(result).toBe("12345");
	});

	it("should handle empty string", () => {
		const result = formatFolderDate("");
		expect(result).toBe("");
	});
});

describe("extractFolderDate", () => {
	it("should extract date from valid filename", () => {
		const result = extractFolderDate("271124 - 1430 - receipt.png");
		expect(result).toBe("271124");
	});

	it("should use current date for invalid filename", () => {
		const result = extractFolderDate("invalid-filename.png");
		expect(result).toMatch(/^\d{6}$/);

		// Verify it's a valid date format
		const day = Number.parseInt(result.substring(0, 2), 10);
		const month = Number.parseInt(result.substring(2, 4), 10);

		expect(day).toBeGreaterThanOrEqual(1);
		expect(day).toBeLessThanOrEqual(31);
		expect(month).toBeGreaterThanOrEqual(1);
		expect(month).toBeLessThanOrEqual(12);
	});

	it("should use current date for filename without date prefix", () => {
		const result = extractFolderDate("screenshot.png");
		expect(result).toMatch(/^\d{6}$/);
	});
});
