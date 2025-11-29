# Implementation Tasks: Google OAuth Authentication

## Task 1: Database Schema Updates

- [x] 1.1 Update users table schema
  - Add `google_id` column (text, unique, nullable)
  - Add `picture` column (text, nullable) for profile picture URL
  - Add `updated_at` column (timestamp, default now)
  - Add index on `google_id`
  - _Requirements: 3.3, 3.4_

- [x] 1.2 Create sessions table
  - Add `id` column (text, primary key) for session ID
  - Add `user_id` column (integer, foreign key to users)
  - Add `expires_at` column (timestamp, not null)
  - Add `created_at` column (timestamp, default now)
  - Add indexes on `user_id` and `expires_at`
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 1.3 Create temp_sessions table
  - Add `id` column (text, primary key) for state parameter
  - Add `code_verifier` column (text, not null) for PKCE
  - Add `expires_at` column (timestamp, not null)
  - Add `created_at` column (timestamp, default now)
  - Add index on `expires_at`
  - _Requirements: 1.3_

- [x] 1.4 Generate and apply migrations
  - Run `pnpm db:generate` to create migration files
  - Review generated SQL
  - Run `pnpm db:push` to apply migrations
  - _Requirements: 9.3_

## Task 2: OAuth Utility Functions

- [x] 2.1 Create PKCE utilities
  - Create `src/utils/pkce.ts`
  - Implement `generateCodeVerifier()` function
  - Implement `generateCodeChallenge()` function
  - Use crypto.randomBytes for secure random generation
  - Use SHA-256 for challenge generation
  - _Requirements: 7.4, 7.5_

- [x] 2.2 Create OAuth URL builder
  - Create `src/utils/oauth.ts`
  - Implement `buildGoogleAuthUrl()` function
  - Include all required OAuth parameters
  - Add PKCE code_challenge and code_challenge_method
  - Add state parameter for CSRF protection
  - _Requirements: 1.2_

- [x] 2.3 Implement token exchange
  - Add `exchangeCodeForTokens()` function in `src/utils/oauth.ts`
  - Make POST request to Google token endpoint
  - Include PKCE code_verifier
  - Handle errors and network failures
  - Return access token and user info
  - _Requirements: 1.4_

- [x] 2.4 Implement user info fetching
  - Add `getGoogleUserInfo()` function in `src/utils/oauth.ts`
  - Make GET request to Google userinfo endpoint
  - Include access token in Authorization header
  - Parse and return user data (sub, email, name, picture)
  - _Requirements: 1.5_

- [ ]* 2.5 Write unit tests for OAuth utilities
  - Test PKCE code generation and validation
  - Test OAuth URL building with various parameters
  - Test token exchange with mock responses
  - Test user info fetching with mock responses
  - _Requirements: Testing_

## Task 3: Session Management

- [x] 3.1 Create session utilities
  - Create `src/utils/session.ts`
  - Implement `generateSessionId()` using crypto.randomBytes
  - Implement `setSessionCookie()` with security flags
  - Implement `getSessionIdFromCookie()` for parsing
  - Implement `clearSessionCookie()` for sign out
  - _Requirements: 2.1, 2.2, 7.1, 7.2, 7.3_

- [x] 3.2 Implement session database operations
  - Create `src/server/sessions.ts`
  - Implement `createSession()` server function
  - Implement `getSession()` server function
  - Implement `deleteSession()` server function
  - Implement `cleanupExpiredSessions()` function
  - _Requirements: 12.2, 12.3, 12.4_

- [x] 3.3 Implement temporary session operations
  - Add `storeTempSession()` function in `src/server/sessions.ts`
  - Add `getTempSession()` function
  - Add `deleteTempSession()` function
  - Set expiration to 10 minutes for temp sessions
  - _Requirements: 1.3_

- [ ]* 3.4 Write unit tests for session utilities
  - Test session ID generation uniqueness
  - Test cookie serialization with security flags
  - Test cookie parsing from request headers
  - Test session expiration logic
  - _Requirements: Testing_

## Task 4: OAuth Server Functions

- [x] 4.1 Create initiateGoogleAuth server function
  - Create `src/server/auth.ts`
  - Implement `initiateGoogleAuth` server function
  - Generate PKCE code verifier and challenge
  - Store code verifier in temporary session
  - Build and return Google OAuth URL
  - _Requirements: 1.2, 1.3_

- [x] 4.2 Create handleGoogleCallback server function
  - Implement `handleGoogleCallback` in `src/server/auth.ts`
  - Validate state parameter against temp session
  - Retrieve code verifier from temp session
  - Exchange authorization code for tokens
  - Get user info from Google
  - Create or update user in database
  - Create session and set cookie
  - Clean up temporary session
  - _Requirements: 1.3, 1.4, 1.5, 1.6_

