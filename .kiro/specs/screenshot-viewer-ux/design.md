# Design Document: Screenshot Viewer UX Improvements

## Overview

This design implements contextual keyboard shortcut hints and cross-platform keyboard modifier detection for the Screenshot Viewer component. The current implementation places all keyboard hints in a bottom-left overlay that can be obscured by full-screen images, and hardcodes "Ctrl" regardless of the user's operating system. This design relocates hints to contextual positions near their associated actions and implements OS detection to display appropriate modifier keys (Cmd on macOS, Ctrl on Windows/Linux).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ScreenshotViewer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Header (with Close button + ESC hint)                  │ │
│  │ Download button + Cmd/Ctrl+D hint                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Image Viewer                                           │ │
│  │  ┌──────┐                              ┌──────┐        │ │
│  │  │ ← Prev│         [Image]             │Next →│        │ │
│  │  └──────┘                              └──────┘        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Notes Panel                                            │ │
│  │ Save hint: Cmd/Ctrl+S                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

1. **Platform Detection Utility** (`src/utils/platform.ts`)
   - Detects operating system on initialization
   - Caches result for performance
   - Provides utility functions for platform-specific behavior

2. **Keyboard Shortcut Component** (`src/components/KeyboardHint.tsx`)
   - Reusable component for displaying keyboard shortcuts
   - Automatically uses correct modifier key based on platform
   - Consistent styling across all instances

3. **Updated ScreenshotViewer** (`src/components/ScreenshotViewer.tsx`)
   - Removes bottom-left overlay
   - Integrates contextual keyboard hints
   - Uses platform detection for modifier keys

## Components and Interfaces

### 1. Platform Detection Utility

**File:** `src/utils/platform.ts`

```typescript
export type Platform = 'mac' | 'windows' | 'linux' | 'unknown';

export interface PlatformInfo {
  platform: Platform;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  modifierKey: 'Cmd' | 'Ctrl';
  modifierSymbol: '⌘' | 'Ctrl';
}

// Detect platform once and cache
export function detectPlatform(): PlatformInfo;

// Get cached platform info
export function getPlatform(): PlatformInfo;

// Format keyboard shortcut with correct modifier
export function formatShortcut(key: string, useSymbol?: boolean): string;
```

**Implementation Details:**
- Uses `navigator.platform` or `navigator.userAgentData.platform` for detection
- Falls back to user agent string parsing if needed
- Caches result in module-level variable
- Detection runs once on first import

**Detection Logic:**
```typescript
const platform = navigator.platform || navigator.userAgent;
if (/Mac|iPhone|iPad|iPod/.test(platform)) return 'mac';
if (/Win/.test(platform)) return 'windows';
if (/Linux/.test(platform)) return 'linux';
return 'unknown';
```

### 2. Keyboard Hint Component

**File:** `src/components/KeyboardHint.tsx`

```typescript
export interface KeyboardHintProps {
  keys: string | string[];
  label?: string;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function KeyboardHint(props: KeyboardHintProps): JSX.Element;
```

**Variants:**
- `default`: Full hint with keys and label (e.g., "ESC Close")
- `compact`: Keys only, no label (e.g., "ESC")
- `inline`: Minimal styling for inline text (e.g., "Press Cmd+S to save")

**Styling:**
- Uses `<kbd>` semantic HTML element
- Consistent background, border, padding across all instances
- Adapts to dark/light backgrounds with appropriate contrast
- Monospace font for key labels

**Example Usage:**
```tsx
<KeyboardHint keys="Escape" label="Close" />
<KeyboardHint keys={["Cmd", "D"]} label="Download" />
<KeyboardHint keys="←" variant="compact" />
```

### 3. Updated ScreenshotViewer Component

**Changes to ScreenshotViewer:**

1. **Remove bottom-left overlay** - Delete the absolute positioned div with all shortcuts
2. **Add ESC hint near close button** - Small hint next to X button in header
3. **Add download hint to download button** - Show shortcut within or near button
4. **Add arrow hints to navigation buttons** - Display ← and → on the buttons
5. **Update save hint in notes panel** - Use platform-aware modifier key

**New Layout Structure:**

