# Implementation Tasks: Screenshot Viewer Enhancements

## Completed Features ✅

The following major features have been successfully implemented:

- ✅ Database schema with `downloaded` column and indexes
- ✅ Server functions for delete, toggle download status, and rename
- ✅ Tag cleanup on screenshot deletion
- ✅ Core keyboard event handling (ESC, DEL, E, F2, Ctrl+D, Ctrl+S, Arrow keys)
- ✅ Background scroll lock when viewer is open
- ✅ Notes preview scrolling
- ✅ ConfirmDialog with keyboard shortcuts (Enter/ESC) and focus trap
- ✅ Delete functionality with confirmation dialog
- ✅ Markdown rendering with hashtag highlighting
- ✅ Tab key support in editor (indent/unindent, multi-line)
- ✅ HighlightedTextarea component with real-time hashtag highlighting
- ✅ EnhancedNotesInput with tab support integrated
- ✅ Refine with AI feature
- ✅ Download status indicator with checkmark toggle
- ✅ ViewerHeader component with F2 rename functionality
- ✅ Toast notifications positioned at bottom-left with z-index above viewer
- ✅ KeyboardHint component for consistent keyboard shortcut display
- ✅ Arrow navigation with clickable hints

## Remaining Tasks

### Task 1: Add Checkmark to ScreenshotCard

- [ ] 1.1 Add checkmark indicator to ScreenshotCard
  - Display checkmark icon when `screenshot.downloaded === true`
  - Position to left of thumbnail or in corner
  - Make clickable to toggle download status
  - Add hover state
  - _Requirements: 11.3_

- [ ] 1.2 Implement toggle handler in ScreenshotCard
  - Call `toggleDownloadStatus` server function on click
  - Update UI optimistically
  - Show toast on success/error
  - _Requirements: 11.3, 11.5_

### Task 2: Property-Based Tests

All property-based tests need to be written using fast-check library with 100+ iterations each.

- [ ] 2.1 Write property tests for ESC key behavior
  - **Property 1: ESC key closes viewer consistently**
  - **Property 2: Unsaved changes trigger confirmation**
  - **Property 3: Focus returns after closing**
  - _Requirements: 1.1-1.5_

- [ ] 2.2 Write property tests for scroll behavior
  - **Property 4: Background scroll is disabled when viewer is open**
  - **Property 5: Notes preview scrolls when content overflows**
  - **Property 6: Background scroll is restored when viewer closes**
  - **Property 7: Short notes don't show scrollbar**
  - _Requirements: 2.1-2.5_

- [ ] 2.3 Write property tests for delete functionality
  - **Property 8: Delete triggers confirmation**
  - **Property 9: Confirmed deletion removes screenshot**
  - **Property 10: Canceled deletion preserves state**
  - _Requirements: 3.2-3.5_

- [ ] 2.4 Write property tests for dialog keyboard shortcuts
  - **Property 11: Dialog keyboard shortcuts work**
  - **Property 12: Keyboard and mouse actions are equivalent**
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 2.5 Write property tests for AI refinement
  - **Property 13: Refine button appears with notes**
  - **Property 14: Refine with AI sends notes to service**
  - **Property 15: AI refinement uses consistent format**
  - **Property 16: AI response updates editor**
  - **Property 17: AI errors preserve original notes**
  - _Requirements: 5.1-5.5_

- [ ] 2.6 Write property tests for markdown rendering
  - **Property 18: Markdown bold renders correctly**
  - **Property 19: Markdown lists render correctly**
  - **Property 20: Nested lists render with indentation**
  - **Property 21: Hashtags work within markdown**
  - **Property 22: Rendering errors show raw text**
  - _Requirements: 6.1-6.5_

- [ ] 2.7 Write property tests for tab key support
  - **Property 23: Tab inserts indentation**
  - **Property 24: Tab doesn't change focus**
  - **Property 25: Shift+Tab removes indentation**
  - **Property 26: Tab indents selected lines**
  - **Property 27: Shift+Tab unindents selected lines**
  - _Requirements: 7.1-7.5_

- [ ] 2.8 Write property tests for hashtag highlighting
  - **Property 28: Hashtags are highlighted in editor**
  - **Property 29: All hashtags are highlighted**
  - **Property 30: Editor and preview use same hashtag style**
  - **Property 31: Hashtag highlighting updates in real-time**
  - **Property 32: Highlighting persists after blur**
  - _Requirements: 8.1-8.5_

- [ ] 2.9 Write property tests for tag cleanup
  - **Property 33: Orphaned tags are removed**
  - **Property 34: Tags list shows only active tags**
  - _Requirements: 9.1, 9.2_

