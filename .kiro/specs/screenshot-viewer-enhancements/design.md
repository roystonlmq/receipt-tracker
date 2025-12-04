# Design Document: Screenshot Viewer Enhancements

## Overview

This design implements 17 UX enhancements to the Screenshot Viewer, transforming it into a keyboard-driven, efficient interface for managing screenshots. The enhancements focus on five key areas:

1. **Keyboard Navigation**: Consistent ESC behavior, keyboard shortcuts for dialogs, F2 rename, arrow navigation
2. **Visual Feedback**: Download status indicators, simplified UI elements, unified navigation controls
3. **Content Management**: Screenshot deletion with confirmation, tag cleanup, markdown rendering
4. **AI Integration**: "Refine with AI" feature for improving existing notes
5. **Editor Improvements**: Tab key support, hashtag highlighting, scroll behavior fixes

The design maintains backward compatibility while introducing progressive enhancements that improve the user experience without breaking existing functionality.

## Architecture

### High-Level Component Structure

```
ScreenshotViewer (enhanced)
├── ViewerHeader (new component)
│   ├── Screenshot Name (editable with F2)
│   ├── Close Button (ESC hint)
│   └── Delete Button (DEL hint)
├── ViewerContent
│   ├── Screenshot Image (with download status indicator)
│   ├── Navigation Controls (unified arrow hints/buttons)
│   └── Download Button (icon only with Ctrl+D hint)
├── NotesSection (enhanced)
│   ├── NotesPreview (with markdown rendering and scroll)
│   │   └── MarkdownRenderer (new component)
│   └── NotesEditor (with tab support and hashtag highlighting)
│       └── HighlightedTextarea (new component)
├── ActionButtons
│   ├── Generate with AI
│   ├── Refine with AI (new)
│   └── Edit [E] button
└── ConfirmDialog (enhanced with keyboard shortcuts)
```

### Event Flow Diagrams

#### ESC Key Handling
```
User presses ESC
    ↓
Is name being edited? → Yes → Cancel rename, restore original
    ↓ No
Are there unsaved notes? → Yes → Show discard dialog
    ↓ No
Close viewer, restore background scroll
```

#### Delete Flow
```
User presses DEL or clicks delete icon
    ↓
Show confirmation dialog
    ↓
User confirms (Enter) or cancels (ESC)
    ↓
If confirmed:
    - Delete from database
    - Remove from UI
    - Close viewer
    - Show success toast
    - Clean up orphaned tags
```

#### Download Status Flow
```
User downloads screenshot (Ctrl+D)
    ↓
Save file to user's system
    ↓
Mark as downloaded in database
    ↓
Update UI to show checkmark
    ↓
Show success toast
```

## Components and Interfaces

### 1. Enhanced ScreenshotViewer Component

**New Props:**
```typescript
interface ScreenshotViewerProps {
  screenshot: Screenshot;
  onUpdate: (screenshot: Screenshot) => void;
  onDelete: (screenshotId: number) => void; // New
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
}
```

**New State:**
```typescript
interface ViewerState {
  isEditingName: boolean;
  editedName: string;
  showDeleteConfirm: boolean;
  showDiscardConfirm: boolean;
  isRefiningWithAI: boolean;
}
```

**Key Methods:**
- `handleKeyDown(e: KeyboardEvent)`: Central keyboard event handler
- `handleDelete()`: Show delete confirmation
- `handleConfirmDelete()`: Execute deletion
- `handleRename()`: Enter rename mode (F2)
- `handleSaveRename()`: Save new name (Enter)
- `handleCancelRename()`: Cancel rename (ESC)
- `handleRefineWithAI()`: Send notes to AI for refinement
- `handleToggleDownloadStatus()`: Toggle downloaded flag

### 2. ViewerHeader Component (New)

**Purpose:** Encapsulates the top bar with name, close, and delete buttons.

**Interface:**
```typescript
interface ViewerHeaderProps {
  screenshotName: string;
  isEditingName: boolean;
  onNameChange: (name: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onClose: () => void;
  onDelete: () => void;
}
```

**Features:**
- Inline name editing with F2 trigger
- ESC button with keyboard hint
- Delete button with DEL hint
- Keyboard hint styling for F2

### 3. MarkdownRenderer Component (New)

