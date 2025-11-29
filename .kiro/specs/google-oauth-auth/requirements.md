# Requirements Document: Google OAuth Authentication

## Introduction

This feature replaces the current manual user profile system with secure Google OAuth authentication. Users will sign in with their Google account, and the system will automatically create and manage user profiles. Sessions will persist across page reloads, eliminating the issue of defaulting to a hardcoded user ID. This ensures that only authenticated users can access the application and their data remains private.

## Glossary

- **OAuth 2.0**: Industry-standard protocol for authorization
- **Google OAuth**: Google's implementation of OAuth 2.0 for authentication
- **Session**: Server-side storage of user authentication state
- **Access Token**: Short-lived token proving user authentication
- **Refresh Token**: Long-lived token used to obtain new access tokens
- **Protected Route**: Application route that requires authentication
- **Session Cookie**: HTTP-only cookie storing session identifier
- **PKCE**: Proof Key for Code Exchange, security extension for OAuth

## Requirements

### Requirement 1: Google OAuth Integration

**User Story:** As a user, I want to sign in with my Google account, so that I can securely access my screenshots without managing passwords.

#### Acceptance Criteria

1. WHEN a user visits the application without authentication, THE System SHALL redirect them to a login page
2. WHEN a user clicks "Sign in with Google", THE System SHALL redirect to Google's OAuth consent screen
3. WHEN a user grants permission on Google's consent screen, THE System SHALL receive an authorization code
4. WHEN the System receives an authorization code, THE System SHALL exchange it for access and refresh tokens
5. WHEN the System obtains user information from Google, THE System SHALL create or update the user profile in the database
6. WHEN authentication succeeds, THE System SHALL create a session and redirect the user to the main application

### Requirement 2: Session Management

**User Story:** As a user, I want my login to persist across page reloads, so that I don't have to sign in repeatedly.

#### Acceptance Criteria

1. WHEN a user successfully authenticates, THE System SHALL create a server-side session with a unique identifier
2. WHEN creating a session, THE System SHALL store the session ID in an HTTP-only cookie
3. WHEN a user makes a request, THE System SHALL validate the session cookie and retrieve user information
4. WHEN a session is created, THE System SHALL set an expiration time of 30 days
5. WHEN a session expires, THE System SHALL require the user to re-authenticate
6. WHEN a user signs out, THE System SHALL delete the session and clear the cookie

### Requirement 3: User Profile Auto-Creation

**User Story:** As a system, I need to automatically create user profiles from Google accounts, so that users can start using the application immediately after authentication.

#### Acceptance Criteria

1. WHEN a user authenticates for the first time, THE System SHALL create a new user record with Google email and name
2. WHEN a user with an existing profile authenticates, THE System SHALL update their name if it changed in Google
3. WHEN creating a user profile, THE System SHALL store the Google user ID for future identification
4. WHEN a user profile is created, THE System SHALL use the Google email as the unique identifier
5. WHEN storing user information, THE System SHALL not store Google access tokens in the database

### Requirement 4: Protected Routes

**User Story:** As a system administrator, I want all application routes to require authentication, so that unauthorized users cannot access user data.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access a protected route, THE System SHALL redirect them to the login page
2. WHEN checking authentication, THE System SHALL validate the session on every request
3. WHEN a session is invalid or expired, THE System SHALL clear the cookie and redirect to login
4. WHEN a user is authenticated, THE System SHALL allow access to all application routes
5. WHEN displaying user-specific data, THE System SHALL filter by the authenticated user's ID

### Requirement 5: Sign Out Functionality

**User Story:** As a user, I want to sign out of the application, so that others cannot access my data on shared devices.

#### Acceptance Criteria

1. WHEN a user clicks the sign out button, THE System SHALL delete the server-side session
2. WHEN signing out, THE System SHALL clear the session cookie
3. WHEN sign out completes, THE System SHALL redirect the user to the login page
4. WHEN a user signs out, THE System SHALL not revoke Google OAuth tokens (user remains signed in to Google)
5. WHEN displaying the header, THE System SHALL show a sign out button for authenticated users

### Requirement 6: Error Handling