- [ ] 2.10 Write property tests for home navigation
  - **Property 35: Home navigation clears search**
  - **Property 36: Home shows folder view**
  - **Property 37: Home refreshes folder list**
  - _Requirements: 10.3-10.5_

- [ ] 2.11 Write property tests for download status
  - **Property 38: Download marks screenshot**
  - **Property 39: Downloaded screenshots show checkmark**
  - **Property 40: Checkmark toggles download status**
  - _Requirements: 11.1, 11.2, 11.5_

- [ ] 2.12 Write property tests for UI simplification
  - **Property 41: Download button shows tooltip**
  - **Property 42: Download works via click and keyboard**
  - **Property 43: ESC button closes viewer**
  - **Property 44: ESC key and button are equivalent**
  - **Property 45: Keyboard hints are visually consistent**
  - _Requirements: 12.1-12.5, 13.1-13.5_

- [ ] 2.13 Write property tests for edit mode
  - **Property 46: E key enters edit mode**
  - **Property 47: Edit button enters edit mode**
  - **Property 48: Edit button hides in edit mode**
  - _Requirements: 14.3-14.5_

- [ ] 2.14 Write property tests for arrow navigation
  - **Property 49: Arrow hints are clickable**
  - **Property 50: Arrow keys navigate screenshots**
  - **Property 51: Arrow hints appear clickable**
  - _Requirements: 15.2, 15.3, 15.5_

- [ ] 2.15 Write property tests for rename functionality
  - **Property 52: F2 enables name editing**
  - **Property 53: Enter saves renamed screenshot**
  - **Property 54: ESC cancels rename**
  - _Requirements: 16.2, 16.4, 16.5_

- [ ] 2.16 Write property tests for toast positioning
  - **Property 55: Toasts appear at bottom-left**
  - **Property 56: Toasts have higher z-index than viewer**
  - **Property 57: Multiple toasts stack vertically**
  - **Property 58: Toasts persist after viewer closes**
  - _Requirements: 17.1-17.4_

### Task 3: Integration Tests

- [ ] 3.1 Write integration test for complete delete flow
  - Test open viewer → press DEL → confirm → verify deleted
  - Test with keyboard and mouse
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3.2 Write integration test for rename flow
  - Test open viewer → press F2 → edit name → press Enter → verify saved
  - Test cancel with ESC
  - _Requirements: 16.1, 16.2, 16.4, 16.5_

- [ ] 3.3 Write integration test for download status flow
  - Test download → verify checkmark → toggle → verify status
  - _Requirements: 11.1, 11.2, 11.5_

- [ ] 3.4 Write integration test for AI refinement flow
  - Test add notes → click Refine with AI → verify refined notes
  - Test error handling
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3.5 Write integration test for markdown rendering
  - Test notes with bold, lists, hashtags → verify correct rendering
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

### Task 4: Manual Testing & Polish

- [ ] 4.1 Manual testing checklist
  - Test all keyboard shortcuts work as expected
  - Test scroll behavior (background locked, notes scrollable)
  - Test markdown rendering with various formats
  - Test tab key indentation
  - Test hashtag highlighting in editor
  - Test download status tracking
  - Test delete with confirmation
  - Test rename with F2
  - Test toast positioning
  - Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)
  - _Requirements: All_

- [ ] 4.2 Performance optimization
  - Profile keyboard event handling
  - Verify markdown parsing memoization
  - Verify hashtag highlighting debouncing
  - Check AI features lazy loading
  - _Requirements: Performance Considerations_

- [ ] 4.3 Accessibility audit
  - Verify all keyboard shortcuts work
  - Test with screen reader
  - Check focus indicators
  - Verify ARIA labels
  - Test keyboard navigation flow
  - _Requirements: Accessibility_

### Task 5: Final Checkpoint

- [ ] 5.1 Run all tests and verify passing
  - Run unit tests: `pnpm test`
  - Run property-based tests
  - Run integration tests
  - Fix any failing tests
  - Ensure all tests pass
  - Ask the user if questions arise
  - _Requirements: All_

## Notes

- Most core functionality is already implemented and working
- Primary remaining work is comprehensive testing (property-based and integration tests)
- One small UI feature remains: adding checkmark to ScreenshotCard
- Property-based tests should use fast-check library with 100+ iterations
- Each property test should be tagged with the format: `// Feature: screenshot-viewer-enhancements, Property X: [description]`
- Manual testing and accessibility audit are important final steps before completion
