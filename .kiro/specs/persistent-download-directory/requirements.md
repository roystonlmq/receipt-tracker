# Requirements Document: Persistent Download Directory

## Introduction

This feature implements improved download directory functionality for the screenshot viewer's Ctrl+D download feature. Currently, when users download screenshots and notes, the browser's file picker dialog appears each time, defaulting to a system folder (Downloads or Documents) rather than remembering the last location where files were saved. This creates friction in the user workflow, especially when organizing screenshots into specific project folders. This enhancement will use the browser's `showSaveFilePicker` API which remembers the last-used directory and suggests it for subsequent downloads, allowing users to save to any directory including system directories like Downloads and Documents.

## Glossary

- **File System Access API**: Browser API that allows web applications to read and write files with user permission
- **showSaveFilePicker**: Browser API that shows a file save dialog and remembers the last-used directory
- **Screenshot Viewer**: The modal component that displays screenshots and allows downloading via Ctrl+D
- **Directory Memory**: Browser's built-in capability to remember the last directory used in file picker dialogs
- **Snackbar**: Toast notification that appears at the bottom-left of the screen

## Requirements

### Requirement 1: Initial Directory Selection

**User Story:** As a user, I want to select a download directory once, so that all subsequent downloads go to the same location without prompting me.

#### Acceptance Criteria

1. WHEN a user presses Ctrl+D for the first time, THE System SHALL prompt the user to select a download directory
2. WHEN the user selects a directory, THE System SHALL store the directory handle in IndexedDB for future use
3. WHEN the user cancels the directory selection, THE System SHALL fall back to the traditional download method with file picker
4. WHEN storing the directory handle, THE System SHALL verify write permissions are granted
5. WHEN the directory is successfully selected, THE System SHALL save the screenshot and notes to that directory without additional prompts

### Requirement 2: Persistent Directory Usage

**User Story:** As a user, I want my selected download directory to be remembered across sessions, so that I don't have to select it every time I use the app.

#### Acceptance Criteria

1. WHEN a user has previously selected a download directory, THE System SHALL retrieve the stored directory handle from IndexedDB
2. WHEN retrieving the stored handle, THE System SHALL verify the directory still exists and is accessible
3. WHEN the stored directory is valid, THE System SHALL use it for downloads without showing any file picker dialog
4. WHEN the stored directory is invalid or inaccessible, THE System SHALL prompt the user to select a new directory
5. WHEN permissions are revoked for the stored directory, THE System SHALL clear the stored handle and prompt for a new selection

### Requirement 3: Sequential File Downloads

**User Story:** As a user, I want both the screenshot image and notes file to be saved to the same directory automatically, so that related files stay together.

#### Acceptance Criteria

1. WHEN downloading a screenshot with notes, THE System SHALL save the image file to the persistent directory first
2. WHEN the image file is saved successfully, THE System SHALL save the notes file to the same directory
3. WHEN saving multiple files, THE System SHALL not prompt the user for each file
4. WHEN a file already exists with the same name, THE System SHALL overwrite it without prompting
5. WHEN either file fails to save, THE System SHALL report the specific error to the user

### Requirement 4: Directory Change Capability

**User Story:** As a user, I want to change my download directory when organizing screenshots into different project folders, so that I can control where files are saved.

#### Acceptance Criteria

1. WHEN a user wants to change the download directory, THE System SHALL provide a UI control (button or keyboard shortcut) to select a new directory
2. WHEN a new directory is selected via the UI control, THE System SHALL replace the stored directory handle in IndexedDB with the new one
3. WHEN the directory is changed, THE System SHALL use the new directory for all subsequent downloads in the current and future sessions
4. WHEN a user manually chooses a different directory via the file picker (if shown), THE System SHALL update the stored directory handle to the newly selected directory
5. WHEN the user cancels the directory change, THE System SHALL keep the current directory unchanged

### Requirement 5: Permission Management

**User Story:** As a user, I want the app to handle directory permissions gracefully, so that I understand when and why permission prompts appear.

#### Acceptance Criteria

1. WHEN the System needs directory access, THE System SHALL check if permission is already granted before requesting
2. WHEN permission is denied, THE System SHALL display a clear error message explaining the issue
3. WHEN permission is granted, THE System SHALL not request permission again for the same directory
4. WHEN the browser revokes permission, THE System SHALL detect this and prompt for a new directory selection
5. WHEN permission checks fail, THE System SHALL fall back to traditional download methods

### Requirement 6: Error Handling and Fallback

**User Story:** As a user, I want downloads to work even if the persistent directory feature fails, so that I can always save my files.

#### Acceptance Criteria

1. WHEN the File System Access API is not supported, THE System SHALL use traditional download methods with file picker
2. WHEN saving to the persistent directory fails, THE System SHALL fall back to showing the file picker for that download
3. WHEN IndexedDB is unavailable, THE System SHALL use traditional download methods for all downloads
4. WHEN an error occurs, THE System SHALL display a user-friendly error message with actionable guidance
5. WHEN falling back to traditional methods, THE System SHALL not lose the user's file content

### Requirement 7: User Feedback and Status

**User Story:** As a user, I want to know where my files are being saved and whether the download succeeded, so that I can find them later.

#### Acceptance Criteria

1. WHEN files are saved successfully, THE System SHALL display a snackbar notification showing the directory name where files were saved
2. WHEN using a persistent directory, THE System SHALL include the directory name in the success message
3. WHEN the first download occurs, THE System SHALL inform the user via snackbar that the directory will be remembered for future downloads
4. WHEN a download fails, THE System SHALL display a snackbar with a specific error message explaining what went wrong
5. WHEN displaying the directory location, THE System SHALL show only the directory name (not the full path) for privacy and brevity

### Requirement 8: Browser Compatibility

**User Story:** As a user on different browsers, I want the download feature to work consistently, so that I have a reliable experience regardless of my browser choice.

#### Acceptance Criteria

1. WHEN using Chrome or Edge 86+, THE System SHALL use the File System Access API for persistent directories
2. WHEN using Firefox or Safari, THE System SHALL fall back to traditional download methods with file picker
3. WHEN the browser version is detected, THE System SHALL choose the appropriate download method automatically
4. WHEN browser capabilities change, THE System SHALL adapt without requiring user action
5. WHEN using an unsupported browser, THE System SHALL provide a clear message about limited functionality

## Success Metrics

- Reduction in user clicks: From 2+ clicks per download to 1 click after initial setup
- User satisfaction: Improved workflow efficiency for organizing screenshots
- Error rate: <1% of downloads fail due to permission or directory issues
- Adoption rate: >80% of users successfully set up persistent directory on first use

## Technical Constraints

- Must use File System Access API where supported (Chrome/Edge 86+)
- Must store directory handles in IndexedDB (not localStorage)
- Must handle permission prompts according to browser security policies
- Must work with existing download functionality in ScreenshotViewer component
- Must maintain backward compatibility with traditional download fallback