**Purpose:** Safely renders markdown content with hashtag highlighting.

**Interface:**
```typescript
interface MarkdownRendererProps {
  content: string;
  className?: string;
}
```

**Implementation:**
- Parse markdown using a lightweight library (e.g., `marked` or `react-markdown`)
- Apply hashtag highlighting after markdown parsing
- Handle nested structures (lists within lists)
- Graceful fallback to plain text on parse errors
- Sanitize HTML to prevent XSS

### 4. HighlightedTextarea Component (New)

**Purpose:** Textarea with syntax highlighting for hashtags and tab key support.

**Interface:**
```typescript
interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  placeholder?: string;
  className?: string;
}
```

**Features:**
- Overlay div with highlighted hashtags
- Tab key inserts spaces/tabs (doesn't change focus)
- Shift+Tab removes indentation
- Real-time hashtag detection and highlighting
- Synchronized scroll between textarea and overlay

### 5. Enhanced ConfirmDialog Component

**New Props:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmShortcut?: string; // e.g., "Enter"
  cancelShortcut?: string;  // e.g., "ESC"
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}
```

**Enhancements:**
- Keyboard shortcut hints displayed on buttons
- Enter key triggers confirm action
- ESC key triggers cancel action
- Focus trap within dialog
- Variant styling for delete (danger) vs discard (warning)

### 6. NavigationControls Component (Enhanced)

**Purpose:** Unified arrow hints that double as clickable buttons.

**Interface:**
```typescript
interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}
```

**Styling:**
- Arrow key icons styled as keyboard hints
- Hover state indicates clickability
- Disabled state when at boundaries
- Consistent with other keyboard hint styling

## Data Models

### Enhanced Screenshot Type

```typescript
interface Screenshot {
  id: number;
  userId: number;
  filename: string;
  originalName: string;
  filepath: string;
  folder: string;
  notes: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  downloaded: boolean; // New field
}
```

### Database Schema Changes

```sql
-- Add downloaded column to screenshots table
ALTER TABLE screenshots 
ADD COLUMN downloaded BOOLEAN DEFAULT FALSE;

-- Add index for tag queries
CREATE INDEX idx_screenshots_tags ON screenshots USING GIN(tags);
```

### Tag Cleanup Query

```sql
-- Get all unique tags from existing screenshots
SELECT DISTINCT unnest(tags) as tag 
FROM screenshots 
WHERE user_id = $1 
ORDER BY tag;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable criteria, I've identified the following redundancies:
- 1.2, 1.3 are redundant with 1.1 (all test ESC closing viewer)
- 4.3, 4.4 are redundant with 4.1, 4.2 (dialog keyboard shortcuts)
- 9.3, 9.4, 9.5 are redundant with 9.1, 9.2 (tag cleanup)
- 10.2 is redundant with 10.1 (home navigation)
- 12.4 is redundant with 12.1 (download button text)
- 13.4 is redundant with 1.4 (unsaved changes confirmation)
- 16.3 is redundant with 16.2 (name editing)
- 17.5 is redundant with 17.2 (toast z-index)

These redundant properties will be consolidated into comprehensive properties below.

### Property 1: ESC key closes viewer consistently
*For any* viewer state (viewing, editing, cursor position), pressing ESC should close the viewer unless there are unsaved changes
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Unsaved changes trigger confirmation
*For any* notes content that differs from the saved state, pressing ESC should show the discard confirmation dialog
**Validates: Requirements 1.4, 13.4**

### Property 3: Focus returns after closing
*For any* method of closing the viewer (ESC, click, delete), focus should return to the main screenshots page
**Validates: Requirements 1.5**

### Property 4: Background scroll is disabled when viewer is open
*For any* scroll attempt on the background page while the viewer is open, the background should not scroll
**Validates: Requirements 2.1, 2.3**

### Property 5: Notes preview scrolls when content overflows
*For any* notes content that exceeds the visible area, the notes preview panel should enable scrolling
**Validates: Requirements 2.2**

### Property 6: Background scroll is restored when viewer closes
*For any* viewer close action, scrolling should be re-enabled on the background page
**Validates: Requirements 2.4**

### Property 7: Short notes don't show scrollbar
*For any* notes content shorter than the visible area, the notes preview should not show a scrollbar
**Validates: Requirements 2.5**

