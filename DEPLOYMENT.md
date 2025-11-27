# Deployment Guide

## Deploying to Cloudflare Workers

This app is configured to deploy to Cloudflare Workers using Wrangler.

### Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com/sign-up
2. **Wrangler CLI** - Already configured in this project
3. **PostgreSQL Database** - You'll need a hosted PostgreSQL database

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

### Step 2: Configure Environment Variables

1. Create a `.env.production` file (or use Cloudflare dashboard):
```bash
DATABASE_URL="your-production-database-url"
```

2. Add to Cloudflare Workers:
```bash
# Login to Cloudflare
npx wrangler login

# Add secret
npx wrangler secret put DATABASE_URL
# Paste your database URL when prompted
```

### Step 3: Update Database Schema

Run migrations on your production database:

```bash
# Set production database URL temporarily
$env:DATABASE_URL="your-production-database-url"

# Push schema to production
pnpm db:push

# Or generate and run migrations
pnpm db:generate
pnpm db:migrate
```

### Step 4: Deploy to Cloudflare

```bash
# Build and deploy
pnpm deploy
```

This will:
1. Build your application
2. Upload to Cloudflare Workers
3. Provide you with a URL like: `https://receipts-tracker.your-subdomain.workers.dev`

### Step 5: Seed Production Data (Optional)

If you want demo data in production:

```bash
# Set production database URL
$env:DATABASE_URL="your-production-database-url"

# Run seed script
npx tsx scripts/seed.ts
```

### Configuration Files

The deployment is configured in:
- `wrangler.jsonc` - Cloudflare Workers configuration
- `vite.config.ts` - Build configuration with Cloudflare adapter

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

3. Deploy again: `pnpm deploy`

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
- Verify SSL mode if required

### Build Errors
- Run `pnpm build` locally first to catch errors
- Check that all dependencies are in `package.json`
- Ensure TypeScript has no errors: `pnpm tsc --noEmit`

### Runtime Errors
- Check Cloudflare Workers logs: `npx wrangler tail`
- Verify environment variables are set
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
pnpm deploy
```

Cloudflare Workers will automatically handle zero-downtime deployments.

## Cost

**Cloudflare Workers Free Tier**:
- 100,000 requests/day
- 10ms CPU time per request
- Perfect for personal use or small teams

**Database Costs**:
- Neon: Free tier with 0.5GB storage
- Supabase: Free tier with 500MB storage
- Railway: $5/month after trial

## Security Notes

1. **Never commit** `.env.local` or `.env.production` to git
2. **Use secrets** for sensitive data (DATABASE_URL)
3. **Enable CORS** if needed for your domain
4. **Set up authentication** for production use (currently using hardcoded user IDs)

## Next Steps

After deployment:
1. Test all features on production URL
2. Set up custom domain (optional)
3. Configure backups for your database
4. Set up monitoring and alerts
5. Share the URL with your team!
