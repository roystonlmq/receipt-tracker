# Requirements Document: Screenshot Deep Linking

## Introduction

This feature enables users to share, bookmark, and directly access specific screenshots through unique URLs. Currently, the application only supports folder-level navigation, which creates friction when users want to return to a specific screenshot after page reload or share it with others.

## Glossary

- **Deep Link**: A URL that points directly to a specific screenshot, not just a folder
- **Screenshot ID**: Unique identifier for a screenshot in the database
- **URL State**: The current application state encoded in the URL parameters
- **Viewer State**: Whether the screenshot viewer modal is open or closed
- **Search Context**: The current search query or folder being viewed

## Requirements

### Requirement 1: Direct Screenshot Access

**User Story:** As a user, I want to access a specific screenshot directly via URL, so that I can bookmark or share it with others.

#### Acceptance Criteria

1. WHEN a user opens a screenshot in the viewer, THE System SHALL update the URL to include the screenshot ID
2. WHEN a user opens a URL with a screenshot ID parameter, THE System SHALL automatically open that screenshot in the viewer
3. WHEN the screenshot ID in the URL is invalid or not found, THE System SHALL display an error message and show the folder view
4. WHEN a user does not have permission to view the screenshot, THE System SHALL display an access denied message
5. WHEN the URL includes both folder and screenshot parameters, THE System SHALL open the screenshot within that folder context

### Requirement 2: URL State Synchronization

**User Story:** As a user, I want the URL to reflect my current view, so that refreshing the page returns me to the same state.

#### Acceptance Criteria

1. WHEN a user navigates to the next screenshot, THE System SHALL update the URL with the new screenshot ID
2. WHEN a user navigates to the previous screenshot, THE System SHALL update the URL with the new screenshot ID
3. WHEN a user closes the screenshot viewer, THE System SHALL remove the screenshot ID from the URL
4. WHEN a user performs a search and opens a screenshot, THE System SHALL preserve the search query in the URL
5. WHEN a user reloads the page with a screenshot URL, THE System SHALL restore the exact same view

### Requirement 3: Browser Navigation Integration

**User Story:** As a user, I want browser back/forward buttons to work correctly, so that I can navigate through my viewing history.

#### Acceptance Criteria

1. WHEN a user clicks the browser back button from a screenshot view, THE System SHALL close the viewer and return to the previous view
2. WHEN a user clicks the browser forward button, THE System SHALL reopen the screenshot if it was previously open
3. WHEN a user opens multiple screenshots in sequence, THE System SHALL maintain the navigation history
4. WHEN a user uses keyboard shortcuts to navigate screenshots, THE System SHALL update the browser history
5. WHEN a user closes the viewer, THE System SHALL add a history entry so back button works correctly

### Requirement 4: Search Context Preservation

**User Story:** As a user, I want my search context preserved when viewing screenshots, so that I can easily return to my search results.

#### Acceptance Criteria

1. WHEN a user searches for a tag and opens a screenshot, THE System SHALL preserve the search query in the URL
2. WHEN a user navigates between screenshots in search results, THE System SHALL maintain the search context
3. WHEN a user closes a screenshot from search results, THE System SHALL return to the search results view
4. WHEN a user reloads a page with both search and screenshot parameters, THE System SHALL show the screenshot within search results
5. WHEN a user clears the search while viewing a screenshot, THE System SHALL close the viewer and show all folders

### Requirement 5: Folder Context Preservation

**User Story:** As a user, I want to know which folder a screenshot belongs to, so that I have context about when it was taken.

#### Acceptance Criteria

1. WHEN a user opens a screenshot from a folder, THE System SHALL include the folder date in the URL
2. WHEN a user navigates between screenshots in a folder, THE System SHALL maintain the folder context
3. WHEN a user closes a screenshot from a folder view, THE System SHALL return to that folder view
4. WHEN a user reloads a page with folder and screenshot parameters, THE System SHALL show the screenshot within that folder
5. WHEN a user opens a screenshot from search results, THE System SHALL still display the folder date for context

### Requirement 6: URL Format and Structure

**User Story:** As a developer, I want a clean and predictable URL structure, so that the application is maintainable and URLs are shareable.

#### Acceptance Criteria

1. THE System SHALL use the format `/screenshots?screenshot=ID` for direct screenshot access
2. THE System SHALL use the format `/screenshots?folder=DATE&screenshot=ID` for folder context
3. THE System SHALL use the format `/screenshots?query=SEARCH&screenshot=ID` for search context
4. THE System SHALL encode special characters in search queries properly (e.g., `#` as `%23`)
5. THE System SHALL maintain backward compatibility with existing folder-only URLs

### Requirement 7: Error Handling and Edge Cases

**User Story:** As a user, I want clear feedback when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN a screenshot ID does not exist, THE System SHALL display "Screenshot not found" and show the folder/search view
2. WHEN a user lacks permission to view a screenshot, THE System SHALL display "Access denied" and return to folders
3. WHEN the URL contains malformed parameters, THE System SHALL ignore invalid parameters and show the default view
4. WHEN a screenshot is deleted while being viewed, THE System SHALL close the viewer and refresh the list
5. WHEN network errors occur while loading a screenshot, THE System SHALL display a retry option

### Requirement 8: Performance and User Experience

**User Story:** As a user, I want fast and smooth navigation, so that viewing screenshots feels responsive.

#### Acceptance Criteria

1. WHEN opening a screenshot from a URL, THE System SHALL load and display it within 500ms (excluding network time)
2. WHEN navigating between screenshots, THE System SHALL update the URL without causing page flicker
3. WHEN the URL changes, THE System SHALL not reload the entire page or lose scroll position
4. WHEN opening a deep link, THE System SHALL show a loading indicator while fetching the screenshot
5. WHEN the viewer is open, THE System SHALL preload adjacent screenshots for faster navigation

## Non-Functional Requirements

### Security
- Screenshot IDs in URLs must be validated against user permissions
- URL parameters must be sanitized to prevent injection attacks
- Access control must be enforced server-side, not just client-side

### Compatibility
- URLs must work across all modern browsers
- URLs must be copyable and shareable via any medium (email, chat, etc.)
- URLs must remain valid even if the user logs out and back in

### Maintainability
- URL structure should be documented and versioned
- Changes to URL format should maintain backward compatibility
- URL parsing logic should be centralized and testable

## Success Criteria

1. Users can share direct links to screenshots
2. Page refresh returns users to the exact screenshot they were viewing
3. Browser back/forward buttons work intuitively
4. Search context is preserved when viewing screenshots
5. No regression in existing folder navigation functionality
