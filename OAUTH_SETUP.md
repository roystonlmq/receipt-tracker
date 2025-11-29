# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth authentication for the Receipts Tracker application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- The application running locally or deployed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Receipts Tracker")
5. Click "Create"
6. Wait for the project to be created and select it

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on "Google+ API"
4. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Receipts Tracker
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `openid`
   - `email`
   - `profile`
8. Click "Update" and then "Save and Continue"
9. On the "Test users" page (for external apps), add your email as a test user
10. Click "Save and Continue"
11. Review and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "Receipts Tracker Web Client")
5. Under "Authorized JavaScript origins", add:
   - For local development: `http://localhost:3000`
   - For production: Your production URL (e.g., `https://receipts.example.com`)
6. Under "Authorized redirect URIs", add:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: Your production callback URL (e.g., `https://receipts.example.com/auth/callback`)
7. Click "Create"
8. A dialog will appear with your Client ID and Client Secret
9. **Important**: Copy both values - you'll need them for the next step

## Step 5: Configure Environment Variables

1. Create or update your `.env.local` file in the project root
2. Add the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/auth/callback"

# For production, use your production URL:
# GOOGLE_REDIRECT_URI="https://receipts.example.com/auth/callback"
```

3. Replace the placeholder values with your actual credentials from Step 4

## Step 6: Run Database Migrations

The OAuth system requires additional database tables. Run the migrations:

```bash
# Generate migration files (if not already generated)
pnpm db:generate

# Apply migrations to your database
pnpm db:push
```

This will create:
- `sessions` table - for storing user sessions
- `temp_sessions` table - for OAuth state management
- Updates to `users` table - adding `google_id`, `picture`, and `updated_at` columns

## Step 7: Test the Authentication

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000`
3. You should be redirected to the login page
4. Click "Sign in with Google"
5. You'll be redirected to Google's consent screen
6. Grant the requested permissions
7. You should be redirected back to the application and logged in

## Development Mode (Optional)

For development without setting up OAuth, you can use development mode:

```env
# .env.local
DEV_MODE="true"
DEV_USER_ID="1"
```

This will bypass authentication and use the specified user ID. **Never use this in production!**

## Production Deployment

### Important Security Considerations

1. **HTTPS Required**: Google OAuth requires HTTPS in production. Ensure your production environment uses SSL/TLS.

2. **Update Redirect URIs**: Make sure to add your production callback URL to the authorized redirect URIs in Google Cloud Console.

3. **Environment Variables**: Set the production environment variables in your hosting platform:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   GOOGLE_REDIRECT_URI="https://your-domain.com/auth/callback"
   ```

4. **Session Security**: Sessions are stored in PostgreSQL with 30-day expiration. Ensure your database is properly secured.

5. **Remove Dev Mode**: Ensure `DEV_MODE` is not set or is set to `"false"` in production.

### Cloudflare Workers Deployment

If deploying to Cloudflare Workers:

1. Add environment variables in the Cloudflare dashboard or `wrangler.toml`
2. Ensure your database is accessible from Cloudflare Workers
3. Update the redirect URI to your Workers domain

## Troubleshooting

### "redirect_uri_mismatch" Error

This means the redirect URI in your request doesn't match what's configured in Google Cloud Console.

**Solution**: 
- Check that `GOOGLE_REDIRECT_URI` in `.env.local` exactly matches one of the authorized redirect URIs in Google Cloud Console
- Include the protocol (`http://` or `https://`)
- Don't include trailing slashes

### "access_denied" Error

The user cancelled the sign-in or denied permissions.

**Solution**: Try signing in again and grant the requested permissions.

### "invalid_client" Error

Your client ID or client secret is incorrect.

**Solution**: 
- Verify the credentials in `.env.local` match those in Google Cloud Console
- Ensure there are no extra spaces or quotes
- Regenerate credentials if necessary

### Session Not Persisting

Sessions should last 30 days. If they're expiring immediately:

**Solution**:
- Check that the `sessions` table was created properly
- Verify the database connection is working
- Check browser console for errors

### "Authentication not configured" Message

The OAuth environment variables are missing or invalid.

**Solution**:
- Verify all three environment variables are set in `.env.local`
- Restart the development server after changing environment variables
- Check the server logs for specific configuration errors

## Migration from Old User System

If you have existing users in the database:

1. **Backup your database** before running migrations
2. Run the migrations to add the new columns
3. Existing users can sign in with Google using the same email address
4. The system will automatically link their Google account to their existing user record
5. Screenshot associations will be preserved

## Rollback Procedure

If you need to rollback the OAuth changes:

1. Backup your current database
2. Remove the OAuth-related tables:
   ```sql
   DROP TABLE IF EXISTS temp_sessions;
   DROP TABLE IF EXISTS sessions;
   ```
3. Remove the new columns from users table:
   ```sql
   ALTER TABLE users DROP COLUMN IF EXISTS google_id;
   ALTER TABLE users DROP COLUMN IF EXISTS picture;
   ALTER TABLE users DROP COLUMN IF EXISTS updated_at;
   ```
4. Restore the old user management system

## Support

For additional help:
- Check the [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2)
- Review the application logs for detailed error messages
- Ensure your Google Cloud project has the necessary APIs enabled

## Security Best Practices

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`
2. **Rotate secrets regularly**: Regenerate client secrets periodically
3. **Monitor OAuth usage**: Check Google Cloud Console for unusual activity
4. **Use HTTPS in production**: Never use OAuth over HTTP in production
5. **Limit OAuth scopes**: Only request the permissions you need
6. **Implement session cleanup**: The application automatically cleans up expired sessions
7. **Review test users**: Remove test users once you're ready for production
