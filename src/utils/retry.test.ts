import { describe, it, expect, vi } from "vitest";
import { retryWithBackoff, isRetryableError } from "./retry";

describe("retryWithBackoff", () => {
	it("should succeed on first attempt", async () => {
		const fn = vi.fn().mockResolvedValue("success");

		const result = await retryWithBackoff(fn);

		expect(result).toBe("success");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("should retry on failure and eventually succeed", async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new Error("Fail 1"))
			.mockRejectedValueOnce(new Error("Fail 2"))
			.mockResolvedValue("success");

		const result = await retryWithBackoff(fn, { maxAttempts: 3, initialDelay: 10 });

		expect(result).toBe("success");
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("should throw error after max attempts", async () => {
		const fn = vi.fn().mockRejectedValue(new Error("Always fails"));

		await expect(
			retryWithBackoff(fn, { maxAttempts: 3, initialDelay: 10 }),
		).rejects.toThrow("Always fails");

		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("should use exponential backoff", async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new Error("Fail 1"))
			.mockRejectedValueOnce(new Error("Fail 2"))
			.mockResolvedValue("success");

		const startTime = Date.now();
		await retryWithBackoff(fn, {
			maxAttempts: 3,
			initialDelay: 50,
			backoffMultiplier: 2,
		});
		const endTime = Date.now();

		// Should take at least 50ms + 100ms = 150ms
		expect(endTime - startTime).toBeGreaterThanOrEqual(150);
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("should respect max delay", async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new Error("Fail 1"))
			.mockRejectedValueOnce(new Error("Fail 2"))
			.mockResolvedValue("success");

		const startTime = Date.now();
		await retryWithBackoff(fn, {
			maxAttempts: 3,
			initialDelay: 100,
			maxDelay: 150,
			backoffMultiplier: 3,
		});
		const endTime = Date.now();

		// Second retry should be capped at maxDelay (150ms) instead of 300ms
		expect(endTime - startTime).toBeLessThan(300);
		expect(fn).toHaveBeenCalledTimes(3);
	});
});

describe("isRetryableError", () => {
	it("should return true for network errors", () => {
		expect(isRetryableError(new Error("Network error occurred"))).toBe(true);
		expect(isRetryableError(new Error("Connection timeout"))).toBe(true);
		expect(isRetryableError(new Error("Fetch failed"))).toBe(true);
	});

	it("should return true for server errors", () => {
		expect(isRetryableError(new Error("500 Internal Server Error"))).toBe(true);
		expect(isRetryableError(new Error("503 Service Unavailable"))).toBe(true);
	});

	it("should return false for non-retryable errors", () => {
		expect(isRetryableError(new Error("Validation failed"))).toBe(false);
		expect(isRetryableError(new Error("Not found"))).toBe(false);
		expect(isRetryableError(new Error("Unauthorized"))).toBe(false);
	});

	it("should return false for non-Error objects", () => {
		expect(isRetryableError("string error")).toBe(false);
		expect(isRetryableError(null)).toBe(false);
		expect(isRetryableError(undefined)).toBe(false);
	});
});
