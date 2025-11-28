# Implementation Tasks: Enhanced Notes with Hashtag Tagging

## Completed Work

✅ **Phase 1: Database Schema and Utilities** - COMPLETE
- Tags table migration created and applied
- All tag utility functions implemented (`extractHashtags`, `normalizeTag`, `formatTag`, `isValidHashtag`)
- Hashtag highlighting utility implemented with React components
- Unit tests written for tag utilities and highlighting

✅ **Phase 2: Tag Storage and Retrieval** - COMPLETE
- `extractAndStoreTags` server function implemented with PostgreSQL upsert logic
- `getTagSuggestions` server function with filtering and sorting
- `getUserTags` server function with statistics and sorting options
- `searchByTags` server function for tag-based search
- Screenshot notes save updated to extract tags automatically

✅ **Phase 3: Tag UI Components** - COMPLETE
- `EnhancedNotesInput` component with real-time highlighting and autocomplete
- `TagSuggestionsDropdown` component with keyboard navigation
- `TagHintBanner` component with localStorage persistence
- `TagList` component with sorting and statistics
- `ScreenshotViewer` updated to use EnhancedNotesInput

✅ **Phase 4: Tag Search** - COMPLETE
- Tag search integrated into FileExplorer component
- SearchBar detects hashtags and triggers tag search
- Search results display with tag filtering

## Remaining Tasks

### Task 1: Make Hashtags Clickable in Notes Display
- [ ] 1.1 Update ScreenshotCard to make hashtags clickable
  - Wrap hashtags in clickable elements
  - Trigger search when hashtag is clicked
  - Pass search handler from FileExplorer
  - _Requirements: 4.5_

- [ ] 1.2 Update ScreenshotViewer notes display
  - Make hashtags clickable in read-only view
  - Trigger search and close viewer when clicked
  - _Requirements: 4.5_

### Task 2: Install Property-Based Testing Library
- [ ] 2.1 Install fast-check
  - Run `pnpm add -D fast-check`
  - Verify installation in package.json
  - _Requirements: Testing Strategy_

### Task 3: Write Property-Based Tests
- [ ] 3.1 Create test generators
  - Create `src/test/generators.ts`
  - Implement arbitrary generators for tags, hashtags, and text
  - _Requirements: Testing Strategy_

- [ ]* 3.2 Write property test for hashtag extraction accuracy
  - **Property 1: Hashtag extraction accuracy**
  - Test that extracted hashtags match all valid hashtags in text
  - Run 100+ iterations
  - _Requirements: 3.1_

- [ ]* 3.3 Write property test for tag normalization consistency
  - **Property 2: Tag normalization consistency**
  - Test that normalizing multiple times produces same result
  - Run 100+ iterations
  - _Requirements: 3.2_

- [ ]* 3.4 Write property test for tag storage uniqueness
  - **Property 3: Tag storage uniqueness**
  - Test that user+tag combination has at most one record
  - Run 100+ iterations
  - _Requirements: 3.3_

- [ ]* 3.5 Write property test for tag timestamp update
  - **Property 4: Tag timestamp update**
  - Test that reusing a tag updates lastUsed to more recent time
  - Run 100+ iterations
  - _Requirements: 3.4_

- [ ]* 3.6 Write property test for tag persistence after deletion
  - **Property 5: Tag persistence after deletion**
  - Test that tags remain after screenshot deletion
  - Run 100+ iterations
  - _Requirements: 3.5_

- [ ]* 3.7 Write property test for tag isolation by user
  - **Property 6: Tag isolation by user**
  - Test that tag suggestions only include user's own tags
  - Run 100+ iterations
  - _Requirements: 3.6_

- [ ]* 3.8 Write property test for hashtag search accuracy
  - **Property 7: Hashtag search accuracy**
  - Test that search results contain exact hashtag
  - Run 100+ iterations
  - _Requirements: 4.1, 4.2_

- [ ]* 3.9 Write property test for multi-tag search union
  - **Property 8: Multi-tag search union**
  - Test that results include screenshots matching any hashtag
  - Run 100+ iterations
  - _Requirements: 4.3_

