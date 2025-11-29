/**
 * AI utility functions for note generation
 */

export interface AIConfig {
	provider: "openai" | "anthropic" | "gemini";
	apiKey: string;
	model?: string;
}

export interface AIGenerationResult {
	notes: string;
	tokensUsed?: number;
	provider: string;
}

/**
 * Get AI configuration from environment variables
 */
export function getAIConfig(): AIConfig | null {
	const openaiKey = process.env.OPENAI_API_KEY;
	const anthropicKey = process.env.ANTHROPIC_API_KEY;
	const geminiKey = process.env.GEMINI_API_KEY;

	if (openaiKey) {
		return {
			provider: "openai",
			apiKey: openaiKey,
			model: process.env.OPENAI_MODEL || "gpt-4o-mini",
		};
	}

	if (anthropicKey) {
		return {
			provider: "anthropic",
			apiKey: anthropicKey,
			model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
		};
	}

	if (geminiKey) {
		return {
			provider: "gemini",
			apiKey: geminiKey,
			model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
		};
	}

	return null;
}

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
	return getAIConfig() !== null;
}

/** @
 * Build AI prompt for note generation
 */
export function buildAIPrompt(userTags: string[]): string {
	const tagContext =
		userTags.length > 0
			? `\n\nTag suggestions (user's existing tags): ${userTags.map((t) => `#${t}`).join(", ")}`
			: "";

	return `You are analyzing a screenshot/receipt image. Generate descriptive notes in bullet point format.

Format your response as bullet points covering:
- Type of document/content
- People involved: If you detect any names (from conversations, emails, or visible in screenshot), write them as hashtags in lowercase (e.g., #adam, #bob, #charlie)
- Key information (amounts, dates, locations, etc.)
- If there are multiple items, specify the count and list each item
- Purpose or context

IMPORTANT: When mentioning people, ALWAYS format their names as hashtags with lowercase letters and hyphens for spaces (e.g., #john-doe, #sarah, #mike-chen).

At the very end, add a separate section:
"Suggested tags: [list 2-3 additional relevant tags for project/category, without the # symbol]"${tagContext}

Keep each bullet point concise and actionable.`;
}

/**
 * Call OpenAI API for note generation
 */
export async function callOpenAI(
	config: AIConfig,
	imageData: string,
	prompt: string,
): Promise<AIGenerationResult> {
	// Remove data URL prefix if present
	const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${config.apiKey}`,
		},
		body: JSON.stringify({
			model: config.model || "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: prompt,
						},
						{
							type: "image_url",
							image_url: {
								url: `data:image/png;base64,${base64Image}`,
							},
						},
					],
				},
			],
			max_tokens: 300,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`OpenAI API error: ${error.error?.message || response.statusText}`,
		);
	}

	const data = await response.json();
	const notes = data.choices[0]?.message?.content || "";
	const tokensUsed = data.usage?.total_tokens;

	return {
		notes,
		tokensUsed,
		provider: "openai",
	};
}

/**
 * Call Anthropic Claude API for note generation
 */
export async function callClaude(
	config: AIConfig,
	imageData: string,
	prompt: string,
): Promise<AIGenerationResult> {
	// Remove data URL prefix and get media type
	const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
	if (!matches) {
		throw new Error("Invalid image data format");
	}

	const mediaType = matches[1];
	const base64Image = matches[2];

	const response = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": config.apiKey,
			"anthropic-version": "2023-06-01",
		},
		body: JSON.stringify({
			model: config.model || "claude-3-5-sonnet-20241022",
			max_tokens: 300,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "image",
							source: {
								type: "base64",
								media_type: mediaType,
								data: base64Image,
							},
						},
						{
							type: "text",
							text: prompt,
						},
					],
				},
			],
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Claude API error: ${error.error?.message || response.statusText}`,
		);
	}

	const data = await response.json();
	const notes =
		data.content?.find((c: any) => c.type === "text")?.text || "";
	const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens;

	return {
		notes,
		tokensUsed,
		provider: "anthropic",
	};
}

/**
 * Call Google Gemini API for note generation
 */
export async function callGemini(
	config: AIConfig,
	imageData: string,
	prompt: string,
): Promise<AIGenerationResult> {
	// Remove data URL prefix and get media type
	const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
	if (!matches) {
		throw new Error("Invalid image data format");
	}

	const mimeType = matches[1];
	const base64Image = matches[2];

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${config.model || "gemini-1.5-flash"}:generateContent?key=${config.apiKey}`,
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
								text: prompt,
							},
							{
								inline_data: {
									mime_type: mimeType,
									data: base64Image,
								},
							},
						],
					},
				],
				generationConfig: {
					maxOutputTokens: 1000,
				},
			}),
		},
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Gemini API error: ${error.error?.message || response.statusText}`,
		);
	}

	const data = await response.json();
	
	// Log the full response for debugging
	console.log("[Gemini] Full API response:", JSON.stringify(data, null, 2));
	
	// Check if content was blocked
	if (data.candidates?.[0]?.finishReason === "SAFETY") {
		console.warn("[Gemini] Content was blocked by safety filters");
		throw new Error("Content was blocked by Gemini's safety filters. Try a different image.");
	}
	
	const notes = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
	const tokensUsed = data.usageMetadata?.totalTokenCount;
	
	console.log("[Gemini] Extracted notes:", notes);
	console.log("[Gemini] Tokens used:", tokensUsed);

	return {
		notes,
		tokensUsed,
		provider: "gemini",
	};
}

/**
 * Generate notes from image using AI
 */
export async function generateNotesFromImage(
	imageData: string,
	userTags: string[] = [],
): Promise<AIGenerationResult> {
	const config = getAIConfig();

	if (!config) {
		throw new Error("AI is not configured. Please set API keys in .env.local");
	}

	const prompt = buildAIPrompt(userTags);

	try {
		if (config.provider === "openai") {
			return await callOpenAI(config, imageData, prompt);
		}
		if (config.provider === "anthropic") {
			return await callClaude(config, imageData, prompt);
		}
		return await callGemini(config, imageData, prompt);
	} catch (error) {
		console.error("AI generation failed:", error);
		throw error;
	}
}
