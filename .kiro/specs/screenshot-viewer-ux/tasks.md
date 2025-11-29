# Implementation Tasks: Cursor-Following Tag Suggestions

## Task 1: Install Dependencies and Setup
- [x] 1.1 Install textarea-caret package
  - Run `pnpm add textarea-caret`
  - Run `pnpm add -D @types/textarea-caret`
  - Verify installation in package.json
  - _Requirements: 3.1, 3.2_

- [x] 1.2 Create utility file for cursor position
  - Create `src/utils/cursorPosition.ts`
  - Export types: `CursorPosition`, `ViewportBounds`
  - Add JSDoc comments
  - _Requirements: Design - Components and Interfaces_

## Task 2: Implement useCursorPosition Hook
- [x] 2.1 Create basic hook structure
  - Create `src/hooks/useCursorPosition.ts`
  - Define hook interface and options type
  - Implement basic cursor position calculation using textarea-caret
  - Return null when disabled or on error
  - _Requirements: 1.1, 1.4_

- [x] 2.2 Add viewport boundary detection
  - Calculate viewport dimensions
  - Detect if cursor is near bottom edge (within 300px)
  - Detect if cursor is near right edge (within 300px)
  - Set placement to 'above' when near bottom
  - Adjust left position when near right edge
  - _Requirements: 2.2, 2.3_

- [x] 2.3 Implement coordinate transformation
  - Get textarea bounding rect
  - Convert textarea-relative coords to viewport-relative
  - Account for textarea scroll offset
  - Account for page scroll offset
  - _Requirements: 1.2, 1.3_

- [x] 2.4 Add error handling and fallback
  - Wrap calculation in try-catch
  - Log warning on error
  - Return null to trigger fallback
  - Track fallback state
  - _Requirements: 1.5, 8.1, 8.2_

- [ ]* 2.5 Write unit tests for useCursorPosition hook
  - Test basic position calculation
  - Test viewport boundary detection
  - Test coordinate transformation
  - Test error handling
  - Test fallback behavior
  - _Requirements: Testing Strategy_

## Task 3: Add Performance Optimizations
- [x] 3.1 Implement debouncing
  - Add 100ms debounce to position calculations
  - Clear debounce timer on unmount
  - Skip calculation if dropdown not visible
  - _Requirements: 4.2, 4.4_

- [ ] 3.2 Add memoization and RAF batching
  - Memoize cursor position calculation to avoid recalculation for same cursor index
  - Batch multiple position updates using requestAnimationFrame
  - Cancel pending RAF on unmount
  - _Requirements: 4.1, 4.5, Performance Considerations_

- [ ]* 3.3 Write property test for performance
  - **Property 5: Performance constraint**
  - Test that calculation completes within 16ms
  - Run 100+ iterations
  - _Requirements: 4.1_

## Task 4: Update EnhancedNotesInput Component
- [x] 4.1 Integrate useCursorPosition hook
  - Import and use useCursorPosition hook
  - Pass textareaRef and enabled flag
  - Store cursor position in state
  - Track fallback mode
  - _Requirements: 2.1, 2.4_

- [x] 4.2 Update dropdown positioning logic
  - Pass cursor position to dropdown component
  - Use fixed positioning when cursor position available
  - Fall back to bottom positioning when cursor position is null
  - _Requirements: 2.5, 8.1_

- [x] 4.3 Add position update on typing
  - Recalculate position when user types after `#`
  - Update position when cursor moves
  - Debounce updates during rapid typing
  - _Requirements: 2.4, 4.2_

- [ ]* 4.4 Write integration tests
  - Test complete flow: type '#' → see dropdown at cursor
  - Test fallback when calculation fails
  - Test position updates on typing
  - _Requirements: Testing Strategy_

## Task 5: Enhance TagSuggestionsDropdown Styling
- [x] 5.1 Update dropdown positioning
  - Change from absolute to fixed positioning
  - Use cursor position for top/left coordinates
  - Add placement class for above/below
  - Ensure z-index is high enough (z-[70])
  - _Requirements: 2.1, 2.2_

- [x] 5.2 Add smooth animations
  - Add CSS transition for position changes (150ms ease-out)
  - Add fade-in animation on appear (200ms)
  - Add fade-out animation on disappear (100ms)
  - Respect prefers-reduced-motion
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 5.3 Implement smart placement
  - Add CSS for placement-above (transform translateY(-100%))
  - Add CSS for placement-below (margin-top: 8px)
  - Ensure dropdown stays within viewport
  - _Requirements: 2.2, 2.3_