- [ ]* 3.10 Write property test for tag suggestion filtering
  - **Property 9: Tag suggestion filtering**
  - Test that suggestions start with query string
  - Run 100+ iterations
  - _Requirements: 2.2_

- [ ]* 3.11 Write property test for tag suggestion ordering
  - **Property 10: Tag suggestion ordering**
  - Test that suggestions are ordered by lastUsed DESC
  - Run 100+ iterations
  - _Requirements: 2.3_

- [ ]* 3.12 Write property test for hashtag highlighting consistency
  - **Property 20: Hashtag highlighting consistency**
  - Test that hashtags are styled consistently across views
  - Run 100+ iterations
  - _Requirements: 1.2, 1.3_

### Task 4: Create Tag Migration Script
- [ ] 4.1 Create migration script
  - Create `scripts/migrate-tags.ts`
  - Query all screenshots with notes
  - Extract and store tags with proper timestamps
  - Track statistics and log progress
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 4.2 Test migration script
  - Run on development database
  - Verify tags extracted correctly
  - Check statistics output
  - _Requirements: 13.5_

### Task 5: Add Tag Management Features (Optional Enhancement)
- [ ]* 5.1 Add tag list view to main UI
  - Create route or modal for viewing all tags
  - Integrate TagList component
  - Allow filtering screenshots by clicking tags
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

### Task 6: AI Note Generation - Configuration and Setup
- [ ] 6.1 Create AI configuration utility
  - Create `src/utils/ai.ts`
  - Implement `getAIConfig()` to read environment variables
  - Support OpenAI and Claude providers
  - Validate API keys and configuration
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 6.2 Add AI environment variables
  - Add AI_PROVIDER to .env.local (openai or claude)
  - Add AI_API_KEY to .env.local
  - Add AI_MODEL to .env.local (optional, with defaults)
  - Add AI_MAX_TOKENS to .env.local (optional, default 500)
  - Document in .env.example
  - _Requirements: 9.1_

### Task 7: AI Note Generation - OCR Integration
- [ ] 7.1 Implement OCR utility
  - Create `src/utils/ocr.ts`
  - Implement `extractTextFromImage()` function
  - Choose OCR library (Tesseract.js or cloud service)
  - Handle errors gracefully
  - Return empty string if no text found
  - _Requirements: 7.1, 7.2_

- [ ]* 7.2 Write unit tests for OCR
  - Test with images containing text
  - Test with images without text
  - Test error handling
  - _Requirements: 7.1_

### Task 8: AI Note Generation - AI Service Integration
- [ ] 8.1 Implement OpenAI integration
  - Add `callOpenAI()` function in `src/utils/ai.ts`
  - Use GPT-4 Vision API
  - Send image data and OCR text
  - Parse response and extract token count
  - Handle API errors
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 8.2 Implement Claude integration
  - Add `callClaude()` function in `src/utils/ai.ts`
  - Use Claude 3 Vision API
  - Send image data and OCR text
  - Parse response and extract token count
  - Handle API errors
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 8.3 Implement AI prompt builder
  - Create `buildAIPrompt()` function
  - Include OCR text in prompt
  - Include user's existing tags for context
  - Instruct AI to suggest relevant hashtags
  - Format instructions for concise output
  - _Requirements: 7.2, 7.3, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8.4 Implement main AI generation function
  - Create `generateNotesFromImage()` function
  - Orchestrate OCR and AI calls
  - Handle provider selection
  - Return notes and token usage
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

### Task 9: AI Note Generation - Server Function
- [ ] 9.1 Create generateNotesWithAI server function
  - Create server function in `src/server/ai.ts`
  - Validate user authentication and ownership
  - Retrieve screenshot from database
  - Call OCR service
  - Get user's existing tags for context
  - Call AI service with image and context
  - Extract and store tags from generated notes
  - Log token usage
  - Return generated notes and metadata
  - _Requirements: 6.2, 7.1, 7.2, 7.3, 7.4, 8.2_

- [ ] 9.2 Add AI generation tracking table (optional)
  - Create `aiGenerations` table in schema
  - Track userId, screenshotId, model, tokensUsed, success, errorMessage
  - Add indexes for querying
  - _Requirements: 8.2_