### Property 8: Delete triggers confirmation
*For any* delete action (DEL key or button click), a confirmation dialog should appear
**Validates: Requirements 3.2**

### Property 9: Confirmed deletion removes screenshot
*For any* screenshot, confirming deletion should remove it from the database and close the viewer
**Validates: Requirements 3.3, 3.4**

### Property 10: Canceled deletion preserves state
*For any* delete cancellation, the viewer should remain open and the screenshot should be unchanged
**Validates: Requirements 3.5**

### Property 11: Dialog keyboard shortcuts work
*For any* confirmation dialog, Enter should confirm and ESC should cancel
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 12: Keyboard and mouse actions are equivalent
*For any* action with both keyboard and mouse options, both should produce identical results
**Validates: Requirements 4.5**

### Property 13: Refine button appears with notes
*For any* editor state with non-empty notes, the "Refine with AI" button should be visible
**Validates: Requirements 5.1**

### Property 14: Refine with AI sends notes to service
*For any* notes content, clicking "Refine with AI" should send the content to the AI service
**Validates: Requirements 5.2**

### Property 15: AI refinement uses consistent format
*For any* AI-refined notes, the output format should match the "Generate with AI" format
**Validates: Requirements 5.3**

### Property 16: AI response updates editor
*For any* successful AI refinement, the editor content should be replaced with the refined version
**Validates: Requirements 5.4**

### Property 17: AI errors preserve original notes
*For any* AI refinement failure, the original notes should remain unchanged and an error should display
**Validates: Requirements 5.5**

### Property 18: Markdown bold renders correctly
*For any* notes containing `**text**` syntax, the preview should render it as bold HTML
**Validates: Requirements 6.1**

### Property 19: Markdown lists render correctly
*For any* notes containing `- item` syntax, the preview should render proper HTML list items
**Validates: Requirements 6.2**

### Property 20: Nested lists render with indentation
*For any* notes containing nested list syntax, the preview should render with proper indentation levels
**Validates: Requirements 6.3**

### Property 21: Hashtags work within markdown
*For any* notes containing hashtags within markdown, both markdown and hashtag highlighting should render correctly
**Validates: Requirements 6.4**

### Property 22: Rendering errors show raw text
*For any* markdown rendering failure, the preview should display raw text instead of [object Object]
**Validates: Requirements 6.5**

### Property 23: Tab inserts indentation
*For any* cursor position in the editor, pressing Tab should insert spaces/tab at that position
**Validates: Requirements 7.1**

### Property 24: Tab doesn't change focus
*For any* Tab press in the editor, focus should remain in the textarea
**Validates: Requirements 7.2**

### Property 25: Shift+Tab removes indentation
*For any* indented line, pressing Shift+Tab should remove indentation
**Validates: Requirements 7.3**

### Property 26: Tab indents selected lines
*For any* multi-line selection, pressing Tab should indent all selected lines
**Validates: Requirements 7.4**

### Property 27: Shift+Tab unindents selected lines
*For any* multi-line selection of indented text, pressing Shift+Tab should unindent all lines
**Validates: Requirements 7.5**

### Property 28: Hashtags are highlighted in editor
*For any* hashtag typed in the editor, it should be highlighted with a distinct color
**Validates: Requirements 8.1**

### Property 29: All hashtags are highlighted
*For any* editor content with multiple hashtags, all should be highlighted
**Validates: Requirements 8.2**

### Property 30: Editor and preview use same hashtag style
*For any* hashtag, the highlighting style should be consistent between editor and preview
**Validates: Requirements 8.3**

### Property 31: Hashtag highlighting updates in real-time
*For any* hashtag edit, the highlighting should update immediately
**Validates: Requirements 8.4**

### Property 32: Highlighting persists after blur
*For any* editor blur event, hashtag highlighting should remain visible
**Validates: Requirements 8.5**

### Property 33: Orphaned tags are removed
*For any* tag that no longer references any screenshots, it should be removed from the tags list
**Validates: Requirements 9.1, 9.3**

### Property 34: Tags list shows only active tags
*For any* tag in the tags list, it should have at least one associated screenshot
**Validates: Requirements 9.2, 9.4, 9.5**

### Property 35: Home navigation clears search
*For any* active search query, clicking home should clear the search and show folders
**Validates: Requirements 10.3**

