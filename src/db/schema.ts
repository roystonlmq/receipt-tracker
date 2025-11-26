import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
