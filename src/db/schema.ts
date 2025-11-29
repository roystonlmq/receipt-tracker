import {
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		email: text("email").notNull().unique(),
		name: text("name"),
		googleId: text("google_id").unique(),
		picture: text("picture"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		googleIdIdx: index("users_google_id_idx").on(table.googleId),
	}),
);

export const screenshots = pgTable(
	"screenshots",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		filename: text("filename").notNull(),
		originalFilename: text("original_filename").notNull(),
		imageData: text("image_data").notNull(), // Base64 encoded
		mimeType: text("mime_type").notNull(),
		fileSize: integer("file_size").notNull(),
		captureDate: timestamp("capture_date"), // Extracted from filename or EXIF
		uploadDate: timestamp("upload_date").defaultNow().notNull(),
		notes: text("notes"),
		folderDate: text("folder_date").notNull(), // DDMMYY format for grouping
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("screenshots_user_id_idx").on(table.userId),
		folderDateIdx: index("screenshots_folder_date_idx").on(table.folderDate),
		uploadDateIdx: index("screenshots_upload_date_idx").on(table.uploadDate),
	}),
);

export const tags = pgTable(
	"tags",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		tag: text("tag").notNull(), // Normalized (lowercase)
		firstUsed: timestamp("first_used").defaultNow().notNull(),
		lastUsed: timestamp("last_used").defaultNow().notNull(),
		usageCount: integer("usage_count").default(1).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		// Composite unique constraint: one tag per user
		userTagUnique: unique().on(table.userId, table.tag),
		// Indexes for performance
		userIdIdx: index("tags_user_id_idx").on(table.userId),
		tagIdx: index("tags_tag_idx").on(table.tag),
		lastUsedIdx: index("tags_last_used_idx").on(table.lastUsed),
	}),
);

export const sessions = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("sessions_user_id_idx").on(table.userId),
		expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
	}),
);

export const tempSessions = pgTable(
	"temp_sessions",
	{
		id: text("id").primaryKey(),
		codeVerifier: text("code_verifier").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		expiresAtIdx: index("temp_sessions_expires_at_idx").on(table.expiresAt),
	}),
);
