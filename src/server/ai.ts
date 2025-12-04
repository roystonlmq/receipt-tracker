import { createServerFn } from "@tanstack/react-start";
import { Client } from "pg";
import { generateNotesFromImage, isAIEnabled } from "@/utils/ai";
import { getUserTags } from "@/server/tags";

export interface GenerateNotesInput {
	screenshotId: number;
	userId: number;
}

export interface GenerateNotesResult {
	success: boolean;
	notes?: string;
	tokensUsed?: number;
	provider?: string;
	error?: string;
}

/**
 * Generate notes for a screenshot using AI
 */
export const generateNotesWithAI = createServerFn({ method: "POST" })
	.inputValidator((input: GenerateNotesInput) => input)
	.handler(async ({ data }): Promise<GenerateNotesResult> => {
		const { screenshotId, userId } = data;

		// Check if AI is enabled
		if (!isAIEnabled()) {
			return {
				success: false,
				error:
					"AI features are not configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in your environment.",
			};
		}

		try {
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Verify screenshot belongs to user
				const screenshotResult = await client.query(
					`SELECT id, image_data as "imageData" 
					 FROM screenshots 
					 WHERE id = $1 AND user_id = $2`,
					[screenshotId, userId],
				);

				if (screenshotResult.rows.length === 0) {
					return {
						success: false,
						error: "Screenshot not found or access denied.",
					};
				}

				const screenshot = screenshotResult.rows[0];

				// Get user's existing tags for context
				const userTagsResult = await getUserTags({
					data: { userId, sortBy: "usage" },
				});
				const userTags = userTagsResult.slice(0, 10).map((t) => t.tag);

				// Generate notes using AI
				const result = await generateNotesFromImage(
					screenshot.imageData,
					userTags,
				);

				// Log token usage
				console.log(
					`[AI] Generated notes for screenshot ${screenshotId} using ${result.provider}. Tokens: ${result.tokensUsed || "unknown"}`,
				);

				return {
					success: true,
					notes: result.notes,
					tokensUsed: result.tokensUsed,
					provider: result.provider,
				};
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to generate notes with AI:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to generate notes. Please try again.",
			};
		}
	});

/**
 * Refine existing notes using AI
 */
export const refineNotesWithAI = createServerFn({ method: "POST" })
	.inputValidator((input: { userId: number; existingNotes: string }) => input)
	.handler(async ({ data }): Promise<GenerateNotesResult> => {
		const { userId, existingNotes } = data;

		// Check if AI is enabled
		if (!isAIEnabled()) {
			return {
				success: false,
				error:
					"AI features are not configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in your environment.",
			};
		}

		try {
			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Get user's existing tags for context
				const userTagsResult = await getUserTags({
					data: { userId, sortBy: "usage" },
				});
				const userTags = userTagsResult.slice(0, 10).map((t) => t.tag);

				// Import refine function
				const { refineNotesWithAI: refineNotes } = await import("@/utils/ai");

				// Refine notes using AI
				const result = await refineNotes(existingNotes, userTags);

				// Log token usage
				console.log(
					`[AI] Refined notes for user ${userId} using ${result.provider}. Tokens: ${result.tokensUsed || "unknown"}`,
				);

				return {
					success: true,
					notes: result.notes,
					tokensUsed: result.tokensUsed,
					provider: result.provider,
				};
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Failed to refine notes with AI:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to refine notes. Please try again.",
			};
		}
	});

/**
 * Check if AI features are available
 */
export const checkAIAvailability = createServerFn({ method: "GET" }).handler(
	async () => {
		return {
			available: isAIEnabled(),
		};
	},
);
