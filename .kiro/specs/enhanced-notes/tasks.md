# Implementation Tasks: Enhanced Notes with Hashtag Tagging

## Overview

This feature adds hashtag-based tagging and AI-powered note generation to the Receipts Tracker application. Users can organize screenshots using hashtags (e.g., #project-alpha, #receipt) with autocomplete suggestions, and optionally generate notes automatically using AI vision models.

## Completed Work

✅ **Phase 1: Database Schema and Utilities** - COMPLETE
- Tags table created in schema with proper indexes and constraints
- All tag utility functions implemented (`extractHashtags`, `normalizeTag`, `formatTag`, `isValidHashtag`)
- Hashtag highlighting utilities implemented (`highlightHashtags`, `highlightHashtagsClickable`)
- Comprehensive unit tests written for tag utilities and highlighting

✅ **Phase 2: Tag Storage and Retrieval** - COMPLETE
- `extractAndStoreTags` server function with PostgreSQL upsert logic
- `getTagSuggestions` server function with filtering and sorting
- `getUserTags` server function with statistics and sorting options
- `searchByTags` server function for tag-based search
- All server functions include proper error handling

✅ **Phase 3: Tag UI Components** - COMPLETE
- `EnhancedNotesInput` component with real-time highlighting and autocomplete
- `TagSuggestionsDropdown` component with keyboard navigation (Tab, Enter, Escape, Arrow keys)
- `TagHintBanner` component with localStorage persistence
- `TagList` component with sorting (usage, recent, alphabetical) and statistics
- All components integrated into ScreenshotViewer

✅ **Phase 4: Tag Search** - COMPLETE
- Tag search integrated into FileExplorer component
- SearchBar detects hashtags and triggers tag-based search
- Search results display with tag filtering
- Multi-tag search support (OR logic)

✅ **Phase 5: Clickable Hashtags** - COMPLETE
- ScreenshotCard displays clickable hashtags using `highlightHashtagsClickable`
- MarkdownNotes component displays clickable hashtags in read-only mode
- Clicking hashtags triggers search and closes viewer
- Hashtags styled consistently across all views

✅ **Phase 6: AI Note Generation** - COMPLETE
- AI configuration utility with support for OpenAI, Anthropic, and Gemini
- `generateNotesWithAI` server function implemented
- AI generation integrated into ScreenshotViewer with "Generate with AI" button
- Confirmation dialog before overwriting existing notes
- Error handling with user-friendly messages
- Token usage logging for monitoring
- AI prompt includes user's existing tags for context

## Remaining Tasks

### Task 1: Property-Based Testing Setup (Optional)

Property-based tests provide comprehensive validation across many inputs. These tasks are optional but recommended for production-grade quality assurance.

- [ ]* 1.1 Install fast-check library
  - Run `pnpm add -D fast-check`
  - Verify installation in package.json
  - _Requirements: Testing Strategy_

- [ ]* 1.2 Create test generators
  - Create `src/test/generators.ts`
  - Implement arbitrary generators for tags, hashtags, and text with various edge cases
  - Include generators for whitespace, special characters, and boundary conditions
  - _Requirements: Testing Strategy_

### Task 2: Property-Based Tests for Tag Utilities (Optional)

- [ ]* 2.1 Write property test for hashtag extraction accuracy
  - **Property 1: Hashtag extraction accuracy**
  - Test that extracted hashtags match all valid hashtags in text
  - Run 100+ iterations with random text containing hashtags
  - _Validates: Requirements 3.1_

- [ ]* 2.2 Write property test for tag normalization consistency
  - **Property 2: Tag normalization consistency**
  - Test that normalizing multiple times produces same result (idempotence)
  - Run 100+ iterations with various tag formats
  - _Validates: Requirements 3.2_

- [ ]* 2.3 Write property test for hashtag highlighting consistency
  - **Property 20: Hashtag highlighting consistency**
  - Test that hashtags are styled consistently across views
  - Run 100+ iterations with various text patterns
  - _Validates: Requirements 1.2, 1.3_

### Task 3: Property-Based Tests for Tag Storage (Optional)

- [ ]* 3.1 Write property test for tag storage uniqueness
  - **Property 3: Tag storage uniqueness**
  - Test that user+tag combination has at most one record in database
  - Run 100+ iterations with random user/tag combinations
  - _Validates: Requirements 3.3_

- [ ]* 3.2 Write property test for tag timestamp update
  - **Property 4: Tag timestamp update**
  - Test that reusing a tag updates lastUsed to more recent time
  - Run 100+ iterations with sequential tag usage
  - _Validates: Requirements 3.4_

- [ ]* 3.3 Write property test for tag persistence after deletion
  - **Property 5: Tag persistence after deletion**
  - Test that tags remain in index after screenshot deletion
  - Run 100+ iterations with create/delete cycles
  - _Validates: Requirements 3.5_

- [ ]* 3.4 Write property test for tag isolation by user
  - **Property 6: Tag isolation by user**
  - Test that tag suggestions only include user's own tags
  - Run 100+ iterations with multiple users
  - _Validates: Requirements 3.6_

### Task 4: Property-Based Tests for Tag Search (Optional)

- [ ]* 4.1 Write property test for hashtag search accuracy
  - **Property 7: Hashtag search accuracy**
  - Test that search results contain exact hashtag
  - Run 100+ iterations with random hashtags and screenshots
  - _Validates: Requirements 4.1, 4.2_

- [ ]* 4.2 Write property test for multi-tag search union
  - **Property 8: Multi-tag search union**
  - Test that results include screenshots matching any hashtag (OR logic)
  - Run 100+ iterations with multiple hashtags
  - _Validates: Requirements 4.3_

- [ ]* 4.3 Write property test for tag suggestion filtering
  - **Property 9: Tag suggestion filtering**
  - Test that suggestions start with query string (case-insensitive)
  - Run 100+ iterations with partial queries
  - _Validates: Requirements 2.2_

- [ ]* 4.4 Write property test for tag suggestion ordering
  - **Property 10: Tag suggestion ordering**
  - Test that suggestions are ordered by lastUsed DESC
  - Run 100+ iterations with various usage patterns
  - _Validates: Requirements 2.3_

### Task 5: Tag Migration Script

This script extracts hashtags from existing screenshot notes and populates the tags table.

- [ ] 5.1 Create migration script
  - Create `scripts/migrate-tags.ts`
  - Query all screenshots with notes from database
  - Extract hashtags using `extractHashtags` utility
  - Store tags with proper timestamps (use screenshot's createdAt/updatedAt)
  - Track statistics: screenshots processed, tags extracted, errors
  - Log progress every 100 screenshots
  - Handle errors gracefully and continue processing
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 5.2 Test migration script
  - Run on development database with test data
  - Verify tags extracted correctly
  - Check statistics output matches expectations
  - Verify no duplicate tags created
  - _Requirements: 13.5_

### Task 6: Tag Management UI (Optional Enhancement)

- [ ]* 6.1 Add tag list view to main UI
  - Create route `/tags` or modal for viewing all tags
  - Integrate existing TagList component
  - Allow filtering screenshots by clicking tags
  - Show tag statistics and usage patterns
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

### Task 7: Documentation (Optional)

- [ ]* 7.1 Update README with hashtag usage
  - Add "Hashtag Tagging" section explaining the feature
  - Include examples: `#project-alpha`, `#receipt`, `#meeting-notes`
  - Document keyboard shortcuts (Tab, Enter, Escape for autocomplete)
  - Add screenshots of tag suggestions and clickable hashtags
  - _Requirements: User documentation_

- [ ]* 7.2 Add AI generation documentation
  - Document how to configure AI providers (OpenAI, Anthropic, Gemini)
  - Add examples of environment variables (.env.local)
  - Explain token usage and estimated costs per generation
  - Document supported AI models and their capabilities
  - Include troubleshooting section for common AI errors
  - _Requirements: User documentation_

- [ ]* 7.3 Add technical documentation
  - Document tag extraction algorithm and regex patterns
  - Add API documentation for server functions (extractAndStoreTags, getTagSuggestions, etc.)
  - Document AI integration architecture and prompt engineering
  - Include database schema documentation for tags table
  - Add troubleshooting guide for tag-related issues
  - _Requirements: Technical documentation_

## Implementation Notes

### Core Functionality Status
- ✅ All core hashtag tagging features are **COMPLETE** and working in production
- ✅ AI note generation is **COMPLETE** with support for OpenAI, Anthropic, and Gemini
- ✅ Clickable hashtags are **COMPLETE** in both ScreenshotCard and ScreenshotViewer
- ✅ Tag search is **COMPLETE** and integrated into FileExplorer
- ✅ Tag autocomplete is **COMPLETE** with keyboard navigation

### Remaining Work
- Migration script needed to extract tags from existing notes in the database
- Property-based tests are optional but recommended for comprehensive testing
- Documentation tasks are optional but helpful for users and maintainers

### AI Configuration
- AI features require API keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`
- Set in `.env.local` file
- AI generation will incur costs per request (varies by provider and model)
- Current implementation uses AI vision models directly without separate OCR step

### Testing Strategy
- Unit tests are **COMPLETE** for tag utilities and highlighting
- Property-based tests are **OPTIONAL** but provide additional confidence
- Each property test should run 100+ iterations to catch edge cases
- Use fast-check library for property-based testing
