# App Branding Configuration

You can customize the app name and favicon by setting environment variables.

## Environment Variables

### `VITE_APP_NAME`
The name that appears in the browser tab and PWA manifest.

**Default**: `"Receipts Tracker"`

**Examples**:
```bash
VITE_APP_NAME="My Receipt App"
VITE_APP_NAME="Company Receipts"
VITE_APP_NAME="Receipts Tracker - Dev"
```

### `VITE_APP_FAVICON`
The path to the favicon file (relative to the `public` folder).

**Default**: `"/favicon.ico"`

**Examples**:
```bash
VITE_APP_FAVICON="/favicon.ico"
VITE_APP_FAVICON="/custom-icon.png"
VITE_APP_FAVICON="/logo192.png"
```

## Configuration Files

### Local Development (`.env.local`)
```bash
VITE_APP_NAME="Receipts Tracker - Dev"
VITE_APP_FAVICON="/favicon.ico"
```

### Production (`.env.production`)
```bash
VITE_APP_NAME="Receipts Tracker"
VITE_APP_FAVICON="/favicon.ico"
```

## Custom Favicon

To use a custom favicon:

1. Add your icon file to the `public` folder (e.g., `public/my-icon.png`)
2. Update the environment variable:
   ```bash
   VITE_APP_FAVICON="/my-icon.png"
   ```
3. Restart your dev server or rebuild for production

## How It Works

- The app name is used in:
  - Browser tab title
  - PWA manifest (`manifest.json`)
  - App metadata

- The favicon is used in:
  - Browser tab icon
  - Bookmarks
  - PWA home screen icon (if applicable)

- The `scripts/generate-manifest.ts` script automatically generates `public/manifest.json` with your configured app name before building or running the dev server.

## Deployment

When deploying to Cloudflare Workers, the environment variables are read from `.env.production` during the build process. The generated `manifest.json` is included in the deployment bundle.

**Note**: Unlike other environment variables (like `DATABASE_URL`), these branding variables are **build-time** variables (prefixed with `VITE_`), so they are baked into the build and don't need to be set as Cloudflare secrets.

## Examples

### Different Names for Different Environments

**.env.local** (Development):
```bash
VITE_APP_NAME="Receipts Tracker [DEV]"
```

**.env.production** (Production):
```bash
VITE_APP_NAME="Receipts Tracker"
```

This helps you distinguish between development and production tabs when testing.

### Custom Branding

```bash
VITE_APP_NAME="Acme Corp Receipts"
VITE_APP_FAVICON="/acme-logo.png"
```

Add `public/acme-logo.png` and rebuild to see your custom branding!
