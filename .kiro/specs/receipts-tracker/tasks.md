# Implementation Plan

- [x] 1. Set up database schema and core types


  - Create database schema with users and screenshots tables
  - Add indexes for userId, folderDate, and uploadDate
  - Define TypeScript types for Screenshot, Folder, and input/output interfaces
  - _Requirements: 1.2, 1.5, 2.1, 7.2, 7.3, 9.1, 14.2_

- [ ]* 1.1 Write property test for upload persistence
  - **Property 2: Upload persistence**
  - **Validates: Requirements 1.2**

- [ ]* 1.2 Write property test for user isolation
  - **Property 5: User isolation**
  - **Validates: Requirements 1.5, 2.1, 7.2, 7.3**



- [x] 2. Implement filename parsing and generation utilities





  - Create parseFilename function to extract DDMMYY, HHMM, and name components
  - Create generateFilename function to create standardized filenames with current timestamp
  - Create extractFolderDate function to determine folder assignment
  - Create formatFolderDate function for display formatting
  - _Requirements: 1.3, 1.4, 5.2, 6.1, 6.5_

- [ ]* 2.1 Write property test for filename parsing accuracy
  - **Property 4: Filename parsing accuracy**
  - **Validates: Requirements 1.4**

- [ ]* 2.2 Write property test for automatic filename generation
  - **Property 3: Automatic filename generation**
  - **Validates: Requirements 1.3**

- [ ]* 2.3 Write property test for date extraction
  - **Property 19: Date extraction from filename**
  - **Validates: Requirements 6.1**

- [ ]* 2.4 Write property test for complete datetime extraction
  - **Property 21: Complete datetime extraction**


  - **Validates: Requirements 6.5**

- [x] 3. Implement image validation and processing utilities





  - Create validateImageFile function to check file type and size
  - Create generateThumbnail function for optimized thumbnails
  - Create extractExifData function for metadata extraction (optional)
  - _Requirements: 1.1, 13.2_


- [ ]* 3.1 Write property test for file type validation
  - **Property 1: File type validation**
  - **Validates: Requirements 1.1**

- [x] 4. Create screenshot upload server function



  - Implement uploadScreenshot server function with validation
  - Handle file data encoding and storage
  - Extract or generate filename with proper format
  - Store screenshot record in database with metadata
  - Return created screenshot object
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1_

- [ ]* 4.1 Write property test for upload timestamp recording
  - **Property 25: Upload timestamp recording**
  - **Validates: Requirements 9.1**

- [x] 5. Create screenshot query server functions



  - Implement getScreenshots server function with user filtering
  - Support optional folderDate parameter for folder-specific queries
  - Support optional searchQuery parameter for filtering by name
  - Implement sorting by upload date, capture date, or name
  - _Requirements: 2.1, 5.3, 8.2, 9.5, 11.1, 11.2_

- [ ]* 5.1 Write property test for folder content filtering
  - **Property 16: Folder content filtering**
  - **Validates: Requirements 5.3, 8.2**

- [ ]* 5.2 Write property test for search filtering accuracy
  - **Property 32: Search filtering accuracy**
  - **Validates: Requirements 11.1, 11.2**

- [ ]* 5.3 Write property test for cross-folder search
  - **Property 33: Cross-folder search**
  - **Validates: Requirements 11.3**

- [ ]* 5.4 Write property test for multi-criteria sorting
  - **Property 28: Multi-criteria sorting**
  - **Validates: Requirements 9.5**



- [x] 6. Create screenshot modification server functions



  - Implement renameScreenshot server function with ownership validation
  - Implement updateScreenshotNotes server function
  - Implement deleteScreenshot server function with cascade deletion
  - Ensure all functions verify user ownership before operations
  - _Requirements: 3.3, 3.4, 4.2, 4.3, 4.4, 7.4, 9.4, 14.2_

- [ ]* 6.1 Write property test for rename persistence
  - **Property 8: Rename persistence**
  - **Validates: Requirements 3.3**

- [ ]* 6.2 Write property test for timestamp preservation on rename
  - **Property 9: Timestamp preservation on rename**
  - **Validates: Requirements 3.4**

- [ ]* 6.3 Write property test for modification timestamp on rename
  - **Property 27: Modification timestamp on rename**
  - **Validates: Requirements 9.4**

- [ ]* 6.4 Write property test for complete deletion
  - **Property 12: Complete deletion**
  - **Validates: Requirements 4.2, 4.3, 4.4**

- [ ]* 6.5 Write property test for authorization enforcement
  - **Property 22: Authorization enforcement**
  - **Validates: Requirements 7.4**

- [ ]* 6.6 Write property test for notes persistence
  - **Property 35: Notes persistence**



  - **Validates: Requirements 14.2**

