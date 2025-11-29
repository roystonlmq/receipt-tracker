# Implementation Tasks: Screenshot Deep Linking

## Overview

Implement deep linking for screenshots to enable direct access via URL, preserve state across page reloads, and support browser navigation.

## Tasks

### Task 1: Update Route Configuration

- [ ] 1.1 Add screenshot parameter to route validation
  - Update `src/routes/screenshots.tsx` validateSearch function
  - Parse screenshot parameter as number
  - Handle invalid values gracefully
  - _Requirements: 6.1, 6.5_

- [ ] 1.2 Pass screenshot ID to FileExplorer
  - Add `initialScreenshotId` prop to FileExplorer component
  - Pass `searchParams.screenshot` from route
  - _Requirements: 1.2_

### Task 2: Create Server Function for Screenshot Fetching

- [ ] 2.1 Implement getScreenshotById server function
  - Create function in `src/server/screenshots.ts`
  - Validate user ownership
  - Return screenshot or error
  - Handle not found and access denied cases
  - _Requirements: 1.3, 1.4, 7.1, 7.2_

- [ ] 2.2 Write unit tests for getScreenshotById
  - Test successful fetch
  - Test not found scenario
  - Test access denied scenario
  - Test invalid ID handling
  - _Requirements: 7.1, 7.2, 7.3_

### Task 3: Update FileExplorer Component

- [ ] 3.1 Add initialScreenshotId prop and state
  - Update FileExplorerProps interface
  - Add autoOpenScreenshotId state
  - Initialize from prop
  - _Requirements: 1.1, 1.2_

- [ ] 3.2 Implement auto-open effect
  - Create useEffect to watch autoOpenScreenshotId
  - Check if screenshot exists in current list
  - If not, fetch using getScreenshotById
  - Open viewer when screenshot is ready
  - Clear autoOpenScreenshotId after opening
  - _Requirements: 1.2, 7.4_

- [ ] 3.3 Handle screenshot not found
  - Display error toast
  - Remove invalid screenshot parameter from URL
  - Show folder/search view
  - _Requirements: 7.1_

- [ ] 3.4 Handle access denied
  - Display access denied message
  - Redirect to screenshots home
  - _Requirements: 7.2_

### Task 4: Update ScreenshotViewer Component

- [ ] 4.1 Add URL update on viewer open
  - Create useEffect to update URL when screenshot changes
  - Add screenshot ID to URL parameters
  - Use navigate with replace: false for history
  - _Requirements: 1.1, 2.5_

- [ ] 4.2 Update handleClose to remove screenshot parameter
  - Remove screenshot from URL parameters
  - Use navigate with replace: false
  - Call onClose callback
  - _Requirements: 2.3, 3.1_

- [ ] 4.3 Update navigation to update URL
  - Modify handleNavigate for prev/next
  - Update URL with new screenshot ID
  - Use navigate with replace: true to avoid history clutter
  - _Requirements: 2.1, 2.2, 3.3_

- [ ] 4.4 Handle keyboard navigation URL updates
  - Ensure arrow key navigation updates URL
  - Maintain consistency with button navigation
  - _Requirements: 3.4_

### Task 5: Preserve Search and Folder Context

- [ ] 5.1 Maintain search query in URL
  - When opening screenshot from search, keep query parameter
  - When navigating, preserve query parameter
  - When closing, keep query parameter
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5.2 Maintain folder context in URL
  - When opening screenshot from folder, keep folder parameter
  - When navigating, preserve folder parameter
  - When closing, keep folder parameter
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5.3 Display context information in viewer
  - Show folder date in viewer header
  - Show search query indicator if applicable
  - _Requirements: 5.5_

### Task 6: Browser Navigation Integration

- [ ] 6.1 Test browser back button behavior
  - Verify back button closes viewer
  - Verify back button returns to previous view
  - Verify history stack is correct
  - _Requirements: 3.1, 3.3_

- [ ] 6.2 Test browser forward button behavior
  - Verify forward button reopens viewer
  - Verify forward button restores state
  - _Requirements: 3.2_

- [ ] 6.3 Handle popstate events
  - Listen for browser navigation events
  - Sync component state with URL
  - Open/close viewer based on URL
  - _Requirements: 3.1, 3.2, 3.3_

### Task 7: Error Handling and Edge Cases

- [ ] 7.1 Handle malformed screenshot IDs
  - Validate ID is positive integer
  - Ignore invalid values
  - Show default view
  - _Requirements: 7.3_

- [ ] 7.2 Handle network errors
  - Show error message with retry option
  - Maintain user's context
  - Log errors for debugging
  - _Requirements: 7.5_

- [ ] 7.3 Handle screenshot deletion while viewing
  - Detect when screenshot is deleted
  - Close viewer gracefully
  - Refresh screenshot list
  - _Requirements: 7.4_

### Task 8: Performance Optimization

- [ ] 8.1 Implement screenshot caching
  - Cache recently viewed screenshots
  - Avoid refetching same screenshot
  - Clear cache on logout
  - _Requirements: 8.1, 8.3_

- [ ] 8.2 Add loading indicators
  - Show spinner while fetching screenshot
  - Show skeleton loader in viewer
  - Provide feedback during navigation
  - _Requirements: 8.1, 8.4_

- [ ] 8.3 Preload adjacent screenshots
  - Preload next/prev screenshots in background
  - Improve navigation responsiveness
  - _Requirements: 8.5_

### Task 9: Testing

- [ ] 9.1 Write integration tests
  - Test opening screenshot from URL
  - Test navigation updates URL
  - Test closing removes parameter
  - Test search context preservation
  - Test folder context preservation
  - _Requirements: All_

- [ ] 9.2 Write unit tests for URL utilities
  - Test parameter parsing
  - Test parameter building
  - Test edge cases
  - _Requirements: 6.1-6.5_

- [ ] 9.3 Manual testing checklist
  - Copy/paste URL in new tab
  - Browser back/forward buttons
  - Page reload with screenshot URL
  - Invalid screenshot ID
  - Access denied scenario
  - Network error handling
  - _Requirements: All_

### Task 10: Documentation

- [ ] 10.1 Update README with deep linking feature
  - Explain URL structure
  - Provide examples
  - Document sharing workflow
  - _Requirements: User documentation_

- [ ] 10.2 Add inline code documentation
  - Document URL parameter format
  - Explain state synchronization
  - Add JSDoc comments
  - _Requirements: Technical documentation_

## Dependencies

- Task 2 must be completed before Task 3.2
- Task 1 must be completed before Task 3
- Task 3 must be completed before Task 4
- Task 4 must be completed before Task 5
- Task 6 depends on Tasks 3-5
- Task 9 should be done incrementally with each task

## Testing Strategy

1. Write unit tests for each server function
2. Write integration tests for URL synchronization
3. Manual testing for browser navigation
4. Test on multiple browsers
5. Test with various URL formats

## Success Criteria

- [ ] Users can share direct links to screenshots
- [ ] Page refresh returns to exact screenshot
- [ ] Browser back/forward buttons work correctly
- [ ] Search context is preserved
- [ ] Folder context is preserved
- [ ] No regression in existing functionality
- [ ] All tests passing