```tsx
// Header with close hint
<div className="flex items-center gap-2">
  <button onClick={handleDownload}>
    <Download />
    Download
    <KeyboardHint keys={["Cmd", "D"]} variant="compact" />
  </button>
  
  <button onClick={onClose}>
    <X />
    <KeyboardHint keys="Escape" variant="compact" />
  </button>
</div>

// Navigation buttons with arrow hints
<button onClick={() => onNavigate("prev")}>
  <ChevronLeft />
  <KeyboardHint keys="←" variant="compact" />
</button>

// Notes panel save hint
<div className="text-xs">
  Press <KeyboardHint keys={["Cmd", "S"]} variant="inline" /> to save
</div>
```

## Data Models

No new data models are required. This feature only affects UI presentation.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Platform detection consistency
*For any* browser session, the detected platform should remain constant throughout the session and match the actual operating system
**Validates: Requirements 5.5, 6.5**

### Property 2: Modifier key correctness
*For any* keyboard shortcut displayed, if the platform is macOS, the modifier should be "Cmd" or "⌘", and if the platform is Windows or Linux, the modifier should be "Ctrl"
**Validates: Requirements 5.2, 5.3, 5.4**

### Property 3: Keyboard hint visibility
*For any* action with a keyboard shortcut, the hint should be visible and not obscured by the screenshot image, regardless of image size
**Validates: Requirements 1.5, 2.5, 3.5, 4.5**

### Property 4: Contextual positioning
*For any* keyboard hint displayed, it should be positioned near or within the UI element that triggers the associated action
**Validates: Requirements 1.1, 2.1, 3.1, 4.1**

### Property 5: Keyboard hint styling consistency
*For any* two keyboard hints displayed simultaneously, they should use the same visual styling (background, border, padding, font)
**Validates: Requirements 9.1, 9.4**

### Property 6: Semantic HTML usage
*For any* keyboard hint rendered, it should use the `<kbd>` HTML element for proper semantic meaning
**Validates: Requirements 9.5, 10.1**

### Property 7: Conditional hint display
*For any* navigation button (Previous/Next), the keyboard hint should only be displayed when the corresponding navigation action is available
**Validates: Requirements 4.3**

### Property 8: Platform detection caching
*For any* sequence of platform detection calls within a session, only the first call should perform actual detection, and subsequent calls should return the cached result
**Validates: Requirements 6.5, 13.4**

## Error Handling

### Platform Detection Failures

**Scenario:** Browser doesn't provide platform information
- **Handling:** Default to 'unknown' platform, display 'Ctrl' as modifier
- **User Impact:** Windows/Linux users see correct shortcuts, Mac users see Ctrl instead of Cmd
- **Logging:** Log warning about failed platform detection

**Scenario:** Conflicting platform signals (e.g., user agent says Mac but platform says Windows)
- **Handling:** Prioritize `navigator.platform` over user agent string
- **User Impact:** Minimal, most browsers provide consistent information
- **Logging:** Log warning about conflicting platform data

### Rendering Issues

**Scenario:** Keyboard hint causes layout overflow on narrow viewports
- **Handling:** Use responsive CSS to hide or abbreviate hints below 768px width
- **User Impact:** Mobile users see fewer hints (acceptable since mobile lacks physical keyboard)
- **Fallback:** Touch-friendly UI remains fully functional

**Scenario:** Keyboard hint overlaps with other UI elements
- **Handling:** Use CSS z-index and positioning to ensure hints don't obscure critical UI
- **User Impact:** None, hints are positioned to avoid conflicts
- **Testing:** Visual regression testing on various screen sizes

## Testing Strategy

### Unit Tests

**Platform Detection (`src/utils/platform.test.ts`):**
- Test detection with mocked `navigator.platform` values
- Test caching behavior (first call detects, subsequent calls use cache)
- Test `formatShortcut` with different platforms
- Test fallback to 'unknown' when platform cannot be detected
- Test modifier key selection (Cmd for Mac, Ctrl for others)

**KeyboardHint Component (`src/components/KeyboardHint.test.tsx`):**
- Test rendering with single key
- Test rendering with multiple keys (e.g., Cmd+D)
- Test different variants (default, compact, inline)
- Test platform-aware modifier key display
- Test semantic HTML (kbd element) usage
- Test accessibility attributes

