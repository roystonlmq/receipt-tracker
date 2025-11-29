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

✅ **Phase 5: Clickable Hashtags** - COMPLETE
- ScreenshotCard displays clickable hashtags using `highlightHashtagsClickable`
- ScreenshotViewer displays clickable hashtags in read-only mode using MarkdownNotes
- Clicking hashtags triggers search and closes viewer

✅ **Phase 6: AI Note Generation** - COMPLETE
- AI configuration utility implemented with support for OpenAI, Anthropic, and Gemini
- AI server function `generateNotesWithAI` implemented
- AI generation integrated into ScreenshotViewer with "Generate with AI" button
- Error handling and user feedback implemented
- Token usage logging included

## Remaining Tasks

### Task 1: Install Property-Based Testing Library
- [ ] 1.1 Install fast-check
  - Run `pnpm add -D fast-check`
  - Verify installation in package.json
  - _Requirements: Testing Strategy_

### Task 2: Write Property-Based Tests
- [ ] 2.1 Create test generators
  - Create `src/test/generators.ts`
  - Implement arbitrary generators for tags, hashtags, and text
  - _Requirements: Testing Strategy_

- [ ]* 2.2 Write property test for hashtag extraction accuracy
  - **Property 1: Hashtag extraction accuracy**
  - Test that extracted hashtags match all valid hashtags in text
  - Run 100+ iterations
  - _Requirements: 3.1_

- [ ]* 2.3 Write property test for tag normalization consistency
  - **Property 2: Tag normalization consistency**
  - Test that normalizing multiple times produces same result
  - Run 100+ iterations
  - _Requirements: 3.2_

- [ ]* 2.4 Write property test for tag storage uniqueness
  - **Property 3: Tag storage uniqueness**
  - Test that user+tag combination has at most one record
  - Run 100+ iterations
  - _Requirements: 3.3_

- [ ]* 2.5 Write property test for tag timestamp update
  - **Property 4: Tag timestamp update**
  - Test that reusing a tag updates lastUsed to more recent time
  - Run 100+ iterations
  - _Requirements: 3.4_

- [ ]* 2.6 Write property test for tag persistence after deletion
  - **Property 5: Tag persistence after deletion**
  - Test that tags remain after screenshot deletion
  - Run 100+ iterations
  - _Requirements: 3.5_

- [ ]* 2.7 Write property test for tag isolation by user
  - **Property 6: Tag isolation by user**
  - Test that tag suggestions only include user's own tags
  - Run 100+ iterations
  - _Requirements: 3.6_

- [ ]* 2.8 Write property test for hashtag search accuracy
  - **Property 7: Hashtag search accuracy**
  - Test that search results contain exact hashtag
  - Run 100+ iterations
  - _Requirements: 4.1, 4.2_

- [ ]* 2.9 Write property test for multi-tag search union
  - **Property 8: Multi-tag search union**
  - Test that results include screenshots matching any hashtag
  - Run 100+ iterations
  - _Requirements: 4.3_

- [ ]* 2.10 Write property test for tag suggestion filtering
  - **Property 9: Tag suggestion filtering**
  - Test that suggestions start with query string
  - Run 100+ iterations
  - _Requirements: 2.2_

- [ ]* 2.11 Write property test for tag suggestion ordering
  - **Property 10: Tag suggestion ordering**
  - Test that suggestions are ordered by lastUsed DESC
  - Run 100+ iterations
  - _Requirements: 2.3_

- [ ]* 2.12 Write property test for hashtag highlighting consistency
  - **Property 20: Hashtag highlighting consistency**
  - Test that hashtags are styled consistently across views
  - Run 100+ iterations
  - _Requirements: 1.2, 1.3_

### Task 3: Create Tag Migration Script
- [ ] 3.1 Create migration script
  - Create `scripts/migrate-tags.ts`
  - Query all screenshots with notes
  - Extract and store tags with proper timestamps
  - Track statistics and log progress
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 3.2 Test migration script
  - Run on development database
  - Verify tags extracted correctly
  - Check statistics output
  - _Requirements: 13.5_

### Task 4: Add Tag Management Features (Optional Enhancement)
- [ ]* 4.1 Add tag list view to main UI
  - Create route or modal for viewing all tags
  - Integrate TagList component
  - Allow filtering screenshots by clicking tags
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

### Task 5: Documentation
- [ ]* 5.1 Update README with hashtag usage
  - Add section explaining hashtag feature
  - Include examples and screenshots
  - Document keyboard shortcuts
  - _Requirements: User documentation_

- [ ]* 5.2 Add AI generation documentation
  - Document how to configure AI providers
  - Add examples of environment variables
  - Explain token usage and costs
  - Document supported AI models
  - _Requirements: User documentation_

- [ ]* 5.3 Add technical documentation
  - Document tag extraction algorithm
  - Add API documentation for server functions
  - Document AI integration architecture
  - Include troubleshooting guide
  - _Requirements: Technical documentation_

## Notes

- Core hashtag tagging functionality is **COMPLETE** and working in production
- AI note generation is **COMPLETE** with support for OpenAI, Anthropic, and Gemini
- Clickable hashtags are **COMPLETE** in both ScreenshotCard and ScreenshotViewer
- Property-based tests are marked optional (*) but highly recommended for comprehensive testing
- Migration script needed to extract tags from existing notes in the database
- AI features require API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY) and will incur costs per generation
- The design document mentions OCR integration, but current implementation works directly with AI vision models without separate OCR step