### Property 36: Home shows folder view
*For any* navigation to home, the folder view should be displayed (not a specific folder)
**Validates: Requirements 10.4**

### Property 37: Home refreshes folder list
*For any* home click while already on screenshots page, the folder list should refresh
**Validates: Requirements 10.5**

### Property 38: Download marks screenshot
*For any* screenshot download, the downloaded flag should be set to true in the database
**Validates: Requirements 11.1**

### Property 39: Downloaded screenshots show checkmark
*For any* screenshot with downloaded=true, a checkmark icon should be displayed
**Validates: Requirements 11.2**

### Property 40: Checkmark toggles download status
*For any* checkmark click, the downloaded status should toggle in both database and UI
**Validates: Requirements 11.5**

### Property 41: Download button shows tooltip
*For any* hover over the download button, a "Download" tooltip should appear
**Validates: Requirements 12.3**

### Property 42: Download works via click and keyboard
*For any* download action (click or Ctrl+D), the screenshot should be saved to the user's system
**Validates: Requirements 12.5**

### Property 43: ESC button closes viewer
*For any* click on the ESC button, the viewer should close (with confirmation if unsaved changes)
**Validates: Requirements 13.2**

### Property 44: ESC key and button are equivalent
*For any* close action, pressing ESC key should behave identically to clicking the ESC button
**Validates: Requirements 13.3**

### Property 45: Keyboard hints are visually consistent
*For any* keyboard hint element, the styling should be consistent across the interface
**Validates: Requirements 13.5**

### Property 46: E key enters edit mode
*For any* press of the E key in preview mode, the editor should become active
**Validates: Requirements 14.3**

### Property 47: Edit button enters edit mode
*For any* click on the "Edit [E]" button, the editor should become active
**Validates: Requirements 14.4**

### Property 48: Edit button hides in edit mode
*For any* transition to edit mode, the "Edit [E]" button should be hidden
**Validates: Requirements 14.5**

### Property 49: Arrow hints are clickable
*For any* click on arrow hint icons, navigation to prev/next screenshot should occur
**Validates: Requirements 15.2**

### Property 50: Arrow keys navigate screenshots
*For any* arrow key press, navigation to prev/next screenshot should occur
**Validates: Requirements 15.3**

### Property 51: Arrow hints appear clickable
*For any* arrow hint, hover state should indicate it's clickable
**Validates: Requirements 15.5**

### Property 52: F2 enables name editing
*For any* F2 press, the screenshot name should become editable
**Validates: Requirements 16.2, 16.3**

### Property 53: Enter saves renamed screenshot
*For any* name edit, pressing Enter should save the new name to the database
**Validates: Requirements 16.4**

### Property 54: ESC cancels rename
*For any* name edit in progress, pressing ESC should restore the original name
**Validates: Requirements 16.5**

### Property 55: Toasts appear at bottom-left
*For any* toast notification while viewer is open, it should appear at the bottom-left of the viewport
**Validates: Requirements 17.1**

### Property 56: Toasts have higher z-index than viewer
*For any* toast notification, its z-index should be higher than the screenshot viewer
**Validates: Requirements 17.2, 17.5**

### Property 57: Multiple toasts stack vertically
*For any* sequence of toast notifications, they should stack vertically
**Validates: Requirements 17.3**

### Property 58: Toasts persist after viewer closes
*For any* toast displayed while viewer is open, it should remain visible after the viewer closes
**Validates: Requirements 17.4**

## Error Handling

### Keyboard Event Conflicts
- **Cause:** Multiple keyboard handlers competing for the same key
- **Handling:** Use event.stopPropagation() and priority-based handling (name edit > notes edit > viewer controls)
- **User Impact:** Keyboard shortcuts work predictably based on current context

### AI Service Failures
- **Cause:** Network errors, API rate limits, service downtime
- **Handling:** Show error toast, keep original notes, log error for debugging
- **User Impact:** User can retry or continue editing manually

### Markdown Parsing Errors
- **Cause:** Malformed markdown, unsupported syntax, edge cases
- **Handling:** Catch parse errors, fall back to plain text rendering, log warning
- **User Impact:** Notes display as plain text instead of crashing

