# Requirements Document

## Introduction

The Receipts Tracker is a web application designed to help users manage screenshots and receipts throughout their day. The system provides a photo album-like interface where screenshots are automatically organized by date-based folders, allowing users to upload, view, rename, and reorganize their screenshots efficiently. The application supports multi-user profiles with isolated storage, ensuring each user's screenshots remain private and organized according to their specific needs.

## Glossary

- **Screenshot**: A digital image file captured from a device screen, stored with metadata including timestamp and user-defined name
- **Receipt**: A synonym for screenshot in this context, referring to any uploaded image that serves as a record or proof
- **Folder**: A virtual container that groups screenshots by date using DDMMYYYY format
- **User Profile**: An authenticated user account with isolated screenshot storage and preferences
- **Auto-upload**: The system's capability to automatically categorize and place screenshots into appropriate date-based folders
- **Screenshot Name Format**: The standardized naming convention "DDMMYY - HHMM - screenshot name.png"
- **File Explorer**: The user interface component that displays folders and screenshots in a navigable hierarchy
- **System**: The Receipts Tracker application
- **Database**: The persistent storage layer using PostgreSQL and Drizzle ORM

## Requirements

### Requirement 1: Screenshot Upload

**User Story:** As a user, I want to upload screenshots to the system, so that I can store and organize my receipts and important captures.

#### Acceptance Criteria

1. WHEN a user selects one or more image files and initiates upload, THE System SHALL accept PNG, JPG, and JPEG file formats
2. WHEN a user uploads a screenshot, THE System SHALL store the image data persistently in the Database
3. WHEN a screenshot is uploaded without a filename following the standard format, THE System SHALL automatically label it using the current timestamp in "DDMMYY - HHMM - screenshot.png" format
4. WHEN a screenshot filename follows the "DDMMYY - HHMM - screenshot.png" format, THE System SHALL parse the date and time components
5. WHEN a screenshot is successfully uploaded, THE System SHALL associate it with the authenticated User Profile

### Requirement 2: Screenshot Viewing

**User Story:** As a user, I want to view my uploaded screenshots, so that I can review my receipts and captures.

#### Acceptance Criteria

1. WHEN a user navigates to the File Explorer, THE System SHALL display all screenshots belonging to that User Profile
2. WHEN displaying screenshots, THE System SHALL show thumbnail previews with filename and timestamp
3. WHEN a user clicks on a screenshot thumbnail, THE System SHALL display the full-resolution image
4. WHEN viewing a screenshot, THE System SHALL display the screenshot name, upload date, and file size
5. WHEN a user closes the full-resolution view, THE System SHALL return to the File Explorer view

### Requirement 3: Screenshot Renaming

**User Story:** As a user, I want to rename my screenshots, so that I can organize them with meaningful descriptions.

#### Acceptance Criteria

1. WHEN a user selects a screenshot and initiates rename action, THE System SHALL display an editable text field with the current name
2. WHEN a user presses the F2 key while a screenshot is selected, THE System SHALL trigger the rename action
3. WHEN a user enters a new name and confirms, THE System SHALL update the screenshot name in the Database
4. WHEN renaming a screenshot, THE System SHALL preserve the original timestamp metadata
5. WHEN a user cancels the rename action, THE System SHALL revert to the original name without changes
6. WHEN a screenshot name is updated, THE System SHALL reflect the change immediately in the File Explorer

### Requirement 4: Screenshot Deletion

**User Story:** As a user, I want to delete screenshots from the application, so that I can remove receipts I no longer need.

#### Acceptance Criteria

1. WHEN a user selects a screenshot and initiates delete action, THE System SHALL display a confirmation dialog
2. WHEN a user confirms the deletion, THE System SHALL remove the screenshot from the Database
3. WHEN a screenshot is deleted, THE System SHALL remove the associated image data and metadata
4. WHEN a screenshot with notes is deleted, THE System SHALL also remove the associated notes
5. WHEN a deletion completes successfully, THE System SHALL remove the screenshot from the File Explorer view immediately

