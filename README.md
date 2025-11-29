# Receipts tracking app. 

This app allows users to track screenshots or receipts of messages that occur throughout the day, so that they can review it or reorganize it e.g. save the screenshot to a particular project folder at the end of the day. This acts like a photo album classified by folders with dates DDMMYYYY. Each screenshot will be titled "DDMMYY - HHMM - screenshot.png" (with automatic incrementing to screenshot_2.png, screenshot_3.png, etc. for duplicates with the same date/time). 

This app is built with TanStack Start and uses raw PostgreSQL client for all database operations to ensure maximum reliability in Cloudflare Workers environment. Drizzle ORM is used for schema definition and migrations.

We will be using pnpm.

## Filename Conventions

The application uses a standardized filename format for all screenshots:

- **Format**: `DDMMYY - HHMM - screenshot.png`
- **Auto-generated**: When uploading files without the standard format, the system automatically generates filenames using the current timestamp
- **Duplicate handling**: If a filename already exists, the system appends an incrementing number (e.g., `screenshot_2.png`, `screenshot_3.png`)
- **Folder organization**: Screenshots are automatically organized into date-based folders using the DDMMYY prefix from the filename

## Features
* Upload screenshots (with drag-and-drop, file picker, or clipboard paste)
* View screenshots with full-screen viewer
* Add and edit notes for screenshots with hashtag support (#tags)
* **AI-powered note generation** (optional, requires API key)
  - Automatically generate descriptive notes from screenshot content
  - Suggests relevant hashtags based on your usage patterns
  - Supports OpenAI (GPT-4o-mini) and Anthropic (Claude 3.5 Sonnet)
* Tag-based organization and search
* Autocomplete suggestions for previously used hashtags
* Download screenshots with notes as text files
* Rename screenshots
* Delete screenshots (single or batch)
* Screenshots are stored persistently in PostgreSQL database
* File explorer/folder navigation tool that auto-organizes screenshots based on DDMMYY prefix
* Search screenshots by name or hashtags across all folders
* Multi-user profiles with isolated screenshot storage

## Technical Architecture

### Database Strategy
The application uses a hybrid approach for database operations:
- **Raw PostgreSQL Client**: Used for all core operations (`uploadScreenshot`, `getScreenshots`, `updateScreenshotNotes`, `renameScreenshot`, `deleteScreenshot`, `batchDeleteScreenshots`, `batchMoveScreenshots`, and `downloadScreenshotWithNotes`) to ensure maximum reliability in Cloudflare Workers environment
- **Drizzle ORM**: Used for schema definition and migrations, providing type safety at the schema level

This ensures maximum compatibility with Cloudflare Workers while maintaining developer experience.

## API Reference

### User Management (`src/server/users.ts`)

#### `getUsers()`
Retrieves all user profiles ordered by creation date (newest first).

**Returns**: Array of user objects with `id`, `email`, `name`, and `createdAt`

#### `createUser(data: CreateUserInput)`
Creates a new user profile with email uniqueness validation.

**Parameters**:
- `name`: User's display name (required)
- `email`: User's email address (required, must be unique)

**Returns**: `{ success: boolean, user: User }`

**Throws**: Error if email already exists or validation fails

#### `updateUser(data: UpdateUserInput)`
Updates a user's display name.

**Parameters**:
- `id`: User ID (required)
- `name`: New display name (required)

**Returns**: `{ success: boolean, user: User }`

**Throws**: Error if user not found

#### `deleteUser(data: DeleteUserInput)`
Deletes a user profile. Only allowed if the user has no screenshots.

**Parameters**:
- `id`: User ID (required)

**Returns**: `{ success: boolean }`

**Throws**: Error if user has screenshots or user not found

### Filename Utilities (`src/utils/filename.ts`)

#### `parseFilename(filename: string): ParsedFilename`
Parses a filename in the standard format and extracts date, time, and name components.

**Returns**: `{ date: string, time: string, name: string, isValid: boolean }`

#### `generateFilename(): string`
Generates a filename with the current timestamp in "DDMMYY - HHMM - screenshot.png" format.

**Returns**: Generated filename (always uses "screenshot" as the name, no custom name parameter)

#### `generateUniqueFilename(baseFilename: string, existingFilenames: string[]): string`
Generates a unique filename by checking for duplicates and incrementing the counter if needed.

**Parameters**:
- `baseFilename`: The base filename (e.g., "271124 - 1430 - screenshot.png")
- `existingFilenames`: Array of existing filenames to check against

**Returns**: Unique filename with increment if needed (e.g., "271124 - 1430 - screenshot_2.png")

#### `formatFolderDate(ddmmyy: string): string`
Formats a DDMMYY date string for display (e.g., "271124" → "27/11/24").

#### `extractFolderDate(filename: string): string`
Extracts the DDMMYY date from a filename, or returns the current date if the filename doesn't follow the standard format.

## Installation

```bash
pnpm install
```

## Database Setup

1. Ensure PostgreSQL is running and accessible
2. Update `.env.local` with your database connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/receipts_tracker"
   ```
3. Run migrations to create the database schema:
   ```bash
   pnpm db:migrate
   ```
4. (Optional) Seed the database with demo data:
   ```bash
   pnpm tsx scripts/seed.ts
   ```

## Authentication Setup

The application uses Google OAuth for secure authentication. You have two options:

### Option 1: Development Mode (Quick Start)

For local development without OAuth setup, use development mode:

```bash
# .env.local
DEV_MODE="true"
DEV_USER_ID="1"
```

**Warning**: Never use development mode in production!

### Option 2: Google OAuth (Production)

For production or to test the full authentication flow:

1. Set up Google OAuth credentials (see [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed instructions)
2. Add to your `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/auth/callback"
   ```

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for complete setup instructions including:
- Creating a Google Cloud project
- Configuring OAuth consent screen
- Setting up authorized redirect URIs
- Production deployment considerations

## AI Configuration (Optional)

To enable AI-powered note generation, add one of the following to your `.env.local`:

### Option 1: OpenAI
```bash
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"  # Optional, defaults to gpt-4o-mini
```

### Option 2: Anthropic Claude
```bash
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"  # Optional
```

When configured, a "Generate with AI" button will appear in the screenshot viewer, allowing you to automatically generate descriptive notes with relevant hashtags.

The seed script creates:
- Two test users (test@example.com and demo@example.com)
- 10 demo screenshots for user 1 across three date folders:
  - 5 receipts from today (9:00 AM - 1:00 PM)
  - 3 invoices from yesterday (2:00 PM - 4:00 PM)
  - 2 documents from last week (10:00 AM - 12:00 PM)
- 2 demo screenshots for user 2 from today
- Sample notes on some screenshots to demonstrate the notes feature

## Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

To view the seeded data, navigate to `/screenshots` and use user ID 1 or 2.