### Database Constraint Violations
- **Cause:** Concurrent edits, deleted screenshots, orphaned references
- **Handling:** Optimistic updates with rollback on error, show error toast
- **User Impact:** Changes revert if save fails, clear error message displayed

### Focus Management Issues
- **Cause:** Modal dialogs, async operations, browser focus quirks
- **Handling:** Use focus trap in dialogs, restore focus after async operations
- **User Impact:** Focus behaves predictably, keyboard navigation works smoothly

### Scroll Lock Conflicts
- **Cause:** Multiple modals, browser extensions, CSS conflicts
- **Handling:** Track scroll lock state, use body class for scroll prevention
- **User Impact:** Background stays locked while viewer is open

## Testing Strategy

### Unit Tests
- Test individual components in isolation (ViewerHeader, MarkdownRenderer, HighlightedTextarea)
- Test keyboard event handlers with simulated events
- Test markdown parsing with various input formats
- Test hashtag detection and highlighting logic
- Test tab key indentation logic
- Test download status toggle logic

### Property-Based Tests
- **Library:** fast-check (TypeScript property testing)
- **Configuration:** 100+ iterations per property
- **Properties:** All 58 correctness properties listed above
- **Generators:** Random notes content, markdown structures, keyboard events, UI states

### Integration Tests
- Test complete user flows (open viewer → edit → save → close)
- Test keyboard navigation through entire interface
- Test AI refinement with mocked service
- Test delete flow with confirmation
- Test rename flow with F2
- Test download and status tracking

### Manual Testing Checklist
- [ ] ESC closes viewer from any cursor position
- [ ] Background doesn't scroll when viewer is open
- [ ] Notes preview scrolls when content overflows
- [ ] DEL shows confirmation and deletes screenshot
- [ ] Enter/ESC work in confirmation dialogs
- [ ] Refine with AI improves existing notes
- [ ] Markdown renders correctly (bold, lists, nested lists)
- [ ] Tab key indents in editor
- [ ] Hashtags are highlighted in editor and preview
- [ ] Tags list only shows tags with screenshots
- [ ] Home button navigates to screenshots page
- [ ] Download status checkmark appears and toggles
- [ ] Download button shows only icon and Ctrl+D hint
- [ ] Close button shows "ESC" instead of "X"
- [ ] No duplicate "Press E to edit" text
- [ ] Arrow hints are clickable and work with keyboard
- [ ] F2 enables name editing
- [ ] Toasts appear above viewer at bottom-left

## Implementation Plan

### Phase 1: Core Keyboard Shortcuts (Requirements 1, 4, 13, 14, 15, 16)
1. Fix ESC key event handling to work from any cursor position
2. Add keyboard shortcuts to confirmation dialogs (Enter/ESC)
3. Implement F2 rename functionality
4. Unify arrow navigation (hints as buttons)
5. Remove duplicate edit prompts

### Phase 2: Scroll and Focus Management (Requirements 2)
1. Disable background scroll when viewer opens
2. Enable scroll in notes preview panel
3. Restore background scroll when viewer closes
4. Test scroll isolation

### Phase 3: Delete Functionality (Requirement 3)
1. Add delete button with trash icon
2. Wire up DEL keyboard shortcut
3. Show confirmation dialog
4. Implement delete logic
5. Close viewer after deletion

### Phase 4: Download Status Tracking (Requirements 11, 12)
1. Add downloaded column to database
2. Update download handler to set flag
3. Add checkmark icon component
4. Display checkmark in folder view
5. Display checkmark in viewer
6. Implement toggle functionality
7. Simplify download button (remove text)

### Phase 5: AI Refinement (Requirement 5)
1. Add "Refine with AI" button
2. Implement API call to AI service
3. Format AI response consistently
4. Update editor with refined notes
5. Handle errors gracefully

### Phase 6: Markdown Rendering (Requirement 6)
1. Install markdown parsing library
2. Create MarkdownRenderer component
3. Handle bold, lists, nested lists
4. Integrate hashtag highlighting
5. Add error handling for parse failures

### Phase 7: Editor Enhancements (Requirements 7, 8)
1. Implement tab key handling (insert spaces)
2. Implement Shift+Tab (remove indentation)
3. Handle multi-line selection indentation
4. Create HighlightedTextarea component
5. Implement real-time hashtag highlighting
6. Sync highlighting with preview style

