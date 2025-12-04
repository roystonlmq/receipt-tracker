# Design Document: Persistent Download Directory

## Overview

This design implements improved download directory functionality using the File System Access API's `showSaveFilePicker`. The solution leverages the browser's built-in directory memory, which remembers the last-used directory and suggests it for subsequent file saves. When users press Ctrl+D to download screenshots and notes, the browser shows a file picker that defaults to the last-used directory, allowing users to save to any directory including system directories like Downloads and Documents. The implementation includes comprehensive error handling, graceful fallback to traditional downloads, and snackbar notifications showing where files were saved.

## Architecture

### High-Level Flow

```
User presses Ctrl+D
    ↓
Check for stored directory handle
    ↓
    ├─ Handle exists → Verify permissions → Save files → Show snackbar
    ↓
    ├─ Handle missing → Prompt for directory → Store handle → Save files → Show snackbar
    ↓
    └─ API not supported → Fall back to traditional download
```

### Component Structure

```
ScreenshotViewer (existing, enhanced)
├── handleDownload() (enhanced)
│   ├── Get or prompt for directory
│   ├── Save image and notes files
│   └── Show snackbar with directory name
├── Keyboard event handler (enhanced)
│   └── Ctrl+D: Download to persistent directory
└── Toast/Snackbar notifications (existing)

fileSystem.ts (enhanced)
├── getOrPromptForDirectory() (new)
├── saveFilesToDirectory() (new)
├── updateStoredDirectory() (new)
└── Existing functions (enhanced)
```

## Components and Interfaces

### 1. Enhanced fileSystem.ts Module

**New Functions:**

```typescript
/**
 * Get stored directory or prompt user to select one
 * Returns null if user cancels or API not supported
 */
export async function getOrPromptForDirectory(
  forcePrompt?: boolean
): Promise<{
  handle: FileSystemDirectoryHandle | null;
  isNewSelection: boolean;
  cancelled: boolean;
}>;

/**
 * Save multiple files to a directory
 * Returns success status and directory name for feedback
 */
export async function saveFilesToDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  files: Array<{ filename: string; content: string | Blob }>
): Promise<{
  success: boolean;
  directoryName: string;
  failedFiles: string[];
}>;

/**
 * Update the stored directory handle
 */
export async function updateStoredDirectory(
  handle: FileSystemDirectoryHandle
): Promise<void>;

/**
 * Get the name of a directory handle
 */
export function getDirectoryName(
  handle: FileSystemDirectoryHandle
): string;
```

**Enhanced Functions:**

```typescript
// Enhanced to work with persistent directories
export async function downloadFile(
  filename: string,
  content: string | Blob,
  mimeType?: string,
  directoryHandle?: FileSystemDirectoryHandle
): Promise<{
  success: boolean;
  usedPersistentDirectory: boolean;
  cancelled?: boolean;
  directoryName?: string;
}>;
```

### 2. Enhanced ScreenshotViewer Component

**New State:**

```typescript
const [isChangingDirectory, setIsChangingDirectory] = useState(false);
```

**Enhanced handleDownload Function:**

```typescript
const handleDownload = async () => {
  setIsDownloading(true);

  try {
    // Get screenshot with notes from server
    const result = await downloadScreenshotWithNotes({
      data: { id: screenshot.id },
    });

    if (!result.success || !result.screenshot) {
      throw new Error("Failed to fetch screenshot data");
    }

    // Get or prompt for directory
    const directoryResult = await getOrPromptForDirectory();

    if (directoryResult.cancelled) {
      return; // User cancelled
    }

    if (!directoryResult.handle) {
      // Fall back to traditional download
      await downloadFileFallback(/* ... */);
      return;
    }

    // Prepare files to save
    const files = [
      {
        filename: result.screenshot.filename,
        content: result.screenshot.imageData,
      },
    ];

    if (result.screenshot.notes?.trim()) {
      files.push({
        filename: result.screenshot.notesFilename,
        content: result.screenshot.notes,
      });
    }

    // Save files to directory
    const saveResult = await saveFilesToDirectory(
      directoryResult.handle,
      files
    );

    if (saveResult.success) {
      // Show success message with directory name
      const message = directoryResult.isNewSelection
        ? `Files saved to "${saveResult.directoryName}". This directory will be used for future downloads.`
        : `Files saved to "${saveResult.directoryName}"`;
      
      toast.success(message, 5000);
    } else {
      // Handle partial failures
      if (saveResult.failedFiles.length > 0) {
        toast.error(
          `Failed to save: ${saveResult.failedFiles.join(", ")}`,
          5000
        );
      }
    }
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download files. Please try again.", 5000);
  } finally {
    setIsDownloading(false);
  }
};
```

