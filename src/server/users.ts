import { createServerFn } from "@tanstack/react-start";
import { Client } from "pg";

export interface User {
	id: number;
	email: string;
	name: string;
	createdAt: Date;
}

export interface CreateUserInput {
	name: string;
	email: string;
}

export interface UpdateUserInput {
	id: number;
	name: string;
}

export interface DeleteUserInput {
	id: number;
}

/**
 * Get all users
 */
export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const client = new Client({
			connectionString: process.env.DATABASE_URL!,
		});

		try {
			await client.connect();

			const result = await client.query(
				`SELECT id, email, name, created_at as "createdAt" 
				 FROM users 
				 ORDER BY created_at DESC`,
			);

			return result.rows;
		} finally {
			await client.end();
		}
	} catch (error) {
		console.error("Failed to get users:", error);
		throw new Error("Failed to retrieve users. Please try again.");
	}
});

/**
 * Create a new user profile
 */
export const createUser = createServerFn({ method: "POST" })
	.inputValidator((input: CreateUserInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.name || !data.email) {
			throw new Error("Name and email are required");
		}

		try {
			const { name, email } = data;

			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Check if email already exists
				const checkResult = await client.query(
					`SELECT id FROM users WHERE email = $1`,
					[email],
				);

				if (checkResult.rows.length > 0) {
					throw new Error("A user with this email already exists");
				}

				// Create user
				const result = await client.query(
					`INSERT INTO users (name, email)
					 VALUES ($1, $2)
					 RETURNING id, email, name, created_at as "createdAt"`,
					[name, email],
				);

				const user = result.rows[0];
				return { success: true, user };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Create user failed:", error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("Failed to create user. Please try again.");
		}
	});

/**
 * Update user profile name
 */
export const updateUser = createServerFn({ method: "POST" })
	.inputValidator((input: UpdateUserInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.id || !data.name) {
			throw new Error("ID and name are required");
		}

		try {
			const { id, name } = data;

			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Update user
				const result = await client.query(
					`UPDATE users 
					 SET name = $1
					 WHERE id = $2
					 RETURNING id, email, name, created_at as "createdAt"`,
					[name, id],
				);

				if (result.rows.length === 0) {
					throw new Error("User not found");
				}

				const user = result.rows[0];
				return { success: true, user };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Update user failed:", error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("Failed to update user. Please try again.");
		}
	});

/**
 * Delete user profile (only if no screenshots exist)
 */
export const deleteUser = createServerFn({ method: "POST" })
	.inputValidator((input: DeleteUserInput) => input)
	.handler(async ({ data }) => {
		// Validation
		if (!data.id) {
			throw new Error("User ID is required");
		}

		try {
			const { id } = data;

			const client = new Client({
				connectionString: process.env.DATABASE_URL!,
			});

			try {
				await client.connect();

				// Check if user has screenshots
				const screenshotCheck = await client.query(
					`SELECT COUNT(*) as count FROM screenshots WHERE user_id = $1`,
					[id],
				);

				const screenshotCount = Number.parseInt(
					screenshotCheck.rows[0].count,
					10,
				);

				if (screenshotCount > 0) {
					throw new Error(
						`Cannot delete user with ${screenshotCount} screenshot${screenshotCount === 1 ? "" : "s"}. Please delete all screenshots first.`,
					);
				}

				// Delete user
				const result = await client.query(
					`DELETE FROM users WHERE id = $1 RETURNING id`,
					[id],
				);

				if (result.rows.length === 0) {
					throw new Error("User not found");
				}

				return { success: true };
			} finally {
				await client.end();
			}
		} catch (error) {
			console.error("Delete user failed:", error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("Failed to delete user. Please try again.");
		}
	});
