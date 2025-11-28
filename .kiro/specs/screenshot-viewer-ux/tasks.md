# Implementation Plan: Screenshot Viewer UX Improvements

- [x] 1. Create platform detection utility
  - Create `src/utils/platform.ts` with OS detection logic
  - Implement `detectPlatform()` function using navigator.platform API
  - Implement caching mechanism for platform detection result
  - Implement `getPlatform()` function to retrieve cached platform info
  - Implement `formatShortcut()` helper function for formatting keyboard shortcuts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 1.1 Write unit tests for platform detection
  - Test platform detection with mocked navigator values
  - Test caching behavior
  - Test formatShortcut with different platforms
  - Test fallback to 'unknown' platform
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 1.2 Write property test for platform detection consistency
  - **Property 1: Platform detection consistency**
  - **Validates: Requirements 5.5, 6.5**

- [ ]* 1.3 Write property test for modifier key correctness
  - **Property 2: Modifier key correctness**
  - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ]* 1.4 Write property test for platform detection caching
  - **Property 8: Platform detection caching**
  - **Validates: Requirements 6.5, 13.4**

- [x] 2. Create KeyboardHint component
  - Create `src/components/KeyboardHint.tsx` component
  - Implement props interface (keys, label, variant, className)
  - Implement three variants: default, compact, inline
  - Use platform detection to display correct modifier keys
  - Use semantic `<kbd>` HTML element
  - Implement consistent styling with Tailwind classes
  - Add ARIA attributes for accessibility
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4_

- [ ]* 2.1 Write unit tests for KeyboardHint component
  - Test rendering with single key
  - Test rendering with multiple keys
  - Test different variants
  - Test platform-aware modifier display
  - Test semantic HTML usage
  - Test accessibility attributes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4_

- [ ]* 2.2 Write property test for keyboard hint styling consistency
  - **Property 5: Keyboard hint styling consistency**
  - **Validates: Requirements 9.1, 9.4**

- [ ]* 2.3 Write property test for semantic HTML usage
  - **Property 6: Semantic HTML usage**
  - **Validates: Requirements 9.5, 10.1**

- [x] 3. Update ScreenshotViewer - Remove bottom overlay
  - Remove the bottom-left keyboard shortcuts overlay div
  - Clean up related CSS classes
  - Verify no visual artifacts remain
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 4. Update ScreenshotViewer - Add ESC hint to close button
  - Import KeyboardHint component
  - Add ESC hint near the close button in header
  - Use compact variant for minimal visual footprint
  - Position hint to not interfere with button click area
  - Ensure hint is visible on all viewport sizes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Update ScreenshotViewer - Add download hint to download button
  - Add keyboard hint to download button
  - Use platform-aware modifier key (Cmd/Ctrl + D)
  - Position hint within or adjacent to button
  - Maintain hint visibility during download state
  - Ensure hint doesn't cause button layout issues
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Update ScreenshotViewer - Add navigation hints to Previous/Next buttons
  - Add left arrow (←) hint to Previous button
  - Add right arrow (→) hint to Next button
  - Use compact variant for clean appearance
  - Conditionally render hints based on navigation availability
  - Ensure hints are readable over image background
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Update ScreenshotViewer - Update save hint in notes panel
  - Update the save keyboard hint below notes input
  - Use platform-aware modifier key (Cmd/Ctrl + S)
  - Use inline variant for natural text flow
  - Maintain hint visibility in all save states
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 7.1 Write property test for keyboard hint visibility
  - **Property 3: Keyboard hint visibility**
  - **Validates: Requirements 1.5, 2.5, 3.5, 4.5**

- [ ]* 7.2 Write property test for contextual positioning
  - **Property 4: Contextual positioning**
  - **Validates: Requirements 1.1, 2.1, 3.1, 4.1**

- [ ]* 7.3 Write property test for conditional hint display
  - **Property 7: Conditional hint display**
  - **Validates: Requirements 4.3**

- [x] 8. Implement responsive behavior for keyboard hints
  - Add media queries to hide/abbreviate hints on narrow viewports (<768px)
  - Test hint visibility on mobile devices
  - Ensure touch-friendly UI remains unaffected
  - Handle viewport resize events gracefully
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 8.1 Write integration tests for ScreenshotViewer
  - Test that bottom overlay is not rendered
  - Test ESC hint appears near close button
  - Test download hint appears near download button
  - Test navigation hints appear on navigation buttons
  - Test save hint appears in notes panel
  - Test hints use correct modifier key based on platform
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1, 12.1_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Test cross-browser compatibility
  - Test platform detection in Chrome, Firefox, Safari, Edge
  - Verify keyboard hints render correctly across browsers
  - Test fallback behavior when platform APIs unavailable
  - Document any browser-specific issues
  - _Requirements: 5.1, 5.5, 6.1, 6.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 11. Verify accessibility compliance
  - Test with screen readers (NVDA, JAWS, VoiceOver)
  - Verify keyboard navigation works correctly
  - Check ARIA labels are properly announced
  - Verify contrast ratios meet WCAG AA standards
  - Test with browser zoom (100%, 150%, 200%)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