**Enhanced Keyboard Handler:**

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ... existing handlers ...

    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      
      if (!isDownloading) {
        handleDownload();
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [onClose, onNavigate, notes, screenshot.notes, isDownloading, isEditMode]);
```

### 3. Toast/Snackbar Component

**Usage for Directory Feedback:**

The existing toast system will be enhanced to display notifications in the bottom-left corner of the screen:
- Success messages with directory name (green, 5 second duration)
- First-time setup messages (green, 5 second duration)
- Error messages with actionable guidance (red, 7 second duration)
- Permission-related warnings (yellow, 7 second duration)

**Position Changes Required:**
- Move from `top-4 right-4` to `bottom-4 left-4` (16px from bottom, 16px from left edge)
- Increase z-index from `z-50` to `z-[70]` to ensure visibility above ScreenshotViewer (which uses `z-50`)
- This avoids cluttering the top-right area where download/close buttons are located

**Behavior:** Auto-dismisses after duration, or user can manually close with X button

## Data Models

### DirectoryResult Type
```typescript
interface DirectoryResult {
  handle: FileSystemDirectoryHandle | null;
  isNewSelection: boolean;  // True if user just selected this directory
  cancelled: boolean;        // True if user cancelled the picker
}
```

### SaveResult Type
```typescript
interface SaveResult {
  success: boolean;
  directoryName: string;
  failedFiles: string[];  // List of filenames that failed to save
}
```

### DownloadResult Type (Enhanced)
```typescript
interface DownloadResult {
  success: boolean;
  usedPersistentDirectory: boolean;
  cancelled?: boolean;
  directoryName?: string;  // Name of directory where files were saved
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Directory handle persistence
*For any* directory handle that is successfully stored, retrieving it from IndexedDB should return an equivalent handle with the same permissions
**Validates: Requirements 1.2, 2.1**

### Property 2: Permission verification before storage
*For any* directory handle, attempting to store it without write permissions should fail with an appropriate error
**Validates: Requirements 1.4**

### Property 3: No additional prompts for valid directory
*For any* valid stored directory handle, downloading files should not show any file picker dialogs
**Validates: Requirements 1.5, 2.3**

### Property 4: Multi-file same directory
*For any* screenshot with notes, both the image file and notes file should be saved to the same directory
**Validates: Requirements 3.2**

### Property 5: Single prompt for multiple files
*For any* download operation with multiple files, the system should show at most one directory picker prompt regardless of the number of files
**Validates: Requirements 3.3**

### Property 6: Error reporting completeness
*For any* file save failure, the system should report which specific file(s) failed to save
**Validates: Requirements 3.5**

### Property 7: Directory update on selection
*For any* directory selection (whether initial or manual change), the stored directory handle in IndexedDB should be updated to the newly selected directory
**Validates: Requirements 4.2, 4.4**

### Property 8: Directory persistence across sessions
*For any* directory that is stored, subsequent downloads in future sessions should use that directory until a new one is selected
**Validates: Requirements 4.3**

### Property 9: Minimal permission requests
*For any* directory with already-granted permissions, the system should not request permissions again
**Validates: Requirements 7.1, 7.3**

### Property 10: Success notification with directory name
*For any* successful file save operation, the system should display a notification containing the directory name where files were saved
**Validates: Requirements 8.1, 8.2**

### Property 11: Directory name privacy
*For any* directory name displayed to the user, it should contain only the directory name without path separators or parent directory information
**Validates: Requirements 8.5**

## Error Handling

### Permission Errors
- **Cause:** User denies permission, browser revokes permission, security policy blocks access
- **Handling:** 
  - Detect permission denial via API error codes
  - Clear stored directory handle from IndexedDB
  - Display user-friendly error message via snackbar
  - Fall back to traditional download with file picker
- **User Impact:** User sees clear error message and can still download files using traditional method

### Directory Access Errors
- **Cause:** Directory deleted, moved, or on disconnected drive
- **Handling:**
  - Catch filesystem errors when accessing stored handle
  - Clear invalid handle from IndexedDB
  - Prompt user to select a new directory
  - Log error for debugging
- **User Impact:** User is prompted to select a new directory, workflow continues

### File Save Errors
- **Cause:** Disk full, file in use, filename conflicts, write errors
- **Handling:**
  - Catch errors per file (don't fail entire operation)
  - Track which files succeeded and which failed
  - Display specific error messages for failed files
  - Successfully saved files remain saved
- **User Impact:** User knows exactly which files failed and can retry

### IndexedDB Errors
- **Cause:** Storage quota exceeded, database corruption, browser restrictions
- **Handling:**
  - Catch database errors on read/write operations
  - Fall back to traditional download without persistence
  - Display warning about inability to remember directory
  - Continue with functional download capability
- **User Impact:** Feature degrades gracefully, downloads still work

### API Unavailability
- **Cause:** Unsupported browser (Firefox, Safari), older browser versions
- **Handling:**
  - Check for File System Access API support on initialization
  - Use traditional download methods automatically
  - No error messages (expected behavior for these browsers)
- **User Impact:** Traditional download experience, no persistent directory feature

### Keyboard Shortcut Conflicts
- **Cause:** Browser bookmark dialog (Ctrl+D), other extensions
- **Handling:**
  - Use preventDefault() to block browser default
  - Check if viewer is active before handling shortcut
  - Provide alternative UI button for download
- **User Impact:** Keyboard shortcut works reliably, button always available

### Manual Directory Navigation
- **Behavior:** When user manually navigates to a different directory in the file picker
- **Handling:**
  - Detect directory change from picker result
  - Update stored directory handle automatically
  - Use new directory for all subsequent downloads
- **User Impact:** System remembers last-used directory, making it easy to switch between project folders

## Testing Strategy

### Unit Tests
- Test `getOrPromptForDirectory()` with various states (no stored handle, valid handle, invalid handle)
- Test `saveFilesToDirectory()` with single and multiple files
- Test `updateStoredDirectory()` stores handle correctly
- Test `getDirectoryName()` extracts name without path
- Test permission checking logic
- Test error handling for each error type
- Test keyboard event handler with Ctrl+D
- Test snackbar message formatting

### Property-Based Tests
- **Library:** fast-check (already in project)
- **Configuration:** 100+ iterations per property
- **Properties:** All 11 correctness properties listed above
- **Generators:**
  - Random directory handles (mocked)
  - Random file sets (1-10 files)
  - Random permission states
  - Random error conditions

### Integration Tests
- Test complete download flow: Ctrl+D → select directory → files saved → snackbar shown
- Test directory persistence: download → close app → reopen → download again (same directory)
- Test directory change: manually navigate to new directory → verify new directory used for next download
- Test multi-file download: screenshot with notes → both files in same directory
- Test error recovery: invalid directory → prompt for new → continue successfully
- Test fallback: disable API → traditional download works

### Manual Testing Checklist
- [ ] First download prompts for directory
- [ ] Second download uses same directory without prompt
- [ ] Manually navigating to different directory updates stored location
- [ ] Third download uses the new directory from manual navigation
- [ ] Both image and notes save to same directory
- [ ] Snackbar shows directory name on success
- [ ] First download shows "will be remembered" message
- [ ] Error messages are clear and actionable
- [ ] Works in Chrome/Edge (persistent directory)
- [ ] Falls back gracefully in Firefox/Safari
- [ ] Directory persists after browser restart
- [ ] Permission denial handled gracefully
- [ ] Invalid directory triggers new selection

## Implementation Plan

### Phase 1: Core Directory Management
1. Enhance `fileSystem.ts` with new functions:
   - `getOrPromptForDirectory()`
   - `saveFilesToDirectory()`
   - `updateStoredDirectory()`
   - `getDirectoryName()`
2. Add comprehensive error handling
3. Write unit tests for new functions

### Phase 2: ScreenshotViewer Integration
1. Update `handleDownload()` to use persistent directory
2. Update keyboard event handler
3. Add state management for directory operations
4. Write integration tests

### Phase 3: User Feedback
1. Update Toast component position from top-right to bottom-left
2. Increase Toast z-index from z-50 to z-[70] for visibility above ScreenshotViewer
3. Enhance snackbar messages with directory names
4. Add first-time setup message
5. Add error messages for various failure modes
6. Test message formatting and timing

### Phase 4: Permission Handling
1. Implement permission checking before operations
2. Add permission error recovery
3. Add directory validation on retrieval
4. Test permission revocation scenarios

### Phase 5: Testing and Polish
1. Write property-based tests for all properties
2. Conduct cross-browser testing
3. Test error scenarios thoroughly
4. Performance profiling
5. Documentation updates

## Dependencies

### Existing Dependencies
- File System Access API (Chrome/Edge 86+)
- IndexedDB (all modern browsers)
- React 19
- TanStack Router
- Existing toast/snackbar system

### No New Dependencies Required
All functionality can be implemented using existing browser APIs and project dependencies.

## Performance Considerations

### Optimization Strategies
1. **Lazy Permission Checks:** Only check permissions when actually needed
2. **Cached Directory Handle:** Keep handle in memory during session
3. **Batch File Writes:** Write multiple files in parallel when possible
4. **Minimal IndexedDB Access:** Read once on first download, write only on changes
5. **Async Operations:** All file operations are non-blocking

### Expected Performance
- Directory selection: User-initiated, no performance concern
- Permission check: <10ms (cached after first check)
- File save: Depends on file size, typically <100ms per file
- IndexedDB operations: <50ms for read/write
- Snackbar display: Immediate (no delay)

### Memory Considerations
- Directory handle: <1KB in memory
- IndexedDB storage: <5KB per stored handle
- No memory leaks (handles cleaned up properly)

## Accessibility

### Keyboard Navigation
- Ctrl+D: Primary download shortcut (cross-platform)
- Escape: Cancel directory picker (browser default)
- All functionality available via keyboard
- Directory changes happen naturally through file picker navigation

### Screen Reader Support
- Download button has descriptive aria-label
- Snackbar notifications announced via aria-live
- Error messages announced immediately
- Directory picker is native browser dialog (accessible by default)

### Visual Accessibility
- Snackbar messages have high contrast
- Error messages use distinct styling
- Loading states clearly indicated
- No reliance on color alone for status

## Browser Compatibility

### Supported Browsers with Persistent Directory
- Chrome 86+ (Windows, macOS, Linux)
- Edge 86+ (Windows, macOS)
- Opera 72+

### Supported Browsers with Fallback
- Firefox (all versions) - uses traditional download
- Safari (all versions) - uses traditional download
- Older Chrome/Edge - uses traditional download

### Feature Detection
```typescript
function isFileSystemAccessSupported(): boolean {
  return (
    'showDirectoryPicker' in window &&
    typeof window.showDirectoryPicker === 'function'
  );
}
```

### Graceful Degradation
- Feature detection on initialization
- Automatic fallback to traditional downloads
- No error messages for expected unsupported browsers
- Full functionality maintained (just without persistence)

## Security Considerations

### Permission Model
- User must explicitly grant directory access
- Permissions can be revoked at any time
- Application respects browser security policies
- No access to directories without user consent

### Privacy
- Directory names shown without full paths
- No tracking of directory locations
- Handles stored locally in IndexedDB (not sent to server)
- User can clear stored handles via browser settings

### Data Integrity
- Files overwrite existing files (user controls directory)
- No risk of data loss (user chooses directory)
- Failed saves don't corrupt existing files
- Atomic write operations (file fully written or not at all)

## Migration Strategy

### Rollout Plan
1. **Phase 1:** Deploy with feature flag (enabled for Chrome/Edge only)
2. **Phase 2:** Monitor error rates and user feedback
3. **Phase 3:** Full rollout if metrics are positive
4. **Phase 4:** Consider adding UI for directory management

### Backward Compatibility
- Existing download functionality remains unchanged as fallback
- No breaking changes to API or user workflows
- Users on unsupported browsers see no changes
- No data migration required

### Rollback Plan
- Feature flag can disable persistent directory instantly
- Falls back to existing traditional download
- No data cleanup required (IndexedDB handles remain harmless)
- No user-visible changes on rollback

## Future Enhancements

### Potential Improvements
1. **Multiple Saved Directories:** Remember different directories for different projects
2. **Directory Management UI:** View and manage saved directories
3. **Auto-organize:** Automatically create subdirectories by date
4. **Batch Downloads:** Download multiple screenshots to same directory
5. **Directory Suggestions:** Suggest recently used directories
6. **Cloud Integration:** Support for cloud storage directories (OneDrive, Google Drive)

### Alternative Approaches Considered
1. **localStorage for paths:** Rejected - can't store directory handles, only strings
2. **File System Access API without persistence:** Rejected - defeats purpose of feature
3. **Electron-style file dialogs:** Rejected - not available in web browsers
4. **Service Worker caching:** Rejected - can't access file system from service worker

## Conclusion

This design provides a robust, user-friendly solution for persistent download directories using the File System Access API. The implementation maintains full backward compatibility through graceful fallback, handles errors comprehensively, and provides clear user feedback via snackbar notifications. The system automatically remembers the last-used directory, making it easy to switch between project folders while maintaining the convenience of automatic downloads. The phased rollout plan ensures safe deployment with easy rollback if needed.
