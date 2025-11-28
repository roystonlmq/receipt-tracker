import { describe, it, expect, beforeEach } from "vitest";
import {
	detectPlatform,
	getPlatform,
	formatShortcut,
	resetPlatformCache,
} from "./platform";

describe("Platform Detection", () => {
	beforeEach(() => {
		// Reset the cached platform before each test
		resetPlatformCache();
	});

	describe("detectPlatform", () => {
		it("should detect macOS from navigator.platform", () => {
			// Mock navigator for macOS
			Object.defineProperty(global.navigator, "platform", {
				value: "MacIntel",
				configurable: true,
			});

			const platform = detectPlatform();
			expect(platform.platform).toBe("mac");
			expect(platform.isMac).toBe(true);
			expect(platform.modifierKey).toBe("Cmd");
			expect(platform.modifierSymbol).toBe("⌘");
		});

		it("should detect Windows from navigator.platform", () => {
			Object.defineProperty(global.navigator, "platform", {
				value: "Win32",
				configurable: true,
			});

			const platform = detectPlatform();
			expect(platform.platform).toBe("windows");
			expect(platform.isWindows).toBe(true);
			expect(platform.modifierKey).toBe("Ctrl");
			expect(platform.modifierSymbol).toBe("Ctrl");
		});

		it("should detect Linux from navigator.platform", () => {
			Object.defineProperty(global.navigator, "platform", {
				value: "Linux x86_64",
				configurable: true,
			});

			const platform = detectPlatform();
			expect(platform.platform).toBe("linux");
			expect(platform.isLinux).toBe(true);
			expect(platform.modifierKey).toBe("Ctrl");
		});

		it("should fallback to unknown when platform cannot be detected", () => {
			Object.defineProperty(global.navigator, "platform", {
				value: "Unknown",
				configurable: true,
			});

			const platform = detectPlatform();
			expect(platform.platform).toBe("unknown");
			expect(platform.modifierKey).toBe("Ctrl");
		});

		it("should detect macOS from user agent when platform is unavailable", () => {
			Object.defineProperty(global.navigator, "platform", {
				value: "",
				configurable: true,
			});
			Object.defineProperty(global.navigator, "userAgent", {
				value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
				configurable: true,
			});

			const platform = detectPlatform();
			expect(platform.platform).toBe("mac");
		});
	});

	describe("getPlatform", () => {
		it("should return cached platform info", () => {
			const platform1 = getPlatform();
			const platform2 = getPlatform();

			expect(platform1).toBe(platform2);
			expect(platform1.platform).toBe(platform2.platform);
		});
	});

	describe("formatShortcut", () => {
		it("should format shortcut with detected platform modifier", () => {
			const platform = getPlatform();
			const shortcut = formatShortcut("D");
			expect(shortcut).toBe(`${platform.modifierKey}+D`);
		});

		it("should format shortcut with symbol when useSymbol is true", () => {
			const platform = getPlatform();
			const shortcut = formatShortcut("D", true);
			expect(shortcut).toBe(`${platform.modifierSymbol}+D`);
		});

		it("should format shortcut with any key", () => {
			const platform = getPlatform();
			const shortcut = formatShortcut("S");
			expect(shortcut).toBe(`${platform.modifierKey}+S`);
		});
	});
});
