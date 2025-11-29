# Bug Fixes: Screenshot Viewer UX Issues

## Overview
This document tracks critical UX bugs discovered during testing of the screenshot viewer and tag search functionality.

## Bug #1: Notes Not Displaying After First Save ✅ FIXED

### Issue
When creating notes for a screenshot for the first time and pressing save, the notes don't appear in the viewer. The user must close and reopen the screenshot to see the saved notes. On subsequent edits, the notes display correctly.

### Root Cause
The `ScreenshotViewer` component was not using the updated screenshot object returned from the server. Instead, it was creating a local object with `updatedAt: new Date()`, which didn't match the actual server timestamp. The `useEffect` hook that updates notes depends on `screenshot.notes`, but the prop wasn't being updated with the server's response.

### Fix
Modified `handleSaveNotes` in `ScreenshotViewer.tsx` to:
1. Capture the result from `updateScreenshotNotes` server function
2. Use `result.screenshot` (which includes the actual server timestamp) instead of creating a local object
3. Pass the server's screenshot object to `onUpdate` callback

### Files Changed
- `src/components/ScreenshotViewer.tsx` (line ~145-170)

### Testing
- Create a new screenshot
- Add notes for the first time
- Press Save (Ctrl+S)
- Notes should immediately appear in the viewer without closing/reopening

---

## Bug #2: Tag Search Not Showing Results ✅ FIXED

### Issue
When clicking a tag from the "Your Tags" page, the URL shows `query=#tag` but the FileExplorer displays the folders page instead of search results.

### Root Cause
The `FileExplorer` component was using `initialSearchQuery` only for initial state. When navigating from the tags page with a URL parameter, the component's `searchQuery` state wasn't updating to reflect the new URL parameter.

### Fix
Added a `useEffect` hook in `FileExplorer.tsx` that:
1. Watches `initialSearchQuery` prop for changes
2. Updates local `searchQuery` state when URL parameter changes
3. Ensures search results are displayed when navigating from tags page

### Files Changed
- `src/components/FileExplorer.tsx` (added useEffect after line ~38)

### Testing
- Go to "Your Tags" page
- Click on any tag
- Should navigate to screenshots page with search results displayed
- Should NOT show folders page

---

## Bug #3: No Deep Linking to Individual Screenshots 🔴 OPEN

### Issue
When viewing a screenshot, the URL only shows `folder=xxxxx` without a unique identifier for the screenshot. When the page is reloaded, the user returns to the folder view instead of the specific screenshot they were viewing. This creates friction as users must search for the image again.

### User Impact
- Cannot share direct links to specific screenshots
- Cannot bookmark specific screenshots
- Lose context when refreshing the page
- Extra effort required to relocate screenshots after page reload

### Proposed Solution
Add a `screenshot` URL parameter that stores the screenshot ID:
- URL format: `/screenshots?folder=DDMMYY&screenshot=123`
- When `screenshot` parameter is present, automatically open the viewer
- Maintain backward compatibility with folder-only URLs

### Requirements
1. URL should include screenshot ID when viewer is open
2. Opening a URL with screenshot ID should automatically open the viewer
3. Navigation between screenshots should update the URL
4. Closing the viewer should remove the screenshot parameter
5. Browser back/forward buttons should work correctly

### Implementation Plan
1. Update `screenshots.tsx` route to accept `screenshot` parameter
2. Modify `FileExplorer` to check for `screenshot` parameter on mount
3. Update `ScreenshotViewer` to update URL when opened/closed
4. Update navigation (prev/next) to update URL parameter
5. Handle edge cases (screenshot not found, access denied, etc.)

### Files to Modify
- `src/routes/screenshots.tsx` - Add screenshot parameter validation
- `src/components/FileExplorer.tsx` - Check for screenshot parameter and auto-open viewer
- `src/components/ScreenshotViewer.tsx` - Update URL when viewer state changes

### Testing Scenarios
- Open screenshot → URL should include screenshot ID
- Copy URL → Paste in new tab → Should open same screenshot
- Navigate to next/prev → URL should update
- Close viewer → URL should remove screenshot parameter
- Reload page with screenshot URL → Should reopen screenshot
- Invalid screenshot ID → Should show error and return to folder

---

## Bug #4: Tag Click Behavior Inconsistency 🔴 OPEN

### Issue
When clicking a tag in "Your Tags" page, the behavior should match the search functionality (Ctrl+K or /), but there may be inconsistencies in how results are displayed or filtered.

### Expected Behavior
Clicking a tag like `#daniel` should:
1. Navigate to `/screenshots?query=%23daniel`
2. Display search results showing all screenshots with that tag
3. Show search results view (not folders view)
4. Display result count
5. Allow clearing search to return to folders

### Current Status
Partially fixed by Bug #2 fix, but needs verification that all aspects work correctly.

### Testing
- Click tag from "Your Tags" page
- Verify search results are displayed
- Verify result count is shown
- Verify can clear search
- Compare behavior with Ctrl+K search

---

## Priority

| Bug | Priority | Status | Impact |
|-----|----------|--------|--------|
| #1 | High | ✅ Fixed | Notes not visible after save |
| #2 | High | ✅ Fixed | Tag search not working |
| #3 | High | 🔴 Open | No deep linking to screenshots |
| #4 | Medium | 🟡 Verify | Tag click behavior |

## Next Steps

1. ✅ Fix Bug #1 (Notes display)
2. ✅ Fix Bug #2 (Tag search)
3. 🔴 Implement Bug #3 (Deep linking) - Requires spec-driven approach
4. 🟡 Verify Bug #4 (Tag behavior consistency)
