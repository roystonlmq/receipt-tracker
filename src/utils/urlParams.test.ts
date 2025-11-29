import { describe, it, expect } from "vitest";
import {
	parseScreenshotParams,
	buildScreenshotParams,
	isValidScreenshotId,
	addScreenshotToParams,
	removeScreenshotFromParams,
} from "./urlParams";

describe("URL Parameter Utilities", () => {
	describe("parseScreenshotParams", () => {
		it("should parse screenshot ID as number", () => {
			const result = parseScreenshotParams({ screenshot: "123" });
			expect(result.screenshot).toBe(123);
			expect(typeof result.screenshot).toBe("number");
		});

		it("should parse folder parameter", () => {
			const result = parseScreenshotParams({ folder: "010125" });
			expect(result.folder).toBe("010125");
		});

		it("should parse query parameter", () => {
			const result = parseScreenshotParams({ query: "#test" });
			expect(result.query).toBe("#test");
		});

		it("should parse all parameters together", () => {
			const result = parseScreenshotParams({
				screenshot: "456",
				folder: "020125",
				query: "#project",
			});
			expect(result).toEqual({
				screenshot: 456,
				folder: "020125",
				query: "#project",
			});
		});

		it("should handle missing parameters", () => {
			const result = parseScreenshotParams({});
			expect(result).toEqual({
				screenshot: undefined,
				folder: undefined,
				query: undefined,
			});
		});

		it("should handle invalid screenshot ID", () => {
			const result = parseScreenshotParams({ screenshot: "invalid" });
			// Invalid IDs are filtered out and become undefined
			expect(result.screenshot).toBeUndefined();
		});

		it("should handle empty strings", () => {
			const result = parseScreenshotParams({
				screenshot: "",
				folder: "",
				query: "",
			});
			// Empty string for screenshot becomes undefined (Number("") is 0, but we filter it)
			expect(result.screenshot).toBeUndefined();
			expect(result.folder).toBeUndefined();
			expect(result.query).toBeUndefined();
		});
	});

	describe("buildScreenshotParams", () => {
		it("should build params with screenshot ID", () => {
			const result = buildScreenshotParams({ screenshot: 123 });
			expect(result).toEqual({ screenshot: "123" });
		});

		it("should build params with folder", () => {
			const result = buildScreenshotParams({ folder: "010125" });
			expect(result).toEqual({ folder: "010125" });
		});

		it("should build params with query", () => {
			const result = buildScreenshotParams({ query: "#test" });
			expect(result).toEqual({ query: "#test" });
		});

		it("should build params with all parameters", () => {
			const result = buildScreenshotParams({
				screenshot: 456,
				folder: "020125",
				query: "#project",
			});
			expect(result).toEqual({
				screenshot: "456",
				folder: "020125",
				query: "#project",
			});
		});

		it("should omit undefined parameters", () => {
			const result = buildScreenshotParams({
				screenshot: 123,
				folder: undefined,
				query: undefined,
			});
			expect(result).toEqual({ screenshot: "123" });
			expect(result).not.toHaveProperty("folder");
			expect(result).not.toHaveProperty("query");
		});

		it("should handle empty params object", () => {
			const result = buildScreenshotParams({});
			expect(result).toEqual({});
		});
	});

	describe("isValidScreenshotId", () => {
		it("should validate positive integers", () => {
			expect(isValidScreenshotId(1)).toBe(true);
			expect(isValidScreenshotId(123)).toBe(true);
			expect(isValidScreenshotId(999999)).toBe(true);
		});

		it("should validate positive integer strings", () => {
			expect(isValidScreenshotId("1")).toBe(true);
			expect(isValidScreenshotId("123")).toBe(true);
			expect(isValidScreenshotId("999999")).toBe(true);
		});

		it("should reject zero", () => {
			expect(isValidScreenshotId(0)).toBe(false);
			expect(isValidScreenshotId("0")).toBe(false);
		});

		it("should reject negative numbers", () => {
			expect(isValidScreenshotId(-1)).toBe(false);
			expect(isValidScreenshotId("-123")).toBe(false);
		});

		it("should reject decimals", () => {
			expect(isValidScreenshotId(1.5)).toBe(false);
			expect(isValidScreenshotId("1.5")).toBe(false);
		});

		it("should reject non-numeric strings", () => {
			expect(isValidScreenshotId("abc")).toBe(false);
			expect(isValidScreenshotId("12abc")).toBe(false);
			expect(isValidScreenshotId("")).toBe(false);
		});

		it("should reject null and undefined", () => {
			expect(isValidScreenshotId(null)).toBe(false);
			expect(isValidScreenshotId(undefined)).toBe(false);
		});

		it("should reject objects and arrays", () => {
			expect(isValidScreenshotId({})).toBe(false);
			expect(isValidScreenshotId([])).toBe(false);
			expect(isValidScreenshotId([123])).toBe(false);
		});
	});

	describe("addScreenshotToParams", () => {
		it("should add screenshot ID to empty params", () => {
			const result = addScreenshotToParams({}, 123);
			expect(result).toEqual({ screenshot: 123 });
		});

		it("should add screenshot ID while preserving other params", () => {
			const result = addScreenshotToParams(
				{ folder: "010125", query: "#test" },
				456,
			);
			expect(result).toEqual({
				folder: "010125",
				query: "#test",
				screenshot: 456,
			});
		});

		it("should replace existing screenshot ID", () => {
			const result = addScreenshotToParams({ screenshot: 123 }, 456);
			expect(result).toEqual({ screenshot: 456 });
		});

		it("should not mutate original params", () => {
			const original = { folder: "010125" };
			const result = addScreenshotToParams(original, 123);
			expect(original).toEqual({ folder: "010125" });
			expect(result).toEqual({ folder: "010125", screenshot: 123 });
		});
	});

	describe("removeScreenshotFromParams", () => {
		it("should remove screenshot ID", () => {
			const result = removeScreenshotFromParams({ screenshot: 123 });
			expect(result).toEqual({});
			expect(result).not.toHaveProperty("screenshot");
		});

		it("should remove screenshot ID while preserving other params", () => {
			const result = removeScreenshotFromParams({
				screenshot: 123,
				folder: "010125",
				query: "#test",
			});
			expect(result).toEqual({
				folder: "010125",
				query: "#test",
			});
			expect(result).not.toHaveProperty("screenshot");
		});

		it("should handle params without screenshot ID", () => {
			const result = removeScreenshotFromParams({
				folder: "010125",
				query: "#test",
			});
			expect(result).toEqual({
				folder: "010125",
				query: "#test",
			});
		});

		it("should not mutate original params", () => {
			const original = { screenshot: 123, folder: "010125" };
			const result = removeScreenshotFromParams(original);
			expect(original).toEqual({ screenshot: 123, folder: "010125" });
			expect(result).toEqual({ folder: "010125" });
		});
	});

	describe("Round-trip conversion", () => {
		it("should maintain data through parse and build cycle", () => {
			const original = {
				screenshot: "123",
				folder: "010125",
				query: "#test",
			};
			const parsed = parseScreenshotParams(original);
			const built = buildScreenshotParams(parsed);

			expect(built).toEqual({
				screenshot: "123",
				folder: "010125",
				query: "#test",
			});
		});
	});
});
