# Implementation Tasks: Enhanced Notes with Tags and AI

## Phase 1: Database Schema and Utilities

### Task 1.1: Create Tags Table Migration
- [ ] Create Drizzle migration for `tags` table
- [ ] Add indexes for userId, tag, and lastUsed
- [ ] Add unique constraint on (userId, tag)
- [ ] Create `ai_generations` table for tracking (optional)
- [ ] Test migration on local database

### Task 1.2: Implement Tag Utility Functions
- [ ] Create `src/utils/tags.ts`
- [ ] Implement `extractHashtags()` function with regex
- [ ] Implement `normalizeTag()` function
- [ ] Implement `formatTag()` function
- [ ] Implement `isValidHashtag()` function
- [ ] Write unit tests for all tag utilities
- [ ] Test edge cases (special characters, multiple #, etc.)

### Task 1.3: Implement Hashtag Highlighting Utility
- [ ] Implement `highlightHashtags()` function
- [ ] Test with various text inputs
- [ ] Ensure proper React key handling
- [ ] Test performance with long text

## Phase 2: Tag Storage and Retrieval

### Task 2.1: Implement Tag Extraction Server Function
- [ ] Create `extractAndStoreTags` server function
- [ ] Use raw PostgreSQL client for reliability
- [ ] Implement upsert logic (insert or update lastUsed)
- [ ] Handle duplicate tags within same text
- [ ] Add error handling and logging
- [ ] Write integration tests

### Task 2.2: Implement Tag Suggestions Server Function
- [ ] Create `getTagSuggestions` server function
- [ ] Query tags table with userId filter
- [ ] Implement partial match filtering (ILIKE)
- [ ] Sort by lastUsed DESC
- [ ] Limit to top 10 results
- [ ] Add usage count to response
- [ ] Test query performance
- [ ] Write integration tests

### Task 2.3: Implement Get User Tags Server Function
- [ ] Create `getUserTags` server function
- [ ] Join tags with screenshots for usage count
- [ ] Calculate date range (firstUsed, lastUsed)
- [ ] Mark inactive tags (>30 days)
- [ ] Support sorting options (usage, alphabetical, recent)
- [ ] Write integration tests

### Task 2.4: Update Screenshot Notes Save
- [ ] Modify `updateScreenshotNotes` to call `extractAndStoreTags`
- [ ] Make tag extraction asynchronous (don't block save)
- [ ] Handle extraction errors gracefully
- [ ] Test with various note formats

## Phase 3: Tag UI Components

### Task 3.1: Create EnhancedNotesInput Component
- [ ] Create component with contentEditable div
- [ ] Implement real-time hashtag highlighting
- [ ] Detect # character and cursor position
- [ ] Trigger tag suggestions on # input
- [ ] Handle keyboard navigation (Arrow, Tab, Enter, Escape)
- [ ] Insert selected tag at cursor position
- [ ] Preserve cursor position after insertion
- [ ] Add debouncing for suggestion queries (100ms)
- [ ] Style hashtags with blue color and bold
- [ ] Test with various input scenarios
- [ ] Write component tests

### Task 3.2: Create TagSuggestionsDropdown Component
- [ ] Create dropdown component
- [ ] Position relative to cursor
- [ ] Display tag suggestions with usage count
- [ ] Highlight selected suggestion
- [ ] Handle mouse click selection
- [ ] Handle keyboard selection
- [ ] Close on outside click
- [ ] Close on Escape key
- [ ] Add loading state
- [ ] Style with Tailwind CSS
- [ ] Write component tests

### Task 3.3: Create TagHintBanner Component
- [ ] Create hint banner component
- [ ] Check if user has used tags before
- [ ] Display example hashtag
- [ ] Implement dismiss functionality
- [ ] Store dismiss preference in localStorage
- [ ] Style with Tailwind CSS
- [ ] Write component tests

### Task 3.4: Create TagList Component
- [ ] Create tag list component
- [ ] Fetch user tags on mount
- [ ] Display tags with statistics
- [ ] Show usage count and date range
- [ ] Mark inactive tags visually
- [ ] Implement sorting options
- [ ] Handle tag click to trigger search
- [ ] Add loading and error states
- [ ] Style with Tailwind CSS
- [ ] Write component tests

### Task 3.5: Update ScreenshotViewer Component
- [ ] Replace plain textarea with EnhancedNotesInput
- [ ] Add TagHintBanner
- [ ] Test hashtag highlighting in viewer
- [ ] Ensure Ctrl+S still works
- [ ] Test with existing screenshots

## Phase 4: Tag Search

### Task 4.1: Implement Tag Search Server Function
- [ ] Create `searchByTags` server function
- [ ] Parse hashtags from search query
- [ ] Build SQL query with OR conditions
- [ ] Use ILIKE for case-insensitive matching
- [ ] Return matching screenshots
- [ ] Test with single and multiple tags
- [ ] Write integration tests

### Task 4.2: Update Search UI
- [ ] Detect hashtags in search input
- [ ] Call `searchByTags` when hashtags present
- [ ] Highlight matching hashtags in results
- [ ] Make hashtags in notes clickable
- [ ] Trigger search on hashtag click
- [ ] Test search functionality

### Task 4.3: Update FileExplorer Component
- [ ] Support tag-based filtering
- [ ] Display tag filter indicator
- [ ] Allow clearing tag filter
- [ ] Test with various tag combinations

## Phase 5: AI Note Generation

### Task 5.1: Setup AI Configuration
- [ ] Add AI environment variables to `.env.local`
- [ ] Create `src/utils/ai.ts`
- [ ] Implement `getAIConfig()` function
- [ ] Validate API key on startup
- [ ] Add configuration documentation
- [ ] Test with valid and invalid configs

### Task 5.2: Implement OCR Service
- [ ] Create `src/utils/ocr.ts`
- [ ] Choose OCR library (Tesseract.js or cloud service)
- [ ] Implement `extractTextFromImage()` function
- [ ] Handle various image formats
- [ ] Add error handling
- [ ] Test with sample screenshots
- [ ] Write unit tests

### Task 5.3: Implement AI Service Integration
- [ ] Implement `buildAIPrompt()` function
- [ ] Implement `callOpenAI()` function
- [ ] Implement `callClaude()` function (optional)
- [ ] Handle API responses and errors
- [ ] Parse token usage from response
- [ ] Add timeout handling
- [ ] Write integration tests with mock API

### Task 5.4: Implement Generate Notes Server Function
- [ ] Create `generateNotesWithAI` server function
- [ ] Validate user authentication and ownership
- [ ] Retrieve screenshot from database
- [ ] Call OCR service
- [ ] Get user's existing tags for context
- [ ] Call AI service with image and context
- [ ] Extract hashtags from generated notes
- [ ] Store tags in tags table
- [ ] Track generation in ai_generations table
- [ ] Handle all error cases
- [ ] Write integration tests

### Task 5.5: Create AIGenerateButton Component
- [ ] Create button component
- [ ] Add loading state with spinner
- [ ] Implement overwrite confirmation dialog
- [ ] Call `generateNotesWithAI` server function
- [ ] Handle success and populate notes field
- [ ] Handle errors with specific messages
- [ ] Add retry functionality
- [ ] Display token usage (optional)
- [ ] Style with Tailwind CSS
- [ ] Write component tests

### Task 5.6: Update ScreenshotViewer with AI Button
- [ ] Add AIGenerateButton to ScreenshotViewer
- [ ] Position button near notes field
- [ ] Hide button if AI not configured
- [ ] Handle generated notes in state
- [ ] Test AI generation flow end-to-end
- [ ] Test error scenarios

## Phase 6: Migration and Testing

### Task 6.1: Create Tag Migration Script
- [ ] Create `scripts/migrate-tags.ts`
- [ ] Query all screenshots with notes
- [ ] Extract hashtags from each
- [ ] Insert into tags table with upsert
- [ ] Track statistics (processed, extracted, errors)
- [ ] Add progress logging
- [ ] Test on sample data
- [ ] Document migration process

### Task 6.2: Run Database Migrations
- [ ] Run `pnpm db:generate` to create migration files
- [ ] Review generated SQL
- [ ] Run `pnpm db:push` on development database
- [ ] Verify tables created correctly
- [ ] Run tag migration script
- [ ] Verify tags extracted correctly

### Task 6.3: Write Property-Based Tests
- [ ] Install fast-check library
- [ ] Create test generators for tags and hashtags
- [ ] Write property tests for tag extraction
- [ ] Write property tests for tag normalization
- [ ] Write property tests for hashtag highlighting
- [ ] Ensure 100+ iterations per test
- [ ] Tag tests with feature and property numbers

### Task 6.4: Write Integration Tests
- [ ] Test complete tag workflow (input → save → suggest)
- [ ] Test AI generation workflow (trigger → generate → save)
- [ ] Test tag search workflow (search → results → click)
- [ ] Test error scenarios
- [ ] Test with multiple users (isolation)

### Task 6.5: Performance Testing
- [ ] Test tag suggestions with 1000+ tags
- [ ] Test tag search with 1000+ screenshots
- [ ] Measure response times
- [ ] Optimize queries if needed
- [ ] Add database indexes if needed

## Phase 7: Documentation and Polish

### Task 7.1: Update User Documentation
- [ ] Add hashtag usage guide to README
- [ ] Document AI generation feature
- [ ] Add screenshots of tag features
- [ ] Document keyboard shortcuts
- [ ] Add FAQ section

### Task 7.2: Update Technical Documentation
- [ ] Document tag extraction algorithm
- [ ] Document AI integration architecture
- [ ] Add API documentation for new server functions
- [ ] Document environment variables
- [ ] Add troubleshooting guide

### Task 7.3: UI Polish
- [ ] Review all tag-related UI components
- [ ] Ensure consistent styling
- [ ] Add smooth transitions and animations
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Test on mobile devices
- [ ] Fix any visual bugs

### Task 7.4: Error Handling Review
- [ ] Review all error messages
- [ ] Ensure user-friendly wording
- [ ] Add retry options where appropriate
- [ ] Test all error scenarios
- [ ] Add error logging for monitoring

## Phase 8: Deployment

### Task 8.1: Environment Setup
- [ ] Add AI environment variables to production
- [ ] Verify database migrations on production
- [ ] Run tag migration script on production data
- [ ] Test AI service connectivity

### Task 8.2: Monitoring Setup
- [ ] Add logging for tag operations
- [ ] Add logging for AI generations
- [ ] Set up alerts for AI errors
- [ ] Monitor token usage
- [ ] Set up cost alerts

### Task 8.3: Deploy to Production
- [ ] Deploy code to Cloudflare Workers
- [ ] Verify all features working
- [ ] Monitor error logs
- [ ] Test with real users
- [ ] Gather feedback

## Dependencies

- Phase 2 depends on Phase 1 (database and utilities)
- Phase 3 depends on Phase 2 (server functions)
- Phase 4 depends on Phase 2 and 3 (server functions and UI)
- Phase 5 can be done in parallel with Phase 3-4
- Phase 6 depends on all previous phases
- Phase 7 depends on Phase 6
- Phase 8 depends on Phase 7

## Estimated Timeline

- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 3-4 days
- Phase 4: 1-2 days
- Phase 5: 3-4 days
- Phase 6: 2-3 days
- Phase 7: 1-2 days
- Phase 8: 1 day

**Total: 14-21 days** (approximately 3-4 weeks)

## Notes

- AI generation is optional and can be deployed separately
- Tag features can be deployed without AI
- Migration script should be run during low-traffic period
- Consider feature flags for gradual rollout
- Monitor token costs closely after AI deployment
