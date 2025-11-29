# Deployment Guide

## Deploying to Cloudflare Workers

This app is configured to deploy to Cloudflare Workers using Wrangler.

### Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com/sign-up
2. **Wrangler CLI** - Already configured in this project
3. **PostgreSQL Database** - You'll need a hosted PostgreSQL database
4. **Google OAuth Credentials** - Required for user authentication
5. **AI API Key** (Optional) - For AI-powered note generation (OpenAI, Anthropic, or Gemini)

### Step 1: Set Up Database

You need a PostgreSQL database accessible from the internet. Options:

**Option A: Neon (Recommended - Free tier available)**
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string

**Option B: Supabase (Free tier available)**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the connection string

**Option C: Railway (Free trial)**
1. Go to https://railway.app
2. Create a PostgreSQL database
3. Copy the connection string

### Step 2: Update Database Schema

Run migrations on your production database to create all required tables.

**Option A: Using .env.production file (Recommended)**

1. Create or update `.env.production` with your production database URL:
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

2. Run migrations using the production environment:
```bash
# Load .env.production and push schema
pnpm db:push
```

**Option B: Set environment variable temporarily**

```bash
# PowerShell (Windows)
$env:DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
pnpm db:push

# Bash/Zsh (Mac/Linux)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require" pnpm db:push
```

This will create:
- `users` table - User profiles with Google OAuth integration
- `screenshots` table - Screenshot storage with metadata
- `sessions` table - User session management (30-day expiration)
- `temp_sessions` table - OAuth state management
- `tags` table - Tag system for organizing screenshots

### Step 3: Initial Deploy to Get Your URL

First, deploy to Cloudflare to get your production URL:

```bash
# Login to Cloudflare
npx wrangler login

# Build and deploy
pnpm run deploy
```

This will provide you with a URL like: `https://receipts-tracker.abc123.workers.dev`

**Important**: Copy this URL! You'll need it for the next steps.

### Step 4: Set Up Google OAuth

Now that you have your production URL, set up Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Configure OAuth consent screen:
   - App name: Your app name
   - User support email: Your email
   - Add scopes: `openid`, `email`, `profile`
5. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `https://receipts-tracker.abc123.workers.dev` (use your actual URL)
   - Authorized redirect URIs: `https://receipts-tracker.abc123.workers.dev/auth/callback` (use your actual URL)
6. Copy the Client ID and Client Secret

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed instructions.

### Step 5: Configure Environment Variables

**Important**: While you can keep a `.env.production` file locally for reference, Cloudflare Workers requires secrets to be set using the `wrangler secret` command. The `.env.production` file is NOT automatically deployed.

#### Optional: Create .env.production for Local Reference

You can create a `.env.production` file to keep track of your production configuration:

```bash
# .env.production (for reference only, not deployed)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
GOOGLE_REDIRECT_URI="https://receipts-tracker.abc123.workers.dev/auth/callback"
GEMINI_API_KEY="AIzaSyXXX"
GEMINI_MODEL="gemini-2.0-flash-exp"
```

This file is already in `.gitignore` and won't be committed to version control.

#### Add Secrets to Cloudflare Workers

Now add all secrets to Cloudflare (these are the values that will actually be used in production):

```bash
# Add database URL
npx wrangler secret put DATABASE_URL
# When prompted, paste: postgresql://user:pass@host:5432/db?sslmode=require

# Add Google OAuth credentials
npx wrangler secret put GOOGLE_CLIENT_ID
# When prompted, paste: your-client-id.apps.googleusercontent.com

npx wrangler secret put GOOGLE_CLIENT_SECRET
# When prompted, paste: GOCSPX-xxx

npx wrangler secret put GOOGLE_REDIRECT_URI
# When prompted, paste: https://receipts-tracker.abc123.workers.dev/auth/callback
# IMPORTANT: Use your actual Cloudflare Workers URL from Step 3!
```

#### Optional: Add AI Provider (Choose One)

**Option A: Google Gemini (Recommended - Free tier available)**
```bash
npx wrangler secret put GEMINI_API_KEY
# When prompted, paste: AIzaSyXXX

# Optional: Set model (defaults to gemini-2.0-flash-exp)
npx wrangler secret put GEMINI_MODEL
# When prompted, paste: gemini-2.0-flash-exp
```

**Option B: OpenAI**
```bash
npx wrangler secret put OPENAI_API_KEY
# When prompted, paste: sk-xxx

# Optional: Set model (defaults to gpt-4o-mini)
npx wrangler secret put OPENAI_MODEL
# When prompted, paste: gpt-4o-mini
```

**Option C: Anthropic Claude**
```bash
npx wrangler secret put ANTHROPIC_API_KEY
# When prompted, paste: sk-ant-xxx

# Optional: Set model
npx wrangler secret put ANTHROPIC_MODEL
# When prompted, paste: claude-3-5-sonnet-20241022
```