### Phase 8: Tag Cleanup (Requirement 9)
1. Create tag cleanup query
2. Run cleanup after screenshot deletion
3. Filter tags list to show only active tags
4. Test with orphaned tags

### Phase 9: UI Simplification (Requirements 10, 13, 14, 15)
1. Update home button to navigate to screenshots
2. Change close button from "X" to "ESC"
3. Remove duplicate edit prompt
4. Style arrow hints as clickable buttons

### Phase 10: Toast Positioning (Requirement 17)
1. Update toast z-index to be above viewer
2. Position toasts at bottom-left
3. Implement vertical stacking
4. Test persistence after viewer closes

### Phase 11: Testing and Polish
1. Write property-based tests for all 58 properties
2. Write unit tests for new components
3. Write integration tests for user flows
4. Conduct manual testing
5. Fix bugs and edge cases
6. Performance optimization

## Dependencies

### New Dependencies
- `marked` or `react-markdown` (~10KB) - Markdown parsing
- `dompurify` (~20KB) - HTML sanitization for markdown output

### Existing Dependencies
- React 19
- TypeScript
- TanStack Router (for navigation)
- Drizzle ORM (for database)
- fast-check (for property-based testing)

## Performance Considerations

### Optimization Strategies
1. **Lazy Load AI Features:** Only load AI service code when needed
2. **Debounce Hashtag Highlighting:** Wait 100ms after typing before re-highlighting
3. **Memoize Markdown Rendering:** Cache parsed markdown to avoid re-parsing
4. **Virtual Scrolling:** If notes are very long, consider virtual scrolling
5. **Optimistic Updates:** Update UI immediately, sync with database in background

### Expected Performance
- Keyboard shortcut response: <16ms (instant feel)
- Markdown rendering: <50ms for typical notes
- Hashtag highlighting: <30ms for typical notes
- AI refinement: 2-5 seconds (with loading indicator)
- Database operations: <100ms (optimistic updates mask latency)

## Accessibility

### Keyboard Navigation
- All actions accessible via keyboard
- Focus trap in dialogs
- Clear focus indicators
- Logical tab order

### Screen Reader Support
- ARIA labels for icon buttons
- ARIA live regions for toasts
- ARIA dialog for confirmations
- Semantic HTML for markdown output

### Visual Accessibility
- High contrast maintained
- Keyboard hints clearly visible
- Focus indicators meet WCAG 2.1 AA
- Minimum touch target size: 44x44px

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Fallback Strategies
- Markdown parsing errors fall back to plain text
- Tab key fallback to default behavior if custom handling fails
- Scroll lock uses multiple techniques for cross-browser support

## Migration Strategy

### Database Migration
```sql
-- Add downloaded column with default false
ALTER TABLE screenshots 
ADD COLUMN downloaded BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX idx_screenshots_downloaded 
ON screenshots(user_id, downloaded);
```

### Rollout Plan
1. Deploy database migration
2. Deploy backend changes (download status API)
3. Deploy frontend changes (all UI enhancements)
4. Monitor error rates and performance
5. Gather user feedback

### Rollback Plan
- Database column can remain (no breaking changes)
- Frontend can revert to previous version
- No data loss risk (downloaded flag is additive)

## Future Enhancements

### Potential Improvements
1. **Bulk Operations:** Select multiple screenshots for deletion
2. **Keyboard Shortcuts Customization:** Let users customize shortcuts
3. **Markdown Toolbar:** Add formatting buttons for common markdown
4. **AI Suggestions:** Suggest tags based on image content
5. **Export Notes:** Export all notes as markdown file
6. **Undo/Redo:** Add undo/redo for note edits

### Alternative Approaches Considered
1. **Rich Text Editor:** Considered but markdown is simpler and more portable
2. **Inline Editing:** Considered editing name inline but F2 is more discoverable
3. **Swipe Gestures:** Considered for mobile but keyboard focus is desktop-first
4. **Auto-save:** Considered but explicit save gives users more control

## Conclusion

This design provides a comprehensive enhancement to the Screenshot Viewer, focusing on keyboard-driven efficiency, visual clarity, and robust error handling. The phased implementation plan allows for incremental delivery of value while maintaining system stability. The extensive property-based testing ensures correctness across all user interactions.
