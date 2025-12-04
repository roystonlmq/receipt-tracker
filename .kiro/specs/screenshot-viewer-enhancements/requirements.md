# Requirements Document: Screenshot Viewer Enhancements

## Introduction

This feature enhances the Screenshot Viewer with comprehensive UX improvements including keyboard shortcuts, visual indicators, markdown rendering, AI integration, and streamlined interactions. The goal is to create a more efficient, keyboard-driven workflow that minimizes unnecessary mouse movements and provides clear visual feedback for common operations.

## Glossary

- **Screenshot Viewer**: The modal overlay that displays a screenshot with its metadata, notes, and controls
- **Notes Editor**: The textarea component where users write and edit notes for screenshots
- **Notes Preview**: The read-only view that displays formatted notes with markdown and hashtag highlighting
- **Keyboard Shortcut**: A key combination that triggers an action without requiring mouse interaction
- **Toast/Snackbar**: A temporary notification message that appears to confirm actions or display errors
- **Download Status**: A visual indicator showing whether a screenshot has been downloaded to the user's local system
- **Tag Cleanup**: The process of removing tags that no longer reference any existing screenshots

## Requirements

### Requirement 1: ESC Key Behavior Fix

**User Story:** As a user, I want the ESC key to close the screenshot viewer consistently, so that I can quickly exit regardless of where my cursor is positioned.

#### Acceptance Criteria

1. WHEN the screenshot viewer is open and the user presses ESC, THE System SHALL close the viewer
2. WHEN the cursor is hovering over the screenshot image and the user presses ESC, THE System SHALL close the viewer
3. WHEN the cursor is anywhere within the viewer modal and the user presses ESC, THE System SHALL close the viewer
4. WHEN unsaved changes exist and the user presses ESC, THE System SHALL show the discard confirmation dialog
5. WHEN the viewer is closed via ESC, THE System SHALL return focus to the main screenshots page

### Requirement 2: Scroll Behavior Fix

**User Story:** As a user, I want scrolling to work only within the notes preview panel when the screenshot viewer is open, so that I can read long notes without affecting the background page.

#### Acceptance Criteria

1. WHEN the screenshot viewer opens, THE System SHALL disable scrolling on the background page
2. WHEN the notes preview content exceeds the visible area, THE System SHALL enable scrolling within the notes preview panel
3. WHEN the user scrolls within the notes preview panel, THE System SHALL NOT scroll the background page
4. WHEN the screenshot viewer closes, THE System SHALL re-enable scrolling on the background page
5. WHEN the notes preview is shorter than the visible area, THE System SHALL disable scrolling for that panel

### Requirement 3: Screenshot Deletion

**User Story:** As a user, I want to delete screenshots directly from the viewer using the DEL key, so that I can quickly remove unwanted images without leaving the viewer.

#### Acceptance Criteria

1. WHEN the screenshot viewer is open, THE System SHALL display a delete/trash icon button
2. WHEN the user clicks the delete icon or presses DEL, THE System SHALL show a confirmation dialog
3. WHEN the user confirms deletion, THE System SHALL remove the screenshot from the database
4. WHEN the screenshot is deleted, THE System SHALL close the viewer and return to the folder view
5. WHEN the user cancels deletion, THE System SHALL keep the viewer open with no changes

### Requirement 4: Keyboard Shortcuts for Discard Dialog

**User Story:** As a user, I want to use keyboard shortcuts in the discard changes dialog, so that I can make decisions without moving my hands to the mouse.

#### Acceptance Criteria

1. WHEN the discard changes dialog appears, THE System SHALL support Enter key to keep editing
2. WHEN the discard changes dialog appears, THE System SHALL support ESC key to discard changes
3. WHEN the user presses Enter in the dialog, THE System SHALL return to editing mode
4. WHEN the user presses ESC in the dialog, THE System SHALL discard changes and close the viewer
5. WHEN keyboard shortcuts are used, THE System SHALL provide the same behavior as clicking the buttons

### Requirement 5: Refine with AI Feature

**User Story:** As a user, I want to refine existing notes using AI, so that I can improve manually written notes without starting from scratch.

#### Acceptance Criteria