**Important**: Never set `DEV_MODE=true` in production!

### Step 6: Redeploy with Environment Variables

Now that all secrets are configured, deploy again:

```bash
pnpm run deploy
```

This deployment will now have access to all your environment variables.

### Step 7: Test Authentication

1. Visit your production URL (e.g., `https://receipts-tracker.abc123.workers.dev`)
2. You should be redirected to the login page
3. Click "Sign in with Google"
4. Grant permissions
5. You should be logged in and redirected to the app

If you get a "redirect_uri_mismatch" error, verify that the redirect URI in Google Cloud Console exactly matches what you set in `GOOGLE_REDIRECT_URI`.

### Step 8: Seed Production Data (Optional)

If you want demo data in production:

**Option A: Using .env.production file**
```bash
# Ensure .env.production has your DATABASE_URL
npx tsx scripts/seed.ts
```

**Option B: Set environment variable temporarily**
```bash
# PowerShell (Windows)
$env:DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
npx tsx scripts/seed.ts

# Bash/Zsh (Mac/Linux)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require" npx tsx scripts/seed.ts
```

### Configuration Files

The deployment is configured in:
- `wrangler.jsonc` - Cloudflare Workers configuration
- `vite.config.ts` - Build configuration with Cloudflare adapter
- `.env.example` - Template for environment variables
- `.env.production` - Production environment variables (for local reference only, not deployed)

**Note**: The `.env.production` file is useful for keeping track of your production configuration locally, but Cloudflare Workers does not read from this file. You must set all secrets using `npx wrangler secret put` commands as shown in Step 5.

### Understanding Environment Variables

There are two different contexts where environment variables are used:

1. **Local Scripts** (database migrations, seeding):
   - Use `.env.production` file or temporary environment variables
   - Commands like `pnpm db:push` and `npx tsx scripts/seed.ts` read from `.env.production`
   - This is for running scripts from your local machine against the production database

2. **Cloudflare Workers** (deployed application):
   - Use `wrangler secret put` commands
   - These secrets are stored in Cloudflare and used by your deployed app
   - The `.env.production` file is NOT deployed or read by Cloudflare

## Environment Variables Reference

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | `GOCSPX-xxx` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `https://your-domain.com/auth/callback` |

### Optional (AI Features)

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSyXXX` |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.0-flash-exp` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-xxx` |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-xxx` |
| `ANTHROPIC_MODEL` | Claude model to use | `claude-3-5-sonnet-20241022` |

### Development Only (Never use in production!)

| Variable | Description | Example |
|----------|-------------|---------|
| `DEV_MODE` | Bypass authentication | `true` |
| `DEV_USER_ID` | User ID for dev mode | `1` |

### Custom Domain (Optional)

To use your own domain:

1. Add domain in Cloudflare dashboard
2. Update `wrangler.jsonc`:
```json
{
  "routes": [
    {
      "pattern": "receipts.yourdomain.com",
      "custom_domain": true
    }
  ]
}
```

3. Deploy again: `pnpm run deploy`

## Alternative: Deploy to Vercel

If you prefer Vercel over Cloudflare:

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Configure for Vercel
Update `vite.config.ts` to use Vercel adapter instead of Cloudflare.

### Step 3: Deploy
```bash
vercel
```

Follow the prompts to:
1. Link to your Vercel account
2. Set up the project
3. Add DATABASE_URL environment variable
4. Deploy

## Troubleshooting

### Database Connection Issues
- Ensure your database allows connections from Cloudflare IPs
- Check that DATABASE_URL is correctly set
- Verify SSL mode if required (Neon requires `sslmode=require`)

### OAuth Issues

**"redirect_uri_mismatch" Error**
- Verify `GOOGLE_REDIRECT_URI` matches exactly what's in Google Cloud Console
- Include the protocol (`https://`)
- Don't include trailing slashes

**"invalid_client" Error**
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure no extra spaces or quotes in environment variables

**Session Not Persisting**
- Verify the `sessions` table was created
- Check database connection is working
- Sessions expire after 30 days

### AI Features Not Working

**"AI not configured" Error**
- Ensure at least one AI provider's API key is set
- Supported providers: `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`
- Verify the API key is valid and has sufficient credits

**Gemini API Errors**
- Check your API key at https://aistudio.google.com/app/apikey
- Verify the model name is correct (e.g., `gemini-2.0-flash-exp`)
- Ensure you're within rate limits

### Build Errors
- Run `pnpm build` locally first to catch errors
- Check that all dependencies are in `package.json`
- Ensure TypeScript has no errors: `pnpm tsc --noEmit`

