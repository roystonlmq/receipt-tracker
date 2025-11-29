# AI Notes Feature

## Overview
The AI Notes feature allows users to automatically generate descriptive notes for their screenshots using AI vision models. The feature is optional and requires an API key to be configured.

## Supported AI Providers
- **OpenAI**: GPT-4o-mini (default) or any GPT-4 vision model
- **Anthropic**: Claude 3.5 Sonnet (default) or other Claude vision models

## Configuration

Add one of the following to your `.env.local` file:

### OpenAI
```bash
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"  # Optional
```

### Anthropic Claude
```bash
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"  # Optional
```

## How It Works

1. **User initiates**: User clicks "Generate with AI" button in the screenshot viewer
2. **Context gathering**: System retrieves user's top 10 most-used tags for context
3. **AI analysis**: Image is sent to the configured AI provider with a prompt
4. **Note generation**: AI generates 2-3 sentences describing the screenshot
5. **Tag suggestions**: AI suggests 2-4 relevant hashtags based on content and user's tag history
6. **Review & edit**: Generated notes populate the editor for user review before saving

## Features

### Smart Tag Suggestions
- AI considers your previously used tags when suggesting new ones
- Maintains consistent formatting (lowercase, hyphen-separated)
- Suggests 2-4 relevant tags per screenshot

### Overwrite Protection
- If notes already exist, user is prompted before overwriting
- User can cancel to keep existing notes

### Token Tracking
- Token usage is logged for monitoring costs
- Success toast shows provider and token count

### Graceful Degradation
- If no API key is configured, AI button is hidden
- Clear error messages if API calls fail
- Existing notes are never lost on failure

## User Experience

### In View Mode (No Notes)
- "Generate with AI" button appears prominently
- "Add Notes Manually" button as alternative
- Press `E` to enter manual edit mode

### In Edit Mode
- "Generate with AI" button at top of notes panel
- Gradient purple-to-blue styling for visual distinction
- Loading state with "Generating..." text
- Auto-enters edit mode after generation for review

### Keyboard Shortcuts
- `E` - Enter edit mode
- `Cmd/Ctrl + S` - Save notes
- `Escape` - Cancel edit (with unsaved changes confirmation)

## API Prompt

The AI receives the following instructions:

```
You are analyzing a screenshot/receipt image. Generate concise, descriptive notes about what you see in the image.

Focus on:
- What type of document or content this is
- Key information visible (amounts, dates, names, etc.)
- Purpose or context of the screenshot

At the end of your notes, suggest 2-4 relevant hashtags for organization. Format hashtags as lowercase with hyphens (e.g., #project-name, #receipt, #invoice).

[If user has tags: The user frequently uses these tags: #tag1, #tag2, ... Use them when relevant.]

Keep the notes brief (2-3 sentences) and actionable.
```

## Implementation Files

- `src/utils/ai.ts` - AI utility functions and API calls
- `src/server/ai.ts` - Server functions for AI generation
- `src/components/ScreenshotViewer.tsx` - UI integration

## Cost Considerations

- **Opt-in only**: Users must explicitly click to generate
- **No automatic generation**: Never runs without user action
- **Token logging**: All usage is logged for monitoring
- **Efficient models**: Defaults to cost-effective models (gpt-4o-mini, claude-3.5-sonnet)
- **Single screenshot**: No batch processing to control costs

## Error Handling

- API key validation on startup
- Network error handling with retry logic
- User-friendly error messages
- Preserves existing notes on failure
- Graceful fallback if AI unavailable

## Future Enhancements

Potential improvements for future versions:
- OCR text extraction before AI analysis
- Batch generation for multiple screenshots
- Custom prompt templates
- Cost tracking dashboard
- Alternative AI providers (Google Gemini, etc.)