### Requirement 5: Folder Organization

**User Story:** As a user, I want my screenshots organized into date-based folders, so that I can easily find receipts from specific days.

#### Acceptance Criteria

1. WHEN the System displays screenshots in the File Explorer, THE System SHALL group them into folders using DDMMYYYY format
2. WHEN a screenshot is uploaded with a DDMMYY prefix in the filename, THE System SHALL automatically place it in the corresponding date folder
3. WHEN a user clicks on a date folder, THE System SHALL display all screenshots belonging to that date
4. WHEN a folder contains no screenshots, THE System SHALL not display that folder in the File Explorer
5. WHEN displaying folders, THE System SHALL sort them in descending chronological order with most recent dates first

### Requirement 6: Auto-upload with Date Detection

**User Story:** As a user, I want screenshots to be automatically organized by their filename dates, so that I can batch upload files without manual sorting.

#### Acceptance Criteria

1. WHEN a screenshot filename contains a DDMMYY prefix, THE System SHALL extract the date components
2. WHEN the extracted date is valid, THE System SHALL assign the screenshot to the corresponding DDMMYYYY folder
3. WHEN the extracted date is invalid or missing, THE System SHALL assign the screenshot to a folder based on the upload timestamp
4. WHEN multiple screenshots with the same date prefix are uploaded, THE System SHALL place all of them in the same date folder
5. WHEN a screenshot follows the complete "DDMMYY - HHMM - screenshot name.png" format, THE System SHALL extract both date and time for metadata

### Requirement 7: Multi-user Profile Support

**User Story:** As a user, I want my screenshots to be private and separate from other users, so that my receipts remain confidential.

#### Acceptance Criteria

1. WHEN a user authenticates with the System, THE System SHALL create or retrieve a unique User Profile
2. WHEN a user uploads a screenshot, THE System SHALL associate it exclusively with that User Profile
3. WHEN a user views the File Explorer, THE System SHALL display only screenshots belonging to that User Profile
4. WHEN a user performs any screenshot operation, THE System SHALL verify the screenshot belongs to that User Profile
5. WHEN a user logs out, THE System SHALL clear the session and prevent access to that User Profile's screenshots

### Requirement 8: File Explorer Navigation

**User Story:** As a user, I want to navigate through my folders and screenshots easily, so that I can quickly find specific receipts.

#### Acceptance Criteria

1. WHEN a user opens the File Explorer, THE System SHALL display the root view with all date folders
2. WHEN a user clicks on a folder, THE System SHALL navigate into that folder and display its screenshots
3. WHEN a user is inside a folder, THE System SHALL provide a navigation control to return to the parent folder
4. WHEN navigating between folders, THE System SHALL update the browser URL to reflect the current location
5. WHEN a user uses browser back or forward buttons, THE System SHALL navigate to the appropriate folder view

### Requirement 9: Screenshot Metadata Management

**User Story:** As a user, I want the system to track important information about my screenshots, so that I can understand when and how they were captured.

#### Acceptance Criteria

1. WHEN a screenshot is uploaded, THE System SHALL record the upload timestamp
2. WHEN a screenshot contains EXIF data, THE System SHALL extract and store the original capture timestamp
3. WHEN displaying screenshot details, THE System SHALL show both upload time and original capture time if available
4. WHEN a screenshot is renamed, THE System SHALL record the modification timestamp
5. WHEN querying screenshots, THE System SHALL provide sorting options by upload date, capture date, or name

### Requirement 10: Batch Operations

**User Story:** As a user, I want to perform actions on multiple screenshots at once, so that I can efficiently organize large numbers of receipts.

#### Acceptance Criteria

1. WHEN a user selects multiple screenshots in the File Explorer, THE System SHALL highlight the selected items
2. WHEN multiple screenshots are selected, THE System SHALL enable batch operation controls
3. WHEN a user initiates a batch move operation, THE System SHALL move all selected screenshots to the target folder
4. WHEN a user initiates a batch delete operation, THE System SHALL remove all selected screenshots from the Database
5. WHEN a batch operation completes, THE System SHALL display a confirmation message with the number of affected screenshots