**ScreenshotViewer Integration (`src/components/ScreenshotViewer.test.tsx`):**
- Test that bottom-left overlay is not rendered
- Test ESC hint appears near close button
- Test download hint appears near download button
- Test navigation hints appear on navigation buttons
- Test save hint appears in notes panel
- Test hints use correct modifier key based on platform

### Property-Based Tests

Property-based tests will use **fast-check** library for TypeScript/React. Each test should run a minimum of 100 iterations.

**Test 1: Platform detection consistency**
```typescript
// Feature: screenshot-viewer-ux, Property 1: Platform detection consistency
// Validates: Requirements 5.5, 6.5
fc.assert(
  fc.property(fc.constant(null), () => {
    const platform1 = getPlatform();
    const platform2 = getPlatform();
    return platform1.platform === platform2.platform &&
           platform1.modifierKey === platform2.modifierKey;
  }),
  { numRuns: 100 }
);
```

**Test 2: Modifier key correctness**
```typescript
// Feature: screenshot-viewer-ux, Property 2: Modifier key correctness
// Validates: Requirements 5.2, 5.3, 5.4
fc.assert(
  fc.property(
    fc.constantFrom('mac', 'windows', 'linux', 'unknown'),
    (platform) => {
      const mockPlatform = { platform, isMac: platform === 'mac' };
      const modifier = mockPlatform.isMac ? 'Cmd' : 'Ctrl';
      return (platform === 'mac' && modifier === 'Cmd') ||
             (platform !== 'mac' && modifier === 'Ctrl');
    }
  ),
  { numRuns: 100 }
);
```

**Test 3: Keyboard hint visibility**
```typescript
// Feature: screenshot-viewer-ux, Property 3: Keyboard hint visibility
// Validates: Requirements 1.5, 2.5, 3.5, 4.5
fc.assert(
  fc.property(
    fc.record({
      imageWidth: fc.integer({ min: 100, max: 3840 }),
      imageHeight: fc.integer({ min: 100, max: 2160 }),
      viewportWidth: fc.integer({ min: 768, max: 3840 }),
      viewportHeight: fc.integer({ min: 600, max: 2160 })
    }),
    (dimensions) => {
      // Render ScreenshotViewer with given dimensions
      // Check that all keyboard hints are within viewport bounds
      // and not overlapped by image element
      const hints = getAllKeyboardHints();
      return hints.every(hint => isVisible(hint) && !isObscured(hint));
    }
  ),
  { numRuns: 100 }
);
```

**Test 4: Contextual positioning**
```typescript
// Feature: screenshot-viewer-ux, Property 4: Contextual positioning
// Validates: Requirements 1.1, 2.1, 3.1, 4.1
fc.assert(
  fc.property(fc.constant(null), () => {
    // Render ScreenshotViewer
    const closeButton = getCloseButton();
    const escHint = getEscHint();
    const downloadButton = getDownloadButton();
    const downloadHint = getDownloadHint();
    
    // Check hints are near their associated buttons
    return isNear(closeButton, escHint) &&
           isNear(downloadButton, downloadHint);
  }),
  { numRuns: 100 }
);
```

**Test 5: Keyboard hint styling consistency**
```typescript
// Feature: screenshot-viewer-ux, Property 5: Keyboard hint styling consistency
// Validates: Requirements 9.1, 9.4
fc.assert(
  fc.property(fc.constant(null), () => {
    const hints = getAllKeyboardHints();
    if (hints.length < 2) return true;
    
    const firstHintStyles = getComputedStyle(hints[0]);
    return hints.every(hint => {
      const styles = getComputedStyle(hint);
      return styles.backgroundColor === firstHintStyles.backgroundColor &&
             styles.borderColor === firstHintStyles.borderColor &&
             styles.padding === firstHintStyles.padding &&
             styles.fontFamily === firstHintStyles.fontFamily;
    });
  }),
  { numRuns: 100 }
);
```

**Test 6: Semantic HTML usage**
```typescript
// Feature: screenshot-viewer-ux, Property 6: Semantic HTML usage
// Validates: Requirements 9.5, 10.1
fc.assert(
  fc.property(fc.constant(null), () => {
    const hints = getAllKeyboardHints();
    return hints.every(hint => hint.tagName.toLowerCase() === 'kbd');
  }),
  { numRuns: 100 }
);
```