1. WHEN notes exist in the editor, THE System SHALL display a "Refine with AI" button
2. WHEN the user clicks "Refine with AI", THE System SHALL send the existing notes to the AI service
3. WHEN the AI processes the notes, THE System SHALL format the response using the same structure as "Generate with AI"
4. WHEN the AI returns refined notes, THE System SHALL replace the editor content with the refined version
5. WHEN the AI refinement fails, THE System SHALL display an error message and keep the original notes

### Requirement 6: Markdown Rendering in Notes Preview

**User Story:** As a user, I want markdown formatting to render correctly in the notes preview, so that I can see properly formatted text instead of [object Object] errors.

#### Acceptance Criteria

1. WHEN notes contain bold text (e.g., `**text**`), THE System SHALL render it as bold in the preview
2. WHEN notes contain bullet lists (e.g., `- item`), THE System SHALL render them as proper list items
3. WHEN notes contain nested lists, THE System SHALL render them with proper indentation
4. WHEN notes contain hashtags within markdown, THE System SHALL highlight the hashtags correctly
5. WHEN rendering fails, THE System SHALL display the raw text instead of [object Object]

### Requirement 7: Tab Key Support in Notes Editor

**User Story:** As a user, I want to use the Tab key for indentation in the notes editor, so that I can format my notes like in a code editor.

#### Acceptance Criteria

1. WHEN the user presses Tab in the notes editor, THE System SHALL insert a tab character or spaces at the cursor position
2. WHEN the user presses Tab, THE System SHALL NOT move focus to the next UI element
3. WHEN the user presses Shift+Tab, THE System SHALL remove indentation at the cursor position
4. WHEN text is selected and the user presses Tab, THE System SHALL indent all selected lines
5. WHEN text is selected and the user presses Shift+Tab, THE System SHALL unindent all selected lines

### Requirement 8: Hashtag Highlighting in Notes Editor

**User Story:** As a user, I want hashtags to be visually highlighted in the notes editor, so that I can easily identify tags while typing.

#### Acceptance Criteria

1. WHEN the user types a hashtag (e.g., `#tag`) in the editor, THE System SHALL highlight it with a distinct color
2. WHEN the editor contains multiple hashtags, THE System SHALL highlight all of them
3. WHEN the highlighting is applied, THE System SHALL use the same style as the notes preview
4. WHEN the user edits a hashtag, THE System SHALL update the highlighting in real-time
5. WHEN the editor loses focus, THE System SHALL maintain the hashtag highlighting

### Requirement 9: Tag Cleanup and Archival

**User Story:** As a user, I want the tags list to only show tags for existing screenshots, so that I don't see outdated tags that lead to no results.

#### Acceptance Criteria

1. WHEN a screenshot with tags is deleted, THE System SHALL remove tags that no longer reference any screenshots
2. WHEN displaying the tags list, THE System SHALL only show tags that have at least one associated screenshot
3. WHEN a tag is removed from all screenshots, THE System SHALL automatically remove it from the tags list
4. WHEN the user navigates to the tags page, THE System SHALL display only active tags
5. WHEN a tag has no screenshots, THE System SHALL NOT display it in the "Your Tags" page

### Requirement 10: Home Button Navigation

**User Story:** As a user, I want the "Receipts Tracker" button to navigate to the screenshots page, so that I can quickly access my most-used interface.

#### Acceptance Criteria

1. WHEN the user clicks the "Receipts Tracker" button, THE System SHALL navigate to the "My Screenshots" page
2. WHEN the user is on any page and clicks the home button, THE System SHALL navigate to `/screenshots`
3. WHEN the navigation occurs, THE System SHALL clear any active search queries
4. WHEN the navigation occurs, THE System SHALL display the folder view (not a specific folder)
5. WHEN the user is already on the screenshots page, THE System SHALL refresh the folder list

### Requirement 11: Download Status Indicator

**User Story:** As a user, I want to see which screenshots I've downloaded, so that I know which ones I've already reviewed and saved locally.

#### Acceptance Criteria

1. WHEN a user downloads a screenshot, THE System SHALL mark it as downloaded in the database
2. WHEN a screenshot is marked as downloaded, THE System SHALL display a checkmark icon
3. WHEN viewing the folder page, THE System SHALL show the checkmark to the left of the folder icon
4. WHEN viewing the screenshot viewer, THE System SHALL show the checkmark beside the download button
5. WHEN the user clicks the checkmark, THE System SHALL toggle the downloaded status

### Requirement 12: Simplified Download Button

**User Story:** As a user, I want a cleaner download button without text, so that the interface is more visual and less cluttered.