**User Story:** As a user, I want clear error messages when authentication fails, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN Google OAuth returns an error, THE System SHALL display a user-friendly error message
2. WHEN the user denies permission on Google's consent screen, THE System SHALL show "Authentication cancelled" message
3. WHEN network errors occur during authentication, THE System SHALL display "Connection error. Please try again."
4. WHEN the session expires during use, THE System SHALL redirect to login with a "Session expired" message
5. WHEN authentication fails, THE System SHALL provide a "Try Again" button to restart the flow

### Requirement 7: Security Requirements

**User Story:** As a system administrator, I want the authentication system to follow security best practices, so that user data remains protected.

#### Acceptance Criteria

1. WHEN storing session cookies, THE System SHALL set the HttpOnly flag to prevent JavaScript access
2. WHEN storing session cookies, THE System SHALL set the Secure flag to require HTTPS
3. WHEN storing session cookies, THE System SHALL set the SameSite attribute to Lax or Strict
4. WHEN implementing OAuth flow, THE System SHALL use PKCE for additional security
5. WHEN storing sessions, THE System SHALL use cryptographically secure random session IDs
6. WHEN validating sessions, THE System SHALL check both session existence and expiration time

### Requirement 8: Environment Configuration

**User Story:** As a developer, I want to configure OAuth credentials via environment variables, so that I can use different credentials for development and production.

#### Acceptance Criteria

1. WHEN the System initializes, THE System SHALL read Google OAuth client ID from environment variables
2. WHEN the System initializes, THE System SHALL read Google OAuth client secret from environment variables
3. WHEN the System initializes, THE System SHALL read the OAuth redirect URI from environment variables
4. WHEN OAuth credentials are missing, THE System SHALL log an error and disable authentication
5. WHEN displaying the login page, THE System SHALL show an error if OAuth is not configured

### Requirement 9: Migration from Current System

**User Story:** As a system administrator, I want to migrate existing user profiles to the new authentication system, so that current users can continue using their data.

#### Acceptance Criteria

1. WHEN migrating, THE System SHALL preserve existing user IDs and screenshot associations
2. WHEN a user with an existing email authenticates, THE System SHALL link their Google account to the existing profile
3. WHEN migrating, THE System SHALL add a google_id column to the users table
4. WHEN an existing user signs in for the first time, THE System SHALL update their record with the Google ID
5. WHEN migration is complete, THE System SHALL remove the manual user creation functionality

### Requirement 10: User Experience

**User Story:** As a user, I want a smooth authentication experience, so that signing in feels seamless and professional.

#### Acceptance Criteria

1. WHEN loading the login page, THE System SHALL display a clean, branded interface
2. WHEN clicking "Sign in with Google", THE System SHALL show a loading indicator
3. WHEN authentication is in progress, THE System SHALL prevent duplicate sign-in attempts
4. WHEN authentication succeeds, THE System SHALL show a brief success message before redirecting
5. WHEN displaying the header, THE System SHALL show the user's name and profile picture from Google

### Requirement 11: Development Mode

**User Story:** As a developer, I want to bypass authentication in development mode, so that I can test the application without setting up OAuth credentials.

#### Acceptance Criteria

1. WHEN the System runs in development mode with DEV_MODE=true, THE System SHALL allow bypassing authentication
2. WHEN in development mode, THE System SHALL provide a way to select a test user
3. WHEN in development mode, THE System SHALL display a warning banner indicating authentication is disabled
4. WHEN in production mode, THE System SHALL always require authentication
5. WHEN DEV_MODE is enabled, THE System SHALL log a warning on startup

### Requirement 12: Session Storage

**User Story:** As a system, I need to store sessions efficiently, so that the application can scale to many concurrent users.

#### Acceptance Criteria

1. WHEN storing sessions, THE System SHALL use a dedicated sessions table in PostgreSQL
2. WHEN creating a session, THE System SHALL store the session ID, user ID, and expiration time
3. WHEN validating a session, THE System SHALL query by session ID with an index for performance
4. WHEN sessions expire, THE System SHALL provide a cleanup mechanism to remove old sessions
5. WHEN a user has multiple sessions, THE System SHALL allow all valid sessions to coexist