- [ ]* 5.4 Write property test for animations
  - **Property 6: Animation smoothness**
  - Test that transitions complete within 200ms
  - Run 100+ iterations
  - _Requirements: 5.3, 5.4, 5.5_

## Task 6: Implement Edge Case Handling
- [ ] 6.1 Handle window resize and scrollable containers
  - Add resize event listener to recalculate position
  - Debounce resize handler
  - Detect if textarea is in scrollable container
  - Account for container scroll offset
  - Clean up listener on unmount
  - _Requirements: 7.3, 7.4_

- [ ] 6.2 Test edge cases manually
  - Test with very long lines (>1000 chars) and horizontal scrolling
  - Test with emoji characters and Unicode
  - Test with RTL text
  - Verify position accuracy in all cases
  - _Requirements: 7.1, 7.2_

- [ ]* 6.3 Write property tests for edge cases
  - **Property 1: Cursor position accuracy**
  - Test with various text layouts
  - Test with scrolling
  - Test with special characters
  - Run 100+ iterations
  - _Requirements: 1.1, 1.2, 7.1, 7.2_

## Task 7: Implement Property-Based Tests
- [ ]* 7.1 Write property test for viewport boundaries
  - **Property 2: Viewport boundary respect**
  - Test that dropdown stays within viewport
  - Test with cursor near all edges
  - Run 100+ iterations
  - _Requirements: 2.2, 2.3_

- [ ]* 7.2 Write property test for position updates
  - **Property 3: Position update consistency**
  - Test that position follows cursor movements
  - Test with rapid cursor changes
  - Run 100+ iterations
  - _Requirements: 2.4, 4.1_

- [ ]* 7.3 Write property test for fallback
  - **Property 4: Fallback reliability**
  - Test that fallback never crashes
  - Test with simulated errors
  - Run 100+ iterations
  - _Requirements: 1.5, 8.1, 8.2_

## Task 8: Accessibility Improvements
- [x] 8.1 Ensure keyboard navigation works
  - Verify arrow keys navigate suggestions
  - Verify Tab/Enter insert suggestion
  - Verify Escape closes dropdown
  - Verify focus stays on textarea
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8.2 Add ARIA attributes
  - Add role="listbox" to dropdown
  - Add role="option" to suggestions
  - Add aria-live="polite" for announcements
  - Add aria-selected for current selection
  - _Requirements: 6.5, Accessibility_

- [ ]* 8.3 Write property tests for keyboard navigation
  - Test that arrow keys don't move cursor
  - Test that Tab/Enter insert at correct position
  - Test that Escape closes dropdown
  - Run 100+ iterations
  - _Requirements: 6.2, 6.3, 6.4_

## Task 9: Cross-Browser Testing and Polish
- [ ]* 9.1 Test in Chrome
  - Test cursor position accuracy
  - Test animations
  - Test edge cases
  - _Requirements: Browser Compatibility_

- [ ]* 9.2 Test in Firefox
  - Test cursor position accuracy
  - Test animations
  - Test edge cases
  - _Requirements: Browser Compatibility_

- [ ]* 9.3 Test in Safari
  - Test cursor position accuracy
  - Test animations
  - Test edge cases
  - _Requirements: Browser Compatibility_

- [ ]* 9.4 Test in Edge
  - Test cursor position accuracy
  - Test animations
  - Test edge cases
  - _Requirements: Browser Compatibility_

## Task 10: Documentation and Cleanup
- [ ]* 10.1 Update component documentation
  - Document useCursorPosition hook API
  - Add JSDoc comments to all functions
  - Document fallback behavior
  - _Requirements: Documentation_

- [ ]* 10.2 Remove debug logging
  - Remove console.log statements
  - Keep only error logging
  - _Requirements: Code Quality_

- [ ]* 10.3 Update README
  - Document cursor-following feature
  - Explain fallback behavior
  - Add troubleshooting section
  - _Requirements: Documentation_

## Task 11: Checkpoint - Verify All Tests Pass
- [ ] 11.1 Run all tests
  - Ensure all tests pass
  - Ask the user if questions arise
  - _Requirements: All_

## Notes

- Core cursor-following functionality has been implemented (Tasks 1-5 complete)
- Remaining work focuses on performance optimizations, edge cases, accessibility, and testing
- Property-based tests are marked optional (*) but recommended
- Cross-browser testing (task 9) should be done manually
- Documentation (task 10) is optional but helpful
- The checkpoint (task 11) ensures everything works before completion