- [x] 7. Create batch operation server functions


  - Implement batchDeleteScreenshots server function
  - Implement batchMoveScreenshots server function (if needed)
  - Return count of affected screenshots
  - _Requirements: 10.3, 10.4, 10.5_

- [ ]* 7.1 Write property test for batch delete completeness
  - **Property 30: Batch delete completeness**
  - **Validates: Requirements 10.4**


- [ ]* 7.2 Write property test for batch operation count accuracy
  - **Property 31: Batch operation count accuracy**
  - **Validates: Requirements 10.5**

- [x] 8. Implement download with notes functionality



  - Create downloadScreenshotWithNotes server function
  - Generate notes.txt file with proper naming format
  - Bundle image and notes file for download
  - _Requirements: 14.3, 14.4_

- [ ]* 8.1 Write property test for notes export round-trip
  - **Property 36: Notes export round-trip**
  - **Validates: Requirements 14.3, 14.4**

- [x] 9. Create ScreenshotCard component


  - Display thumbnail image with filename and timestamp
  - Show notes indicator when notes exist
  - Handle selection state and visual feedback
  - Support click, double-click for viewing
  - Implement inline rename mode with F2 keyboard shortcut
  - _Requirements: 2.2, 2.4, 3.1, 3.2, 14.5_

- [ ]* 9.1 Write property test for thumbnail and metadata display
  - **Property 6: Thumbnail and metadata display**
  - **Validates: Requirements 2.2**

- [ ]* 9.2 Write property test for screenshot details completeness
  - **Property 7: Screenshot details completeness**
  - **Validates: Requirements 2.4**

- [ ]* 9.3 Write property test for notes indicator display
  - **Property 37: Notes indicator display**
  - **Validates: Requirements 14.5**

- [x] 10. Create FileExplorer component


  - Display date folders in descending chronological order
  - Group screenshots by folderDate
  - Filter out empty folders
  - Handle folder navigation and URL updates
  - Support browser back/forward navigation
  - Implement multi-select functionality
  - _Requirements: 5.1, 5.4, 5.5, 8.1, 8.3, 8.4, 8.5, 10.1_

- [ ]* 10.1 Write property test for date-based folder grouping
  - **Property 14: Date-based folder grouping**
  - **Validates: Requirements 5.1**

- [ ]* 10.2 Write property test for empty folder exclusion
  - **Property 17: Empty folder exclusion**
  - **Validates: Requirements 5.4**

- [ ]* 10.3 Write property test for folder chronological sorting
  - **Property 18: Folder chronological sorting**
  - **Validates: Requirements 5.5**

- [ ]* 10.4 Write property test for URL synchronization
  - **Property 23: URL synchronization with navigation**
  - **Validates: Requirements 8.4**

- [ ]* 10.5 Write property test for browser history integration
  - **Property 24: Browser history integration**
  - **Validates: Requirements 8.5**

- [x] 11. Create ScreenshotUpload component


  - Implement file picker and drag-and-drop interface
  - Show upload progress for multiple files
  - Handle concurrent uploads
  - Display validation errors for invalid files
  - Auto-generate filenames for uploads without proper format
  - _Requirements: 1.1, 1.3, 5.2, 6.2, 6.4_

- [ ]* 11.1 Write property test for automatic folder assignment
  - **Property 15: Automatic folder assignment**



  - **Validates: Requirements 5.2, 6.2**

- [ ]* 11.2 Write property test for consistent folder assignment
  - **Property 20: Consistent folder assignment for same date**
  - **Validates: Requirements 6.4**

- [x] 12. Create ScreenshotViewer component


  - Display full-resolution image
  - Show and edit notes with save functionality


  - Provide download button for image + notes
  - Navigate to previous/next screenshot
  - Close on ESC key or close button
  - _Requirements: 2.3, 2.5, 14.1, 14.3, 14.4_

- [ ]* 12.1 Write property test for metadata display completeness
  - **Property 26: Metadata display completeness**
  - **Validates: Requirements 9.3**

- [x] 13. Create SearchBar component




  - Implement debounced search input
  - Display search results with folder indication
  - Show results count



  - Provide clear search functionality
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 13.1 Write property test for search result folder indication
  - **Property 34: Search result folder indication**
  - **Validates: Requirements 11.5**

- [x] 14. Create ConfirmDialog component


  - Reusable confirmation dialog for delete operations
  - Support custom title, message, and button text
  - Handle confirm and cancel actions
  - _Requirements: 4.1_


- [ ] 15. Implement error handling and validation

  - Create ErrorBoundary component for React errors
  - Add validation error display for forms
  - Implement toast notifications for operations
  - Add retry logic for failed operations
  - Preserve form data on submission failures
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ]* 15.1 Write property test for form data preservation on failure
  - **Property 38: Form data preservation on failure**
  - **Validates: Requirements 16.3**

