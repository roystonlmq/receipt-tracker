# Receipts Tracker - Setup Instructions

## Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database running
2. **Node.js**: Version 18 or higher
3. **pnpm**: Package manager

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Database

Edit `.env.local` and update the `DATABASE_URL` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
```

### 3. Run Database Migrations

```bash
pnpm db:push
```

This will create the `users` and `screenshots` tables in your database.

### 4. Seed the Database (Optional)

Create a test user:

```bash
pnpm db:seed
```

This creates a user with ID=1 that the app uses by default.

### 5. Start the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Usage

1. **Upload Screenshots**: 
   - Drag and drop images onto the upload area
   - Or click to select files
   - Supports PNG, JPG, JPEG up to 10MB

2. **View Screenshots**:
   - Screenshots are automatically organized by date (DDMMYY format)
   - Click on a folder to view screenshots from that date
   - Click "Back to folders" to return to the folder view

3. **Screenshot Naming**:
   - Files are automatically named with format: `DDMMYY - HHMM - screenshot.png`
   - If your file already follows this format, it will be preserved
   - Otherwise, the current timestamp will be used

## Features Implemented

✅ Database schema with users and screenshots tables
✅ File upload with validation (PNG/JPG/JPEG, 10MB limit)
✅ Automatic filename generation with timestamps
✅ Date-based folder organization
✅ Thumbnail display with metadata
✅ Responsive UI with gradient background
✅ Upload progress tracking
✅ Error handling

## Next Steps

To add more features:
- Screenshot viewer (full-size view)
- Rename functionality (F2 key)
- Delete functionality with confirmation
- Notes feature
- Search functionality
- Batch operations

See `tasks.md` for the complete implementation plan.