### Requirement 11: Search and Filter

**User Story:** As a user, I want to search for specific screenshots, so that I can quickly locate receipts without browsing through folders.

#### Acceptance Criteria

1. WHEN a user enters text in the search field, THE System SHALL filter screenshots by name matching the search query
2. WHEN search results are displayed, THE System SHALL show screenshots from all folders that match the query
3. WHEN a user clears the search field, THE System SHALL return to the normal folder view
4. WHEN displaying search results, THE System SHALL indicate which folder each screenshot belongs to
5. WHEN a user clicks on a search result, THE System SHALL display the full screenshot details

### Requirement 12: Data Persistence and Reliability

**User Story:** As a user, I want my screenshots to be safely stored, so that I never lose important receipts.

#### Acceptance Criteria

1. WHEN a screenshot upload completes successfully, THE System SHALL confirm the data is written to the Database
2. WHEN a database operation fails, THE System SHALL retry the operation up to three times
3. WHEN all retry attempts fail, THE System SHALL display an error message to the user
4. WHEN the System restarts, THE System SHALL maintain all previously uploaded screenshots and metadata
5. WHEN a user's session expires, THE System SHALL preserve all uploaded screenshots in the Database

### Requirement 13: Performance and Scalability

**User Story:** As a user, I want the application to respond quickly, so that I can efficiently manage large numbers of screenshots.

#### Acceptance Criteria

1. WHEN a user opens a folder containing up to 100 screenshots, THE System SHALL display thumbnails within 2 seconds
2. WHEN loading thumbnail images, THE System SHALL use optimized image sizes to reduce bandwidth
3. WHEN a user scrolls through a large folder, THE System SHALL implement lazy loading for screenshots not yet visible
4. WHEN querying the Database, THE System SHALL use indexed fields for date and user profile lookups
5. WHEN uploading multiple screenshots, THE System SHALL process them concurrently to minimize total upload time

### Requirement 14: Screenshot Notes

**User Story:** As a user, I want to add notes to my screenshots, so that I can remember important details about each receipt.

#### Acceptance Criteria

1. WHEN a user views a screenshot, THE System SHALL provide an interface to add or edit notes
2. WHEN a user enters note text for a screenshot, THE System SHALL store the notes in the Database associated with that screenshot
3. WHEN a user saves a screenshot to a local folder, THE System SHALL create a text file named "DDMMYY - HHMM - screenshot_note.txt"
4. WHEN the note text file is created, THE System SHALL write the user's notes into the file content
5. WHEN a screenshot has associated notes, THE System SHALL display a visual indicator in the File Explorer

### Requirement 15: User Interface Design

**User Story:** As a user, I want an attractive and modern interface, so that I enjoy using the application daily.

#### Acceptance Criteria

1. WHEN the System displays any interface, THE System SHALL render a gradient background design
2. WHEN displaying interface elements, THE System SHALL apply modern styling with consistent spacing and typography
3. WHEN the System is accessed from any device, THE System SHALL provide a responsive layout for mobile and desktop screen sizes
4. WHEN displaying interface components, THE System SHALL use a consistent color scheme throughout the application
5. WHEN a user interacts with buttons or controls, THE System SHALL provide visual feedback including hover states

### Requirement 16: Error Handling

**User Story:** As a user, I want the application to handle errors gracefully, so that I understand what went wrong and can recover easily.

#### Acceptance Criteria

1. WHEN a Database error occurs, THE System SHALL display a user-friendly error message without exposing technical details
2. WHEN a network error occurs during an operation, THE System SHALL show appropriate error feedback to the user
3. WHEN a form submission fails, THE System SHALL preserve the user's input data for resubmission
4. WHEN a user submits a form, THE System SHALL validate all form inputs before processing
5. WHEN validation errors occur, THE System SHALL highlight specific fields with error messages indicating the issue