#### Acceptance Criteria

1. WHEN displaying the download button, THE System SHALL show only the download icon
2. WHEN displaying the download button, THE System SHALL show the keyboard shortcut (Ctrl+D) as a hint
3. WHEN the user hovers over the download button, THE System SHALL display a tooltip with "Download"
4. WHEN the download button is rendered, THE System SHALL NOT display the text "Download"
5. WHEN the button is clicked or Ctrl+D is pressed, THE System SHALL trigger the download

### Requirement 13: Simplified Close Button

**User Story:** As a user, I want the close button to show "ESC" instead of "X", so that I understand the universal keyboard shortcut for closing.

#### Acceptance Criteria

1. WHEN displaying the close button, THE System SHALL show "ESC" text instead of "X"
2. WHEN the user clicks the ESC button, THE System SHALL close the viewer
3. WHEN the user presses the ESC key, THE System SHALL trigger the same behavior as clicking the button
4. WHEN unsaved changes exist, THE System SHALL show the discard confirmation before closing
5. WHEN the button is styled, THE System SHALL maintain visual consistency with other keyboard hints

### Requirement 14: Remove Duplicate Edit Prompt

**User Story:** As a user, I want to see only one edit prompt, so that the interface is cleaner and less redundant.

#### Acceptance Criteria

1. WHEN the notes preview is displayed, THE System SHALL show the "Edit [E]" button
2. WHEN the notes preview is displayed, THE System SHALL NOT show "Press E to edit" text at the bottom
3. WHEN the user presses E, THE System SHALL enter edit mode
4. WHEN the user clicks the "Edit [E]" button, THE System SHALL enter edit mode
5. WHEN in edit mode, THE System SHALL hide the edit button

### Requirement 15: Unified Arrow Navigation

**User Story:** As a user, I want the arrow key hints to double as clickable buttons, so that the interface is cleaner and more intuitive.

#### Acceptance Criteria

1. WHEN displaying navigation controls, THE System SHALL show keyboard hint icons for left/right arrows
2. WHEN the user clicks the arrow hint icons, THE System SHALL navigate to the previous/next screenshot
3. WHEN the user presses the arrow keys, THE System SHALL navigate to the previous/next screenshot
4. WHEN displaying the navigation, THE System SHALL NOT show separate arrow buttons and hints
5. WHEN the arrow hints are styled, THE System SHALL make them appear clickable

### Requirement 16: Screenshot Rename Functionality

**User Story:** As a user, I want to rename screenshots using F2, so that I can organize my screenshots without leaving the viewer.

#### Acceptance Criteria

1. WHEN the screenshot viewer is open, THE System SHALL display an F2 keyboard hint beside the screenshot name
2. WHEN the user presses F2, THE System SHALL make the screenshot name editable
3. WHEN the name is being edited, THE System SHALL show a text input field
4. WHEN the user presses Enter, THE System SHALL save the new name
5. WHEN the user presses ESC while editing the name, THE System SHALL cancel the rename and restore the original name

### Requirement 17: Toast Notification Positioning

**User Story:** As a user, I want all notifications to appear above the screenshot viewer, so that I can see success/error messages without them being hidden.

#### Acceptance Criteria

1. WHEN a toast notification appears while the viewer is open, THE System SHALL display it at the bottom-left of the viewport
2. WHEN displaying notifications, THE System SHALL set the z-index higher than the screenshot viewer
3. WHEN multiple notifications appear, THE System SHALL stack them vertically
4. WHEN the viewer is closed, THE System SHALL continue displaying notifications at the bottom-left
5. WHEN a notification appears, THE System SHALL ensure it is visible above all other UI elements

## Success Metrics

- Keyboard shortcut usage: >70% of power users use keyboard shortcuts for common actions
- Time to complete common tasks: 30% reduction in time to delete, rename, or navigate screenshots
- User satisfaction: Improved ratings for viewer usability and efficiency
- Error rate: <1% of markdown rendering failures
- Download tracking accuracy: 100% of downloads correctly marked

## Technical Constraints

- Must maintain backward compatibility with existing screenshots
- Must work with React 19 and TypeScript strict mode
- Must support Chrome, Firefox, Safari, and Edge (latest 2 versions)
- Must not impact page load performance (lazy load AI features)
- Must handle concurrent edits gracefully (optimistic updates)
