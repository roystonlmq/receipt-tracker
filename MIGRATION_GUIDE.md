# Migration Guide: Google OAuth Authentication

This guide helps you migrate from the old manual user management system to the new Google OAuth authentication system.

## Overview

The new authentication system:
- Uses Google OAuth for secure sign-in
- Automatically creates user profiles from Google accounts
- Links existing users by email address
- Preserves all screenshot associations
- Provides better security with session management

## Pre-Migration Checklist

- [ ] **Backup your database** - Create a full backup before proceeding
- [ ] **Test in development** - Complete the migration in a dev environment first
- [ ] **Set up Google OAuth** - Follow [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- [ ] **Notify users** - Inform users about the upcoming authentication change
- [ ] **Document user emails** - Ensure all existing users have valid email addresses

## Migration Steps

### Step 1: Backup Database

```bash
# PostgreSQL backup
pg_dump -U your_user -d receipts_tracker > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using your database tool
```

### Step 2: Run Database Migrations

The migrations add new tables and columns without removing existing data:

```bash
# Generate migration files (if not already done)
pnpm db:generate

# Review the generated SQL in drizzle/ directory
# Ensure it only adds new tables/columns

# Apply migrations
pnpm db:push
```

This creates:
- `sessions` table - for user sessions
- `temp_sessions` table - for OAuth flow
- New columns in `users` table:
  - `google_id` (text, unique, nullable)
  - `picture` (text, nullable)
  - `updated_at` (timestamp)

### Step 3: Verify Database Schema

Check that the migrations were applied correctly:

```sql
-- Check users table has new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('sessions', 'temp_sessions');
```

### Step 4: Configure OAuth

Add OAuth credentials to your environment:

```bash
# .env.local
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/auth/callback"
```

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed setup instructions.

### Step 5: Deploy Application

Deploy the updated application with OAuth support:

```bash
# Build the application
pnpm build

# Deploy to your hosting platform
pnpm deploy
```

### Step 6: Test User Migration

1. **Test with existing user**:
   - Sign in with Google using an email that exists in your database
   - Verify the system links the Google account to the existing user
   - Check that all screenshots are still accessible

2. **Test with new user**:
   - Sign in with Google using a new email
   - Verify a new user account is created
   - Upload a test screenshot

3. **Verify data integrity**:
   ```sql
   -- Check that existing users still have their screenshots
   SELECT u.email, COUNT(s.id) as screenshot_count
   FROM users u
   LEFT JOIN screenshots s ON u.id = s.user_id
   GROUP BY u.id, u.email;
   ```

### Step 7: Remove Old User Management (Optional)

After confirming the migration is successful, you can remove the old user management UI:

1. Remove `UserProfileSelector` component
2. Remove manual user creation server functions
3. Update any references to the old user system

**Note**: Keep the database tables and data intact. Only remove the UI components.

## User Migration Flow

### For Existing Users

When an existing user signs in with Google:

1. User clicks "Sign in with Google"
2. User grants permissions on Google's consent screen
3. System receives user info (email, name, picture)
4. System checks if a user with that email exists
5. If found, system adds `google_id` to the existing user record
6. User is logged in with their existing account
7. All screenshots remain associated with their account

### For New Users

When a new user signs in:

1. User clicks "Sign in with Google"
2. User grants permissions
3. System receives user info
4. System creates a new user record with Google info
5. User can start uploading screenshots

## Rollback Procedure

If you need to rollback the migration:

### Step 1: Restore Database Backup

```bash
# Stop the application
# Restore from backup
psql -U your_user -d receipts_tracker < backup_YYYYMMDD_HHMMSS.sql
```

### Step 2: Revert Application Code

```bash
# Checkout the previous version
git checkout <previous-commit-hash>

# Rebuild and deploy
pnpm build
pnpm deploy
```

### Step 3: Remove OAuth Tables (Optional)

If you want to completely remove the OAuth changes:

```sql
-- Remove OAuth tables
DROP TABLE IF EXISTS temp_sessions;
DROP TABLE IF EXISTS sessions;

-- Remove new columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS google_id;
ALTER TABLE users DROP COLUMN IF EXISTS picture;
ALTER TABLE users DROP COLUMN IF EXISTS updated_at;
```

## Common Migration Issues

### Issue: Users can't sign in

**Symptoms**: Users get "Authentication failed" error

**Solutions**:
1. Verify OAuth credentials are correct
2. Check that redirect URI matches exactly
3. Ensure users are using the correct email address
4. Check server logs for detailed error messages

### Issue: Existing users create duplicate accounts

**Symptoms**: User signs in and sees no screenshots

**Cause**: Email address mismatch between Google and database

**Solution**:
1. Check the email in the database: `SELECT * FROM users WHERE email = 'user@example.com'`
2. Verify the email the user is signing in with
3. Update the database email if needed: `UPDATE users SET email = 'correct@email.com' WHERE id = X`
4. Have user sign out and sign in again

### Issue: Screenshots not showing after migration

**Symptoms**: User can sign in but sees no screenshots

**Solution**:
1. Verify user_id associations:
   ```sql
   SELECT u.id, u.email, u.google_id, COUNT(s.id) as screenshots
   FROM users u
   LEFT JOIN screenshots s ON u.id = s.user_id
   WHERE u.email = 'user@example.com'
   GROUP BY u.id;
   ```
2. Check if screenshots are associated with a different user_id
3. If needed, reassociate screenshots:
   ```sql
   UPDATE screenshots
   SET user_id = <correct_user_id>
   WHERE user_id = <old_user_id>;
   ```

### Issue: Session expires immediately

**Symptoms**: User is logged out right after signing in

**Solution**:
1. Check that sessions table was created properly
2. Verify database connection is working
3. Check browser console for errors
4. Ensure localStorage is not being cleared

## Testing Checklist

After migration, verify:

- [ ] Existing users can sign in with Google
- [ ] New users can create accounts
- [ ] All screenshots are accessible
- [ ] Screenshot upload works
- [ ] Screenshot download works
- [ ] Notes and tags are preserved
- [ ] Search functionality works
- [ ] User profile displays correctly
- [ ] Sign out works properly
- [ ] Session persists across page reloads
- [ ] Session expires after 30 days

## Production Deployment Considerations

### Before Deployment

1. **Test thoroughly in staging** - Complete the full migration in a staging environment
2. **Schedule maintenance window** - Plan for potential downtime
3. **Notify users** - Send email notifications about the change
4. **Prepare rollback plan** - Have database backups and rollback steps ready

### During Deployment

1. **Enable maintenance mode** (if available)
2. **Run database migrations**
3. **Deploy application**
4. **Verify OAuth configuration**
5. **Test with a few users**
6. **Disable maintenance mode**

### After Deployment

1. **Monitor error logs** - Watch for authentication errors
2. **Check user feedback** - Respond to user issues quickly
3. **Verify data integrity** - Ensure no data was lost
4. **Document any issues** - Keep track of problems and solutions

## Support

If you encounter issues during migration:

1. Check the application logs for detailed error messages
2. Review the [OAUTH_SETUP.md](./OAUTH_SETUP.md) guide
3. Verify your database migrations were applied correctly
4. Test in development mode first: `DEV_MODE="true"`
5. Consult the troubleshooting section in OAUTH_SETUP.md

## Security Notes

- Never commit OAuth credentials to version control
- Use HTTPS in production (required by Google OAuth)
- Rotate OAuth secrets regularly
- Monitor for unusual authentication activity
- Keep database backups secure
- Disable development mode in production

## Timeline Recommendation

For a smooth migration:

1. **Week 1**: Set up OAuth in development, test thoroughly
2. **Week 2**: Deploy to staging, test with real data
3. **Week 3**: Notify users, prepare documentation
4. **Week 4**: Deploy to production during low-traffic period
5. **Week 5**: Monitor and address any issues

## Success Criteria

Migration is successful when:

- ✅ All existing users can sign in with Google
- ✅ All screenshots are accessible
- ✅ No data loss occurred
- ✅ New users can create accounts
- ✅ Sessions work correctly
- ✅ No critical errors in logs
- ✅ User feedback is positive
