# Requirements Document: Screenshot Viewer UX Improvements

## Introduction

This feature improves the user experience of the Screenshot Viewer by implementing cursor-following tag suggestions, similar to modern code editors. Currently, tag suggestions appear at the bottom of the textarea, which can be inconvenient when typing in the middle or top of long notes. This enhancement will position suggestions directly below the cursor position, providing a more intuitive and seamless tagging experience.

## Glossary

- **Cursor Position**: The current location of the text input cursor within the textarea
- **Tag Suggestions Dropdown**: The autocomplete menu that appears when typing `#` to suggest previously used tags
- **Cursor-Following**: The behavior where UI elements (like suggestions) appear at the cursor's location rather than a fixed position
- **Textarea**: The multi-line text input field used for editing notes
- **Caret**: Another term for the text cursor position indicator

## Requirements

### Requirement 1: Cursor Position Detection

**User Story:** As a developer, I need to accurately detect the cursor position in the textarea, so that I can position the suggestions dropdown correctly.

#### Acceptance Criteria

1. WHEN a user types `#` in the textarea, THE System SHALL calculate the exact pixel coordinates of the cursor position
2. WHEN calculating cursor position, THE System SHALL account for text wrapping and line breaks
3. WHEN the textarea is scrolled, THE System SHALL adjust the cursor position relative to the viewport
4. WHEN calculating position, THE System SHALL use the cursor's bottom-left corner as the reference point
5. WHEN the cursor position cannot be determined, THE System SHALL fall back to positioning at the bottom of the textarea

### Requirement 2: Dynamic Dropdown Positioning

**User Story:** As a user, I want tag suggestions to appear right below where I'm typing, so that I don't have to look away from my current focus point.

#### Acceptance Criteria

1. WHEN tag suggestions are displayed, THE System SHALL position the dropdown 4-8 pixels below the cursor
2. WHEN the cursor is near the bottom of the viewport, THE System SHALL position the dropdown above the cursor instead
3. WHEN the cursor is near the right edge of the viewport, THE System SHALL adjust the dropdown to stay within viewport bounds
4. WHEN the user continues typing, THE System SHALL update the dropdown position to follow the cursor
5. WHEN the dropdown would be clipped by parent containers, THE System SHALL use fixed positioning relative to the viewport

### Requirement 3: Library Integration

**User Story:** As a developer, I want to use a reliable library for cursor position calculation, so that I don't have to implement complex text measurement logic.

#### Acceptance Criteria

1. WHEN implementing cursor tracking, THE System SHALL evaluate libraries such as `textarea-caret-position` or similar
2. WHEN a library is selected, THE System SHALL ensure it supports React and TypeScript
3. WHEN integrating the library, THE System SHALL handle edge cases like emoji, special characters, and RTL text
4. WHEN the library fails, THE System SHALL gracefully fall back to the current bottom-of-textarea positioning
5. WHEN updating dependencies, THE System SHALL document the library choice and rationale

### Requirement 4: Performance Optimization

**User Story:** As a user, I want tag suggestions to appear instantly without lag, so that my typing flow is not interrupted.

#### Acceptance Criteria

1. WHEN calculating cursor position, THE System SHALL complete the calculation within 16ms (one frame at 60fps)
2. WHEN the user types rapidly, THE System SHALL debounce position calculations to avoid excessive updates
3. WHEN rendering the dropdown, THE System SHALL use CSS transforms for positioning to enable GPU acceleration
4. WHEN the dropdown is not visible, THE System SHALL skip position calculations
5. WHEN multiple position updates occur, THE System SHALL batch them using requestAnimationFrame

### Requirement 5: Visual Consistency

**User Story:** As a user, I want the tag suggestions dropdown to match the app's design system, so that the interface feels cohesive.

#### Acceptance Criteria

1. WHEN displaying the dropdown, THE System SHALL use the app's dark theme colors (zinc-800 background, white/10 border)
2. WHEN positioning the dropdown, THE System SHALL include a subtle drop shadow for depth perception
3. WHEN the dropdown appears, THE System SHALL use a smooth fade-in animation (150-200ms)
4. WHEN the dropdown disappears, THE System SHALL use a smooth fade-out animation (100-150ms)
5. WHEN the dropdown is repositioned, THE System SHALL animate the position change smoothly

### Requirement 6: Accessibility

**User Story:** As a user relying on keyboard navigation, I want the tag suggestions to work seamlessly with keyboard controls, so that I can efficiently select tags without a mouse.

#### Acceptance Criteria

1. WHEN the dropdown appears, THE System SHALL maintain keyboard focus on the textarea
2. WHEN using arrow keys, THE System SHALL navigate through suggestions without moving the text cursor
3. WHEN pressing Tab or Enter, THE System SHALL insert the selected suggestion at the cursor position
4. WHEN pressing Escape, THE System SHALL close the dropdown and return focus to the textarea
5. WHEN a suggestion is selected, THE System SHALL announce it to screen readers

### Requirement 7: Edge Case Handling

**User Story:** As a user, I want tag suggestions to work correctly in all scenarios, so that I have a reliable experience regardless of how I use the feature.

#### Acceptance Criteria

1. WHEN the textarea contains very long lines, THE System SHALL correctly calculate cursor position with horizontal scrolling
2. WHEN the textarea contains mixed content (text, emoji, special characters), THE System SHALL accurately position the dropdown
3. WHEN the browser window is resized, THE System SHALL recalculate and update the dropdown position
4. WHEN the textarea is inside a scrollable container, THE System SHALL account for container scroll offset
5. WHEN multiple textareas exist on the page, THE System SHALL track cursor position independently for each

### Requirement 8: Fallback Behavior

**User Story:** As a user, I want tag suggestions to always work even if cursor-following fails, so that I can still use the feature.

#### Acceptance Criteria

1. WHEN cursor position calculation fails, THE System SHALL position the dropdown at the bottom-left of the textarea
2. WHEN the fallback position is used, THE System SHALL log a warning for debugging purposes
3. WHEN in fallback mode, THE System SHALL maintain all other dropdown functionality (keyboard navigation, selection)
4. WHEN the error is transient, THE System SHALL retry cursor position calculation on the next `#` character
5. WHEN in fallback mode, THE System SHALL not display error messages to the user

## Success Metrics

- Cursor position calculation accuracy: >95% within 5 pixels of actual cursor
- Position calculation performance: <16ms per calculation
- User satisfaction: Improved perceived responsiveness of tag suggestions
- Reduced eye movement: Users don't need to look away from typing location

## Technical Constraints

- Must work in Chrome, Firefox, Safari, and Edge (latest 2 versions)
- Must support textareas with variable font sizes and line heights
- Must handle textareas with CSS transforms or positioned ancestors
- Must work with React 19 and TypeScript strict mode
