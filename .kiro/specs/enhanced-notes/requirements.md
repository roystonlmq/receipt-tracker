# Requirements Document: Enhanced Notes with Tags and AI

## Introduction

This feature enhances the existing notes functionality in the Receipts Tracker application by adding hashtag-based tagging and optional AI-powered note generation. The tagging system allows users to organize screenshots by projects, people, or categories using hashtags (e.g., #project-alpha, #john-doe), making it easier to find related screenshots. The AI note generation feature provides users with the option to automatically generate descriptive notes from screenshot content using OCR and image analysis, but only when explicitly requested to avoid unnecessary token usage.

## Glossary

- **Hashtag/Tag**: A word or phrase prefixed with # (e.g., #receipt, #project-alpha) used to categorize and organize screenshots
- **Tag Suggestion**: Previously used hashtags shown to the user as autocomplete options while typing
- **AI Note Generation**: Automated creation of descriptive notes from screenshot content using OCR and image analysis
- **OCR (Optical Character Recognition)**: Technology that extracts text from images
- **Token**: Unit of API usage for AI services (e.g., OpenAI, Claude)
- **Tag Extraction**: Process of parsing hashtags from notes text
- **Tag Index**: Database storage of all unique tags used by a user for quick retrieval

## Requirements

### Requirement 1: Hashtag Input and Display

**User Story:** As a user, I want to use hashtags in my notes, so that I can categorize screenshots by projects, people, or topics.

#### Acceptance Criteria

1. WHEN a user types a # character in the notes field, THE System SHALL recognize it as the start of a hashtag
2. WHEN a user types text after a # character, THE System SHALL highlight the hashtag with distinct styling (e.g., blue color, bold)
3. WHEN displaying saved notes, THE System SHALL render hashtags with the same distinct styling
4. WHEN a hashtag contains alphanumeric characters, hyphens, or underscores, THE System SHALL consider it valid
5. WHEN a hashtag is followed by a space, punctuation, or end of text, THE System SHALL recognize it as complete

### Requirement 2: Tag Suggestions and Autocomplete

**User Story:** As a user, I want to see suggestions of previously used hashtags while typing, so that I can reuse tags consistently without memorizing them.

#### Acceptance Criteria

1. WHEN a user types # in the notes field, THE System SHALL display a dropdown showing previously used hashtags
2. WHEN a user continues typing after #, THE System SHALL filter the suggestions to match the typed text
3. WHEN displaying tag suggestions, THE System SHALL show the most recently used tags first
4. WHEN a user clicks on a suggested tag, THE System SHALL insert the complete hashtag into the notes field
5. WHEN a user presses Tab or Enter on a highlighted suggestion, THE System SHALL insert the selected hashtag
6. WHEN no matching suggestions exist, THE System SHALL hide the suggestions dropdown
7. WHEN a user presses Escape, THE System SHALL close the suggestions dropdown without inserting anything
8. WHEN displaying tag suggestions, THE System SHALL show a count of how many screenshots use each tag

### Requirement 3: Tag Extraction and Storage

**User Story:** As a system, I need to extract and store hashtags from notes, so that I can provide tag suggestions and enable tag-based search.

#### Acceptance Criteria

1. WHEN a user saves notes containing hashtags, THE System SHALL extract all hashtags from the text
2. WHEN extracting hashtags, THE System SHALL normalize them to lowercase for consistency
3. WHEN a hashtag is extracted, THE System SHALL store it in a tags index associated with the user
4. WHEN a hashtag already exists in the user's tags index, THE System SHALL update the last used timestamp
5. WHEN a screenshot is deleted, THE System SHALL not remove tags from the index (tags persist for suggestions)
6. WHEN retrieving tag suggestions, THE System SHALL query only tags belonging to the current user

### Requirement 4: Tag-Based Search

**User Story:** As a user, I want to search for screenshots by hashtag, so that I can quickly find all screenshots related to a specific project or person.

#### Acceptance Criteria

1. WHEN a user enters a hashtag in the search field, THE System SHALL return all screenshots with notes containing that hashtag
2. WHEN searching by hashtag, THE System SHALL match the exact hashtag including the # symbol
3. WHEN multiple hashtags are in the search query, THE System SHALL return screenshots matching any of the hashtags
4. WHEN displaying search results, THE System SHALL highlight the matching hashtags in the notes preview
5. WHEN a user clicks on a hashtag in displayed notes, THE System SHALL trigger a search for that hashtag

### Requirement 5: Tag Management UI

**User Story:** As a user, I want to see a visual hint about using hashtags, so that I understand how to organize my screenshots with tags.

#### Acceptance Criteria

1. WHEN a user opens the Screenshot Viewer, THE System SHALL display a hint message about using hashtags
2. WHEN displaying the hint, THE System SHALL include an example hashtag (e.g., "Use #project or #person to tag")
3. WHEN a user has never used hashtags, THE System SHALL show the hint more prominently
4. WHEN a user has used hashtags before, THE System SHALL show a subtle hint or hide it
5. WHEN a user dismisses the hint, THE System SHALL remember the preference and not show it again

### Requirement 6: AI Note Generation - User Initiation

**User Story:** As a user, I want to generate notes automatically from my screenshot using AI, so that I can save time describing the content.

#### Acceptance Criteria

1. WHEN a user views a screenshot in the Screenshot Viewer, THE System SHALL display a "Generate with AI" button
2. WHEN a user clicks the "Generate with AI" button, THE System SHALL send the screenshot to an AI service for analysis
3. WHEN AI generation is in progress, THE System SHALL display a loading indicator and disable the generate button
4. WHEN AI generation completes successfully, THE System SHALL populate the notes field with the generated text
5. WHEN the notes field already contains text, THE System SHALL prompt the user to confirm before overwriting
6. WHEN a user confirms overwriting, THE System SHALL replace the existing notes with AI-generated content
7. WHEN a user cancels overwriting, THE System SHALL keep the existing notes unchanged

### Requirement 7: AI Note Generation - Content Analysis

**User Story:** As a system, I need to analyze screenshot content using OCR and image analysis, so that I can generate accurate and useful notes.

#### Acceptance Criteria

1. WHEN processing a screenshot for AI generation, THE System SHALL extract text using OCR
2. WHEN OCR extracts text, THE System SHALL include the extracted text in the AI prompt
3. WHEN sending to the AI service, THE System SHALL include both the image and extracted text
4. WHEN the AI service returns a response, THE System SHALL format it as plain text suitable for the notes field
5. WHEN the AI service fails or times out, THE System SHALL display an error message to the user
6. WHEN AI generation fails, THE System SHALL preserve any existing notes without modification

### Requirement 8: AI Note Generation - Token Management

**User Story:** As a system administrator, I want to control AI usage to avoid excessive token consumption, so that costs remain manageable.

#### Acceptance Criteria

1. WHEN a user initiates AI generation, THE System SHALL only process that single screenshot (no batch processing)
2. WHEN AI generation is triggered, THE System SHALL log the token usage for monitoring
3. WHEN a user generates notes for the same screenshot multiple times, THE System SHALL allow it without restriction
4. WHEN the AI service returns an error due to rate limits, THE System SHALL display a user-friendly message
5. WHEN displaying the "Generate with AI" button, THE System SHALL not suggest or encourage automatic generation

### Requirement 9: AI Note Generation - Configuration

**User Story:** As a system administrator, I want to configure the AI service and model, so that I can optimize for cost and quality.

#### Acceptance Criteria

1. WHEN the System initializes, THE System SHALL read AI configuration from environment variables
2. WHEN AI configuration includes an API key, THE System SHALL validate it before allowing AI generation
3. WHEN no AI API key is configured, THE System SHALL hide the "Generate with AI" button
4. WHEN AI configuration specifies a model, THE System SHALL use that model for all generations
5. WHEN AI configuration is missing or invalid, THE System SHALL log a warning and disable AI features

### Requirement 10: AI-Generated Notes with Suggested Tags

**User Story:** As a user, I want AI-generated notes to include relevant hashtags, so that my screenshots are automatically organized.

#### Acceptance Criteria

1. WHEN AI generates notes, THE System SHALL instruct the AI to suggest relevant hashtags
2. WHEN the AI response includes hashtags, THE System SHALL place them at the end of the generated notes
3. WHEN suggesting hashtags, THE AI SHALL use the user's previously used tags when relevant
4. WHEN the AI suggests new hashtags, THE System SHALL format them consistently (lowercase, hyphen-separated)
5. WHEN displaying AI-generated notes with hashtags, THE System SHALL apply the same hashtag styling as manual tags

### Requirement 11: Tag Analytics and Insights

**User Story:** As a user, I want to see which tags I use most frequently, so that I can understand my screenshot organization patterns.

#### Acceptance Criteria

1. WHEN a user views their tag list, THE System SHALL display a count of screenshots for each tag
2. WHEN displaying tags, THE System SHALL sort them by usage count (most used first)
3. WHEN a user clicks on a tag in the tag list, THE System SHALL show all screenshots with that tag
4. WHEN displaying tag statistics, THE System SHALL show the date range of screenshots using each tag
5. WHEN a tag has not been used in 30 days, THE System SHALL mark it as "inactive" in the tag list

### Requirement 12: Performance and Scalability

**User Story:** As a user, I want tag suggestions and search to be fast, so that my workflow is not interrupted.

#### Acceptance Criteria

1. WHEN a user types # in the notes field, THE System SHALL display suggestions within 100ms
2. WHEN searching by hashtag, THE System SHALL return results within 500ms for up to 1000 screenshots
3. WHEN extracting tags from notes, THE System SHALL process them asynchronously without blocking the save operation
4. WHEN querying the tags index, THE System SHALL use database indexes for optimal performance
5. WHEN a user has more than 100 unique tags, THE System SHALL paginate or limit the suggestions dropdown

### Requirement 13: Data Migration

**User Story:** As a system, I need to extract tags from existing notes, so that users can benefit from tag suggestions immediately.

#### Acceptance Criteria

1. WHEN the tag feature is deployed, THE System SHALL provide a migration script to extract tags from existing notes
2. WHEN the migration runs, THE System SHALL process all existing screenshots with notes
3. WHEN extracting tags during migration, THE System SHALL use the same extraction logic as new notes
4. WHEN the migration completes, THE System SHALL log the number of tags extracted and screenshots processed
5. WHEN the migration encounters errors, THE System SHALL continue processing and log failed records

### Requirement 14: Error Handling and Validation

**User Story:** As a user, I want clear feedback when AI generation fails, so that I understand what went wrong and can retry.

#### Acceptance Criteria

1. WHEN AI generation fails due to network error, THE System SHALL display "Network error. Please try again."
2. WHEN AI generation fails due to invalid API key, THE System SHALL display "AI service not configured. Contact administrator."
3. WHEN AI generation fails due to rate limiting, THE System SHALL display "AI service is busy. Please try again in a few minutes."
4. WHEN AI generation fails due to unsupported image format, THE System SHALL display "This image format is not supported for AI analysis."
5. WHEN any AI error occurs, THE System SHALL provide a "Retry" button to attempt generation again
