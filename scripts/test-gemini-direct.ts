/**
 * Direct test of Gemini API to check model availability
 */
import { config } from "dotenv";

config({ path: ".env.local" });

async function testGeminiDirect() {
	const apiKey = process.env.GEMINI_API_KEY;
	const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

	console.log(`Testing Gemini API with model: ${model}\n`);

	// Simple text-only test first
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: "Say hello and confirm you're working!",
							},
						],
					},
				],
			}),
		},
	);

	const data = await response.json();

	if (!response.ok) {
		console.error("❌ API Error:");
		console.error(JSON.stringify(data, null, 2));
		return;
	}

	console.log("✅ API Response:");
	console.log(JSON.stringify(data, null, 2));
}

testGeminiDirect().catch(console.error);