- [x] 4.3 Create getCurrentUser server function
  - Implement `getCurrentUser` in `src/server/auth.ts`
  - Get session ID from cookie
  - Validate session exists and not expired
  - Return user information if authenticated
  - Return unauthenticated status if no valid session
  - _Requirements: 2.3, 4.2_

- [x] 4.4 Create signOut server function
  - Implement `signOut` in `src/server/auth.ts`
  - Get session ID from cookie
  - Delete session from database
  - Clear session cookie
  - Return success response
  - _Requirements: 5.1, 5.2_

- [x] 4.5 Implement user upsert logic
  - Add `upsertUser()` function in `src/server/auth.ts`
  - Check if user exists by google_id
  - If exists, update name and picture
  - If not exists, check by email for migration
  - If found by email, add google_id to existing user
  - If not found, create new user
  - _Requirements: 3.1, 3.2, 9.2, 9.4_

- [ ]* 4.6 Write integration tests for OAuth flow
  - Test complete OAuth flow with mock Google responses
  - Test callback with invalid state parameter
  - Test callback with OAuth error
  - Test user creation on first login
  - Test user update on subsequent login
  - _Requirements: Testing_

## Task 5: Login Page

- [x] 5.1 Create login route
  - Create `src/routes/login.tsx`
  - Display app branding and description
  - Show "Sign in with Google" button
  - Handle loading state during OAuth initiation
  - Display error messages if authentication fails
  - _Requirements: 1.1, 10.1, 10.2_

- [x] 5.2 Implement sign-in button handler
  - Call `initiateGoogleAuth` server function
  - Show loading spinner while generating OAuth URL
  - Redirect to Google OAuth URL
  - Prevent duplicate clicks during loading
  - _Requirements: 1.2, 10.3_

- [x] 5.3 Create OAuth callback route
  - Create `src/routes/auth/callback.tsx`
  - Parse code, state, and error from URL parameters
  - Call `handleGoogleCallback` server function
  - Show loading state during token exchange
  - Display error message if callback fails
  - Redirect to main app on success
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 10.4_

- [x] 5.4 Style login page
  - Match existing app design (dark theme)
  - Use Google brand guidelines for sign-in button
  - Add subtle animations for loading states
  - Ensure responsive design for mobile
  - _Requirements: 10.1_

## Task 6: Authentication Guard

- [x] 6.1 Create AuthGuard component
  - Create `src/components/AuthGuard.tsx`
  - Call `getCurrentUser` on mount
  - Show loading spinner while checking authentication
  - Redirect to login if not authenticated
  - Render children if authenticated
  - _Requirements: 4.1, 4.2_

- [x] 6.2 Create useAuth hook
  - Create `src/hooks/useAuth.ts`
  - Provide authenticated user data
  - Provide loading state
  - Provide error state
  - Provide signOut function
  - _Requirements: 2.3, 5.1_

- [ ] 6.3 Wrap protected routes with AuthGuard
  - Update `src/routes/__root.tsx` or individual route files
  - Wrap all routes except /login and /auth/callback
  - Ensure authentication check happens before rendering
  - Currently only /screenshots is wrapped - need to protect all routes
  - _Requirements: 4.1, 4.4_

## Task 7: User Menu Integration

- [x] 7.1 Integrate user display in Header
  - Header component already displays user info and profile picture
  - Shows user name and email in sidebar
  - Includes dev mode warning banner
  - _Requirements: 5.5, 10.5_

- [x] 7.2 Implement sign out handler
  - Sign out handler implemented in Header component
  - Calls `signOut` server function
  - Clears localStorage session
  - Redirects to login page after sign out
  - _Requirements: 5.1, 5.2, 5.3_

## Task 8: Error Handling

- [ ] 8.1 Create error message mapping
  - Create `src/utils/authErrors.ts`
  - Map OAuth error codes to user-friendly messages
  - Map session errors to appropriate messages
  - Include "Try Again" guidance in messages
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8.2 Implement error display component
  - Create `src/components/AuthError.tsx`
  - Display error message with icon
  - Show "Try Again" button
  - Allow dismissing error
  - _Requirements: 6.5_

- [ ] 8.3 Add session expiration handling
  - Detect expired sessions in AuthGuard
  - Show "Session expired" message
  - Redirect to login with message parameter
  - Display message on login page
  - _Requirements: 6.4_

## Task 9: Environment Configuration