- [ ]* 15.2 Write property test for input validation before processing
  - **Property 39: Input validation before processing**
  - **Validates: Requirements 16.4**

- [ ]* 15.3 Write property test for field-specific error display
  - **Property 40: Field-specific error display**
  - **Validates: Requirements 16.5**

- [x] 16. Create main route and integrate components


  - Create /screenshots route with FileExplorer
  - Integrate ScreenshotUpload component
  - Wire up all server functions
  - Implement keyboard shortcuts (F2 for rename, Delete for delete)
  - Add loading states and error handling
  - _Requirements: 3.2, 3.5, 3.6, 4.5, 10.2_

- [ ]* 16.1 Write property test for rename cancellation idempotence
  - **Property 10: Rename cancellation idempotence**
  - **Validates: Requirements 3.5**

- [ ]* 16.2 Write property test for UI consistency after rename
  - **Property 11: UI consistency after rename**



  - **Validates: Requirements 3.6**

- [ ]* 16.3 Write property test for UI consistency after deletion
  - **Property 13: UI consistency after deletion**
  - **Validates: Requirements 4.5**

- [x] 17. Apply UI design and styling



  - Implement gradient background design
  - Apply modern styling with Tailwind CSS
  - Ensure responsive layout for mobile and desktop
  - Add consistent color scheme throughout
  - Implement hover states and visual feedback for interactions
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 18. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Create demo data and test user flow


  - Create seed script with sample screenshots
  - Test complete user workflows end-to-end
  - Verify all features work as expected
  - _Requirements: All_

- [x] 19.1 Implement auto-open viewer after upload



  - Add onViewScreenshot callback prop to ScreenshotUpload component
  - Call callback with first uploaded screenshot after successful upload
  - Update screenshots route to handle viewer state management
  - Open ScreenshotViewer automatically when callback is triggered
  - Test with single and multiple screenshot uploads
  - _Requirements: 1.6, 1.7_

- [ ]* 19.1.1 Write property test for auto-open viewer
  - **Property 2a: Auto-open viewer after upload**
  - **Validates: Requirements 1.6**

- [x] 19.2 Implement keyboard shortcut for saving notes



  - Add keyboard event listener in ScreenshotViewer for Ctrl+S (Cmd+S on Mac)
  - Prevent default browser save dialog behavior
  - Trigger notes save operation when shortcut is pressed
  - Display visual feedback when notes are saved
  - Add persistent hint showing the Ctrl+S shortcut near notes field
  - Test on both Windows/Linux and Mac platforms
  - _Requirements: 14.3, 14.4_

- [ ]* 19.2.1 Write property test for notes save keyboard shortcut
  - **Property 44: Notes save keyboard shortcut**
  - **Validates: Requirements 14.3**

- [ ]* 19.2.2 Write property test for keyboard shortcut hint visibility
  - **Property 45: Keyboard shortcut hint visibility**
  - **Validates: Requirements 14.4**

- [x] 19.3 Fix download cancellation behavior




  - Update download utility to catch AbortError when user cancels file picker
  - Abort download operation completely when user cancels
  - Ensure no files are written to default downloads folder on cancellation
  - Return boolean from download function to indicate success/cancellation
  - Update ScreenshotViewer to handle cancellation gracefully
  - Test cancellation flow thoroughly
  - _Requirements: 16.6, 16.7_

- [ ]* 19.3.1 Write property test for download cancellation
  - **Property 43: Download cancellation**
  - **Validates: Requirements 16.6, 16.7**

- [x] 20. Extend search to include notes content






  - Update getScreenshots server function to search both filename and notes fields
  - Modify SQL query to use OR condition for filename ILIKE and notes ILIKE
  - Test search with various queries matching filenames and notes
  - Verify search results include screenshots matching either field
  - _Requirements: 11.1, 11.2, 11.3_

- [ ]* 20.1 Write property test for notes search accuracy
  - **Property 32: Search filtering accuracy (notes)**
  - **Validates: Requirements 11.2**

- [x] 21. Implement persistent download directory



  - Create utility functions for File System Access API
  - Implement directory picker with showDirectoryPicker()
  - Store directory handle in IndexedDB for persistence
  - Add permission request logic for stored directory handles
  - Implement fallback to standard download for unsupported browsers
  - Update ScreenshotViewer download functionality to use new system
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ]* 21.1 Write property test for download directory persistence
  - **Property 41: Download directory persistence**
  - **Validates: Requirements 16.2, 16.3**

- [ ]* 21.2 Write property test for download directory update
  - **Property 42: Download directory update**
  - **Validates: Requirements 16.4**

- [x] 22. Update error handling for new features




  - Add error handling for File System Access API failures
  - Display user-friendly messages when directory access is denied
  - Handle browser compatibility issues gracefully
  - Test error scenarios for search with notes
  - _Requirements: 17.1, 17.2_

- [x] 23. Final checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.