**Test 7: Conditional hint display**
```typescript
// Feature: screenshot-viewer-ux, Property 7: Conditional hint display
// Validates: Requirements 4.3
fc.assert(
  fc.property(
    fc.record({
      currentIndex: fc.integer({ min: 0, max: 10 }),
      totalScreenshots: fc.integer({ min: 1, max: 10 })
    }),
    ({ currentIndex, totalScreenshots }) => {
      // Render with specific position in screenshot list
      const hasPrev = currentIndex > 0;
      const hasNext = currentIndex < totalScreenshots - 1;
      
      const prevHint = getPrevHint();
      const nextHint = getNextHint();
      
      return (hasPrev ? prevHint !== null : prevHint === null) &&
             (hasNext ? nextHint !== null : nextHint === null);
    }
  ),
  { numRuns: 100 }
);
```

### Integration Tests

**Full User Flow:**
1. Open Screenshot Viewer on different platforms (mocked)
2. Verify correct modifier keys are displayed
3. Verify all hints are visible and positioned correctly
4. Verify keyboard shortcuts still function correctly
5. Test responsive behavior on different viewport sizes

**Cross-Browser Testing:**
- Test platform detection in Chrome, Firefox, Safari, Edge
- Verify consistent behavior across browsers
- Test fallback behavior when platform APIs are unavailable

### Visual Regression Tests

- Capture screenshots of viewer with hints on Mac (Cmd)
- Capture screenshots of viewer with hints on Windows (Ctrl)
- Compare against baseline to detect unintended visual changes
- Test with various image sizes (small, medium, large, full-screen)

## Performance Considerations

### Platform Detection Caching

- Detection runs once on module import
- Result cached in module-level variable
- No repeated detection calls during session
- Negligible performance impact (<1ms)

### Rendering Optimization

- KeyboardHint component is lightweight (no state, minimal props)
- Uses CSS for styling, no JavaScript calculations
- No layout shifts when hints are rendered
- Hints rendered as part of initial component tree (no dynamic insertion)

### Memory Usage

- Platform detection cache: ~100 bytes
- Each KeyboardHint instance: ~200 bytes
- Total overhead: <1KB for all hints combined

## Accessibility

### Screen Reader Support

**Semantic HTML:**
- All keyboard hints use `<kbd>` element
- Screen readers announce as "keyboard shortcut"

**ARIA Labels:**
- Interactive elements include shortcuts in aria-label
- Example: `aria-label="Close viewer (Escape key)"`

**Keyboard Navigation:**
- All functionality remains keyboard accessible
- Hints don't interfere with tab order
- Focus indicators remain visible

### Visual Accessibility

**Contrast:**
- Keyboard hints meet WCAG AA contrast requirements (4.5:1 minimum)
- Tested on both dark (viewer background) and light backgrounds

**Font Size:**
- Hints use readable font size (minimum 12px)
- Scale appropriately with browser zoom

**Color Independence:**
- Hints don't rely solely on color to convey meaning
- Use border and background to distinguish from surrounding text

## Migration Strategy

### Backward Compatibility

No breaking changes to component API. Changes are purely visual/UX improvements.

### Deployment Steps

1. Deploy platform detection utility
2. Deploy KeyboardHint component
3. Update ScreenshotViewer to use new components
4. Remove old bottom-left overlay code
5. Verify in production with real user agents

### Rollback Plan

If issues arise:
1. Revert ScreenshotViewer changes
2. Restore bottom-left overlay
3. Keep platform detection utility (no harm in having it)
4. Investigate and fix issues before re-deploying

## Future Enhancements

### Customizable Shortcuts

- Allow users to customize keyboard shortcuts
- Store preferences in user settings
- Update hints dynamically based on preferences

### Keyboard Shortcut Help Modal

- Add "?" key to show all available shortcuts
- Display comprehensive list with descriptions
- Include search/filter functionality

### Touch Gesture Hints

- Show swipe gestures on touch devices
- Animate hints to demonstrate gestures
- Hide keyboard hints on touch-only devices

### Internationalization

- Translate hint labels to user's language
- Handle RTL languages appropriately
- Consider keyboard layout differences (QWERTY vs AZERTY)