- [ ] 9.1 Add environment variables
  - Add GOOGLE_CLIENT_ID to .env.local
  - Add GOOGLE_CLIENT_SECRET to .env.local
  - Add GOOGLE_REDIRECT_URI to .env.local
  - Document in .env.example or README
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9.2 Create configuration validation
  - Create `src/utils/config.ts`
  - Validate required environment variables on startup
  - Log clear error messages if config missing
  - Provide setup instructions in error messages
  - _Requirements: 8.4, 8.5_

- [x] 9.3 Add development mode support
  - DEV_MODE and DEV_USER_ID environment variables supported
  - Authentication bypassed when DEV_MODE=true
  - Warning banner shown in dev mode (Header and Login page)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

## Task 10: Session Cleanup

- [ ] 10.1 Create session cleanup job
  - Create `src/server/jobs/cleanupSessions.ts`
  - Query and delete expired sessions
  - Query and delete expired temp sessions
  - Log cleanup statistics
  - Note: `cleanupExpiredSessions()` function exists in sessions.ts but needs job wrapper
  - _Requirements: 12.4_

- [ ] 10.2 Schedule cleanup job
  - Run cleanup on server startup
  - Schedule periodic cleanup (e.g., every hour)
  - Use setTimeout or cron-like scheduler
  - _Requirements: 12.4_

## Task 11: Migration and Deployment

- [ ] 11.1 Create migration documentation
  - Document database migration steps
  - Document Google OAuth setup process
  - Document environment variable configuration
  - Include rollback procedures
  - _Requirements: 9.1_

- [ ] 11.2 Test migration with existing data
  - Test linking Google accounts to existing users by email
  - Verify screenshot associations preserved
  - Test with multiple existing users
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 11.3 Remove old user management UI
  - Remove UserProfileSelector component (after migration)
  - Remove manual user creation server functions
  - Clean up any references to old user system
  - _Requirements: 9.5_

## Task 12: Property-Based Tests

- [ ]* 12.1 Write property test for session uniqueness
  - **Property 1: Session uniqueness**
  - Test that session IDs are unique across random generations
  - Run 100+ iterations
  - _Requirements: 12.2_

- [ ]* 12.2 Write property test for session expiration
  - **Property 2: Session expiration enforcement**
  - Test that expired sessions are always considered invalid
  - Run 100+ iterations with random timestamps
  - _Requirements: 2.5_

- [ ]* 12.3 Write property test for cookie security
  - **Property 3: Cookie security flags**
  - Test that all session cookies have required security flags
  - Run 100+ iterations
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]* 12.4 Write property test for user-session association
  - **Property 4: User-session association**
  - Test that every valid session has exactly one associated user
  - Run 100+ iterations
  - _Requirements: 2.3_

- [ ]* 12.5 Write property test for Google ID uniqueness
  - **Property 5: Google ID uniqueness**
  - Test that Google IDs are unique across all users
  - Run 100+ iterations
  - _Requirements: 3.3_

## Task 13: Documentation

- [ ]* 13.1 Create setup guide
  - Document Google Cloud Console setup
  - Document OAuth consent screen configuration
  - Document redirect URI configuration
  - Include screenshots and step-by-step instructions
  - _Requirements: User documentation_

- [ ]* 13.2 Create deployment guide
  - Document production environment setup
  - Document SSL/HTTPS requirements
  - Document session security considerations
  - Include troubleshooting section
  - _Requirements: Technical documentation_

- [ ]* 13.3 Update README
  - Add authentication section
  - Document environment variables
  - Add development mode instructions
  - Include migration guide for existing users
  - _Requirements: User documentation_

## Implementation Status Summary

### ✅ Completed
- Database schema with sessions and temp_sessions tables
- All OAuth utility functions (PKCE, OAuth URL building, token exchange)
- Session management (creation, validation, deletion)
- Server functions for auth flow (initiate, callback, getCurrentUser, signOut)
- Login page with Google sign-in
- OAuth callback handler
- AuthGuard component and useAuth hook
- User display integrated in Header with sign out
- Development mode support

### 🚧 In Progress / Remaining
- Wrap all protected routes with AuthGuard (currently only /screenshots)
- Error handling utilities and components
- Environment configuration validation
- Session cleanup job scheduling
- Migration documentation and testing
- Remove old UserProfileSelector component

### 📝 Notes
- Current implementation uses localStorage for session management instead of HTTP-only cookies
- This is a temporary solution that works but is less secure than cookie-based sessions
- Consider migrating to proper cookie-based session management in production
- Most core functionality is complete and working
- Focus remaining work on: route protection, error handling, cleanup jobs, and documentation
