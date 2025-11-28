# Requirements Document: Screenshot Viewer UX Improvements

## Introduction

This feature improves the Screenshot Viewer user experience by repositioning keyboard shortcut hints contextually near their associated actions and implementing cross-platform keyboard shortcut detection. Currently, keyboard shortcut hints are positioned at the bottom left of the viewer, which can be obscured by full-screen images. Additionally, shortcuts are hardcoded to show "Ctrl" regardless of the operating system, creating confusion for Mac users who expect to see "Cmd" (⌘).

## Glossary

- **Screenshot Viewer**: The full-screen modal component that displays a screenshot with navigation, download, and notes editing capabilities
- **Keyboard Shortcut Hint**: Visual indicator showing which keyboard keys perform specific actions (e.g., "ESC Close", "Ctrl+D Download")
- **Contextual Positioning**: Placing UI elements near the actions they control for better discoverability
- **Cross-Platform Detection**: Identifying the user's operating system to display appropriate keyboard modifiers (Cmd vs Ctrl)
- **Modifier Key**: Special keyboard keys like Ctrl, Cmd (⌘), Alt, and Shift used in keyboard shortcuts
- **Navigation Controls**: Previous/Next buttons for moving between screenshots in a collection

## Requirements

### Requirement 1: Contextual Keyboard Shortcut Positioning

**User Story:** As a user, I want to see keyboard shortcuts near the actions they control, so that I can discover and use them even when viewing full-screen images.

#### Acceptance Criteria

1. WHEN a user opens the Screenshot Viewer, THE System SHALL display keyboard shortcut hints near their associated UI elements
2. WHEN displaying the close action, THE System SHALL show the ESC shortcut hint near the close button in the header
3. WHEN displaying the download action, THE System SHALL show the download shortcut hint near the download button
4. WHEN navigation controls are available, THE System SHALL show arrow key hints on or near the Previous/Next buttons
5. WHEN a full-screen image is displayed, THE System SHALL ensure all keyboard shortcut hints remain visible and not obscured by the image

### Requirement 2: Close Button Keyboard Hint

**User Story:** As a user, I want to see the ESC shortcut near the close button, so that I know I can quickly exit the viewer.

#### Acceptance Criteria

1. WHEN the Screenshot Viewer header is displayed, THE System SHALL show "ESC" hint near the close (X) button
2. WHEN displaying the ESC hint, THE System SHALL use subtle styling that doesn't distract from the main content
3. WHEN a user hovers over the close button, THE System SHALL maintain visibility of the ESC hint
4. WHEN the ESC hint is displayed, THE System SHALL use a consistent visual style with other keyboard hints
5. WHEN the viewport is narrow, THE System SHALL ensure the ESC hint doesn't cause layout overflow

### Requirement 3: Download Button Keyboard Hint

**User Story:** As a user, I want to see the download shortcut near the download button, so that I can quickly save files without clicking.

#### Acceptance Criteria

1. WHEN the download button is displayed, THE System SHALL show the download keyboard shortcut hint adjacent to or within the button
2. WHEN displaying the download hint, THE System SHALL use the correct modifier key for the user's operating system (Cmd or Ctrl)
3. WHEN a user hovers over the download button, THE System SHALL maintain visibility of the keyboard hint
4. WHEN the download action is in progress, THE System SHALL keep the keyboard hint visible but indicate the action is disabled
5. WHEN the download button is focused via keyboard navigation, THE System SHALL ensure the hint is clearly visible

### Requirement 4: Navigation Button Keyboard Hints

**User Story:** As a user, I want to see arrow key hints on the navigation buttons, so that I know I can navigate between screenshots using my keyboard.

#### Acceptance Criteria

1. WHEN the Previous button is displayed, THE System SHALL show a left arrow (←) keyboard hint on or near the button
2. WHEN the Next button is displayed, THE System SHALL show a right arrow (→) keyboard hint on or near the button
3. WHEN navigation buttons are not available (first/last screenshot), THE System SHALL hide the corresponding keyboard hints
4. WHEN a user hovers over a navigation button, THE System SHALL maintain visibility of the arrow key hint
5. WHEN navigation buttons are positioned over the image, THE System SHALL ensure keyboard hints remain readable with appropriate contrast

### Requirement 5: Cross-Platform Keyboard Shortcut Detection

**User Story:** As a user on macOS, I want to see "Cmd" (⌘) in keyboard shortcuts instead of "Ctrl", so that the hints match my keyboard layout.

#### Acceptance Criteria

1. WHEN the System initializes, THE System SHALL detect the user's operating system
2. WHEN the operating system is macOS, THE System SHALL display "Cmd" or "⌘" for command key shortcuts
3. WHEN the operating system is Windows or Linux, THE System SHALL display "Ctrl" for control key shortcuts
4. WHEN displaying keyboard shortcuts, THE System SHALL use the detected modifier key consistently across all hints
5. WHEN the operating system cannot be detected, THE System SHALL default to displaying "Ctrl"

### Requirement 6: Operating System Detection Implementation

**User Story:** As a system, I need to reliably detect the user's operating system, so that I can display appropriate keyboard shortcuts.

#### Acceptance Criteria

1. WHEN detecting the operating system, THE System SHALL use the browser's navigator.platform or navigator.userAgentData API
2. WHEN navigator.platform contains "Mac", THE System SHALL identify the OS as macOS
3. WHEN navigator.platform contains "Win", THE System SHALL identify the OS as Windows
4. WHEN navigator.platform contains "Linux", THE System SHALL identify the OS as Linux
5. WHEN the detection runs, THE System SHALL cache the result to avoid repeated detection calls