### Runtime Errors
- Check Cloudflare Workers logs: `npx wrangler tail`
- Verify all required environment variables are set
- Test locally first: `pnpm dev`

## Monitoring

After deployment:

1. **View logs**: `npx wrangler tail`
2. **Check analytics**: Cloudflare dashboard → Workers → Your worker
3. **Monitor errors**: Set up error tracking (Sentry, etc.)

## Updating

To deploy updates:

```bash
# Make your changes
# Test locally
pnpm dev

# Deploy
pnpm run deploy
```

Cloudflare Workers will automatically handle zero-downtime deployments.

## Cost Breakdown

### Hosting
**Cloudflare Workers Free Tier**:
- 100,000 requests/day
- 10ms CPU time per request
- Perfect for personal use or small teams
- Paid plan: $5/month for 10M requests

### Database
- **Neon** (Recommended): Free tier with 0.5GB storage, 10GB transfer
- **Supabase**: Free tier with 500MB storage, 2GB transfer
- **Railway**: $5/month after trial

### Authentication
- **Google OAuth**: Free (no limits for standard OAuth)

### AI Features (Optional)
- **Google Gemini**: 
  - Free tier: 15 requests/minute, 1500 requests/day
  - Paid: Pay-as-you-go pricing
- **OpenAI**: 
  - GPT-4o-mini: ~$0.15 per 1M input tokens
  - GPT-4o: ~$2.50 per 1M input tokens
- **Anthropic Claude**: 
  - Claude 3.5 Sonnet: ~$3 per 1M input tokens

### Total Cost for Personal Use
- **Minimum**: $0/month (using all free tiers)
- **Typical**: $0-10/month (depending on AI usage)
- **With paid database**: $5-15/month

## Security Notes

1. **Never commit** `.env.local` or `.env.production` to git (already in `.gitignore`)
2. **Use Cloudflare secrets** for all sensitive data (API keys, OAuth credentials)
3. **HTTPS required** - Google OAuth requires HTTPS in production
4. **Never use DEV_MODE in production** - This bypasses authentication entirely
5. **Rotate secrets regularly** - Regenerate OAuth credentials and API keys periodically
6. **Session security** - Sessions are stored in PostgreSQL with 30-day expiration
7. **Database security** - Ensure your database has proper access controls and SSL enabled
8. **Monitor OAuth usage** - Check Google Cloud Console for unusual activity
9. **Limit OAuth scopes** - Only request necessary permissions (openid, email, profile)

## Feature Configuration

### AI-Powered Note Generation

The app supports three AI providers for automatic note generation from screenshots:

1. **Google Gemini** (Recommended)
   - Free tier available
   - Fast and cost-effective
   - Get API key: https://aistudio.google.com/app/apikey
   - Models: `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.5-flash`

2. **OpenAI**
   - Requires paid account
   - High quality results
   - Get API key: https://platform.openai.com/api-keys
   - Models: `gpt-4o-mini`, `gpt-4o`

3. **Anthropic Claude**
   - Requires paid account
   - Excellent for complex analysis
   - Get API key: https://console.anthropic.com/
   - Models: `claude-3-5-sonnet-20241022`

Set only one provider's API key. The app will automatically detect and use the configured provider.

### Multi-User Support

The app supports multiple users with isolated screenshot storage:
- Each user has their own profile and screenshots
- Authentication via Google OAuth
- Session management with 30-day expiration
- Automatic session cleanup

### Tag System

Users can organize screenshots with tags:
- Hashtag-based tagging (#project, #receipt, etc.)
- AI-powered tag suggestions
- Tag filtering and search

## Next Steps

After deployment:
1. Test authentication flow with Google OAuth
2. Upload a test screenshot and verify storage
3. Test AI note generation (if configured)
4. Set up custom domain (optional)
5. Configure database backups
6. Set up monitoring and alerts
7. Share the URL with your team!

## App Branding

You can customize the app name and favicon by setting environment variables in `.env.production`:

```bash
# App Branding (optional)
VITE_APP_NAME="Your App Name"
VITE_APP_FAVICON="/favicon.ico"
```

These are **build-time** variables (prefixed with `VITE_`), so they're baked into the build and don't need to be set as Cloudflare secrets. Just set them in `.env.production` before running `pnpm run deploy`.

See [APP_BRANDING.md](./APP_BRANDING.md) for more details.

## Additional Resources

- [OAuth Setup Guide](./OAUTH_SETUP.md) - Detailed Google OAuth configuration
- [Gemini Integration](./GEMINI_INTEGRATION.md) - AI integration details
- [App Branding](./APP_BRANDING.md) - Customize app name and favicon
- [Migration Guide](./MIGRATION_GUIDE.md) - Upgrading from previous versions
