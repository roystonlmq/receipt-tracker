/**
 * Test script for Gemini AI integration
 */
import { config } from "dotenv";
import { generateNotesFromImage, isAIEnabled } from "../src/utils/ai";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function testGemini() {
	console.log("Testing Gemini AI integration...\n");

	// Check if AI is enabled
	if (!isAIEnabled()) {
		console.error("❌ AI is not enabled. Please check your .env.local file.");
		process.exit(1);
	}

	console.log("✅ AI is enabled");

	// Create a simple test image (1x1 red pixel PNG)
	const testImage =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

	try {
		console.log("\nGenerating notes from test image...");
		const result = await generateNotesFromImage(testImage, [
			"test",
			"receipt",
		]);

		console.log("\n✅ Success!");
		console.log(`Provider: ${result.provider}`);
		console.log(`Tokens used: ${result.tokensUsed || "unknown"}`);
		console.log(`Notes length: ${result.notes.length} characters`);
		console.log(`Notes: "${result.notes}"`);

		if (!result.notes || result.notes.trim().length === 0) {
			console.warn(
				"\n⚠️  Warning: Notes are empty. This might be due to the simple test image.",
			);
			console.log(
				"Try uploading a real screenshot through the app to test with actual content.",
			);
		}
	} catch (error) {
		console.error("\n❌ Error:", error);
		if (error instanceof Error) {
			console.error("Message:", error.message);
			console.error("Stack:", error.stack);
		}
		process.exit(1);
	}
}

testGemini();