### Requirement 7: Keyboard Shortcut Display Utility

**User Story:** As a developer, I want a reusable utility for displaying keyboard shortcuts, so that all components show consistent and platform-appropriate shortcuts.

#### Acceptance Criteria

1. WHEN a component needs to display a keyboard shortcut, THE System SHALL provide a utility function that returns the appropriate modifier key
2. WHEN the utility function is called, THE System SHALL return "Cmd" or "⌘" on macOS and "Ctrl" on other platforms
3. WHEN rendering keyboard shortcuts, THE System SHALL provide a component that automatically formats shortcuts with the correct modifier
4. WHEN the keyboard shortcut component receives a shortcut definition, THE System SHALL render it with appropriate styling (e.g., kbd element)
5. WHEN multiple modifier keys are needed (e.g., Cmd+Shift+K), THE System SHALL format them consistently with platform conventions

### Requirement 8: Save Notes Keyboard Hint

**User Story:** As a user, I want to see the save shortcut in the notes panel, so that I know I can quickly save without clicking the button.

#### Acceptance Criteria

1. WHEN the notes panel is displayed, THE System SHALL show the save keyboard shortcut hint below the notes input
2. WHEN displaying the save hint, THE System SHALL use the correct modifier key for the user's operating system
3. WHEN notes have not been modified, THE System SHALL still display the save hint but indicate it's currently inactive
4. WHEN a user presses the save keyboard shortcut, THE System SHALL provide visual feedback that the action was triggered
5. WHEN the save action is in progress, THE System SHALL update the hint to indicate saving is happening

### Requirement 9: Keyboard Hint Visual Consistency

**User Story:** As a user, I want all keyboard hints to have consistent styling, so that I can easily recognize them throughout the interface.

#### Acceptance Criteria

1. WHEN displaying any keyboard hint, THE System SHALL use a consistent visual style (background, border, padding, font)
2. WHEN keyboard hints are displayed on different backgrounds, THE System SHALL ensure sufficient contrast for readability
3. WHEN multiple keys are part of a shortcut (e.g., Cmd+D), THE System SHALL visually separate them with a plus sign or similar indicator
4. WHEN a keyboard hint is displayed, THE System SHALL use a monospace or system font appropriate for keyboard keys
5. WHEN keyboard hints are rendered, THE System SHALL use semantic HTML (kbd element) for accessibility

### Requirement 10: Accessibility and Screen Readers

**User Story:** As a user with a screen reader, I want keyboard shortcuts to be announced properly, so that I can use them effectively.

#### Acceptance Criteria

1. WHEN a keyboard hint is rendered, THE System SHALL use semantic HTML that screen readers can interpret
2. WHEN a screen reader encounters a keyboard shortcut, THE System SHALL announce it in a natural way (e.g., "Command D" not "C-m-d D")
3. WHEN keyboard shortcuts are displayed visually, THE System SHALL also include them in ARIA labels for interactive elements
4. WHEN a user navigates with keyboard only, THE System SHALL ensure all keyboard hints are discoverable
5. WHEN focus moves to an element with a keyboard shortcut, THE System SHALL announce the shortcut as part of the element's description

### Requirement 11: Responsive Layout for Keyboard Hints

**User Story:** As a user on a small screen, I want keyboard hints to adapt to the available space, so that they don't clutter the interface or cause layout issues.

#### Acceptance Criteria

1. WHEN the viewport width is below 768px, THE System SHALL use abbreviated keyboard hints (e.g., show only the key, not the action label)
2. WHEN keyboard hints would overlap with other UI elements, THE System SHALL adjust their position or hide less critical hints
3. WHEN the Screenshot Viewer is displayed on mobile devices, THE System SHALL hide keyboard hints that are not applicable (since mobile devices typically lack physical keyboards)
4. WHEN the viewport is resized, THE System SHALL dynamically adjust keyboard hint visibility and positioning
5. WHEN touch input is detected, THE System SHALL deprioritize keyboard hints in favor of touch-friendly UI elements

### Requirement 12: Keyboard Hint Removal from Bottom Overlay

**User Story:** As a user, I want the bottom-left keyboard hint overlay removed, so that it doesn't get hidden behind full-screen images.

#### Acceptance Criteria

1. WHEN the Screenshot Viewer is displayed, THE System SHALL not render a centralized keyboard hints overlay at the bottom left
2. WHEN removing the bottom overlay, THE System SHALL ensure all keyboard shortcuts are still discoverable through contextual hints
3. WHEN the bottom overlay is removed, THE System SHALL not leave any visual artifacts or empty space
4. WHEN users who were accustomed to the bottom overlay open the viewer, THE System SHALL provide clear visual cues for the new hint locations
5. WHEN the migration is complete, THE System SHALL remove all code related to the bottom-left overlay

### Requirement 13: Performance and Rendering

**User Story:** As a user, I want keyboard hints to appear instantly without causing layout shifts, so that the viewer feels responsive.

#### Acceptance Criteria

1. WHEN the Screenshot Viewer opens, THE System SHALL render all keyboard hints without causing visible layout shifts
2. WHEN detecting the operating system, THE System SHALL complete detection before the first render to avoid hint text changes
3. WHEN keyboard hints are displayed, THE System SHALL not trigger additional network requests or expensive computations
4. WHEN the viewer is opened repeatedly, THE System SHALL reuse cached OS detection results
5. WHEN rendering keyboard hints, THE System SHALL use CSS that doesn't cause reflows or repaints of the main image