- [ ] 9.3 Implement error handling
  - Handle network errors with user-friendly messages
  - Handle invalid API key errors
  - Handle rate limiting errors
  - Handle unsupported image format errors
  - Preserve existing notes on error
  - _Requirements: 7.5, 7.6, 14.1, 14.2, 14.3, 14.4, 14.5_

### Task 10: AI Note Generation - UI Components
- [ ] 10.1 Create AIGenerateButton component
  - Create `src/components/AIGenerateButton.tsx`
  - Display "Generate with AI" button
  - Show loading spinner during generation
  - Disable button during generation
  - Handle click to trigger generation
  - _Requirements: 6.1, 6.3_

- [ ] 10.2 Implement overwrite confirmation
  - Check if notes already exist
  - Show confirmation dialog before overwriting
  - Allow user to cancel
  - Proceed with generation on confirm
  - _Requirements: 6.5, 6.6, 6.7_

- [ ] 10.3 Implement error display
  - Show error messages in user-friendly format
  - Display "Retry" button on error
  - Don't expose technical details
  - _Requirements: 7.5, 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 10.4 Add AI button to ScreenshotViewer
  - Integrate AIGenerateButton into ScreenshotViewer
  - Position near notes input
  - Only show if AI is configured
  - Handle generated notes by populating input
  - _Requirements: 6.1, 9.3_

- [ ]* 10.5 Write component tests for AI button
  - Test button rendering
  - Test loading state
  - Test error handling
  - Test overwrite confirmation
  - _Requirements: Testing_

### Task 11: AI Note Generation - Property-Based Tests
- [ ]* 11.1 Write property test for AI opt-in only
  - **Property 11: AI generation opt-in only**
  - Test that AI never runs automatically
  - Run 100+ iterations
  - _Requirements: 6.2, 8.5_

- [ ]* 11.2 Write property test for AI overwrite confirmation
  - **Property 12: AI overwrite confirmation**
  - Test that confirmation is shown when notes exist
  - Run 100+ iterations
  - _Requirements: 6.5, 6.7_

- [ ]* 11.3 Write property test for AI error preservation
  - **Property 13: AI error preservation**
  - Test that existing notes remain on error
  - Run 100+ iterations
  - _Requirements: 7.6_

- [ ]* 11.4 Write property test for token usage logging
  - **Property 14: Token usage logging**
  - Test that token usage is recorded
  - Run 100+ iterations
  - _Requirements: 8.2_

- [ ]* 11.5 Write property test for AI configuration validation
  - **Property 15: AI configuration validation**
  - Test that AI features disabled without config
  - Run 100+ iterations
  - _Requirements: 9.2, 9.3_

### Task 12: AI Note Generation - Integration Testing
- [ ]* 12.1 Test complete AI workflow
  - Test screenshot → OCR → AI → notes → tags
  - Test with OpenAI provider
  - Test with Claude provider
  - Test error scenarios
  - _Requirements: 6.1-6.7, 7.1-7.6_

- [ ]* 12.2 Test AI with existing tags
  - Verify user's tags are included in prompt
  - Verify AI reuses relevant existing tags
  - _Requirements: 10.3_

### Task 13: Documentation
- [ ]* 13.1 Update README with hashtag usage
  - Add section explaining hashtag feature
  - Include examples and screenshots
  - Document keyboard shortcuts
  - _Requirements: User documentation_

- [ ]* 13.2 Add AI generation documentation
  - Document how to configure AI providers
  - Add examples of environment variables
  - Explain token usage and costs
  - Document supported AI models
  - _Requirements: User documentation_

- [ ]* 13.3 Add technical documentation
  - Document tag extraction algorithm
  - Add API documentation for server functions
  - Document AI integration architecture
  - Include troubleshooting guide
  - _Requirements: Technical documentation_

## Notes

- Core hashtag tagging functionality is complete and working
- AI generation is a separate feature that can be implemented independently
- Property-based tests are marked optional (*) but highly recommended
- Migration script should be run during low-traffic period
- AI features require API keys and will incur costs per generation
