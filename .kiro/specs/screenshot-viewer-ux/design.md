# Design Document: Cursor-Following Tag Suggestions

## Overview

This design implements cursor-following tag suggestions for the Screenshot Viewer's notes editor. The solution uses the `textarea-caret` npm package (a lightweight, battle-tested library) to calculate precise cursor coordinates, then positions a fixed-position dropdown at those coordinates. The implementation includes smart viewport boundary detection, smooth animations, performance optimizations, and graceful fallback to the current bottom-of-textarea approach.

## Architecture

### High-Level Flow

```
User types '#' → Detect hashtag → Calculate cursor position → Position dropdown → Show suggestions
                                          ↓
                                    If calculation fails
                                          ↓
                                  Fallback to bottom positioning
```

### Component Structure

```
EnhancedNotesInput (existing)
├── Textarea (existing)
├── useCursorPosition (new hook)
│   ├── getCaretCoordinates() from textarea-caret
│   ├── Viewport boundary detection
│   └── Fallback logic
└── TagSuggestionsDropdown (existing, enhanced)
    ├── Fixed positioning with calculated coordinates
    ├── Smooth animations
    └── Smart placement (below/above cursor)
```

## Components and Interfaces

### 1. useCursorPosition Hook

**Purpose:** Encapsulates cursor position calculation logic with fallback handling.

**Interface:**
```typescript
interface CursorPosition {
  top: number;
  left: number;
  placement: 'below' | 'above'; // Whether dropdown should appear below or above cursor
}

interface UseCursorPositionOptions {
  textareaRef: RefObject<HTMLTextAreaElement>;
  enabled: boolean; // Only calculate when suggestions are active
}

function useCursorPosition(options: UseCursorPositionOptions): CursorPosition | null
```

**Implementation Details:**
- Uses `textarea-caret` library's `getCaretCoordinates()` function
- Converts textarea-relative coordinates to viewport-relative (fixed positioning)
- Detects viewport boundaries and adjusts placement
- Returns `null` on error, triggering fallback
- Memoizes calculations to avoid unnecessary recomputation

### 2. Enhanced EnhancedNotesInput Component

**Changes:**
- Import and use `useCursorPosition` hook
- Pass cursor position to dropdown via state
- Add error boundary for cursor calculation failures
- Maintain existing functionality as fallback

**New State:**
```typescript
const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
const [useFallback, setUseFallback] = useState(false);
```

### 3. Enhanced TagSuggestionsDropdown

**Changes:**
- Accept `cursorPosition` prop
- Use fixed positioning with calculated coordinates
- Add CSS transitions for smooth repositioning
- Implement smart placement (above/below)
- Add fade-in/fade-out animations

**Styling Updates:**
```css
.tag-dropdown {
  position: fixed;
  z-index: 70;
  transition: top 150ms ease-out, left 150ms ease-out, opacity 200ms ease-in-out;
  animation: fadeIn 200ms ease-in-out;
}

.tag-dropdown.placement-above {
  transform: translateY(-100%);
  margin-top: -8px;
}

.tag-dropdown.placement-below {
  margin-top: 8px;
}
```

## Data Models

### CursorPosition Type
```typescript
interface CursorPosition {
  top: number;        // Pixels from viewport top
  left: number;       // Pixels from viewport left
  placement: 'below' | 'above';  // Dropdown placement relative to cursor
}
```

### ViewportBounds Type
```typescript
interface ViewportBounds {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cursor position accuracy
*For any* cursor position in the textarea, the calculated dropdown position should be within 5 pixels of the actual cursor location
**Validates: Requirements 1.1, 1.2**

### Property 2: Viewport boundary respect
*For any* cursor position near viewport edges, the dropdown should remain fully visible within the viewport bounds
**Validates: Requirements 2.2, 2.3**

### Property 3: Position update consistency
*For any* sequence of cursor movements, the dropdown position should update to follow the cursor without lag or jitter
**Validates: Requirements 2.4, 4.1**

### Property 4: Fallback reliability
*For any* cursor position calculation failure, the system should gracefully fall back to bottom-of-textarea positioning without crashing
**Validates: Requirements 1.5, 8.1, 8.2**

### Property 5: Performance constraint
*For any* cursor position calculation, the computation should complete within 16ms (one frame at 60fps)
**Validates: Requirements 4.1, 4.2**

### Property 6: Animation smoothness
*For any* dropdown position change, the transition should be smooth and complete within 200ms
**Validates: Requirements 5.3, 5.4, 5.5**

## Error Handling

### Cursor Calculation Errors
- **Cause:** Library failure, invalid textarea state, browser incompatibility
- **Handling:** Catch errors, log warning, set `useFallback` to true
- **User Impact:** Dropdown appears at bottom of textarea (current behavior)

### Viewport Boundary Edge Cases
- **Cause:** Cursor near screen edges, small viewports, zoomed browsers
- **Handling:** Detect boundaries, adjust placement to 'above' or constrain left position
- **User Impact:** Dropdown stays visible, may appear above cursor

### Performance Degradation
- **Cause:** Rapid typing, slow devices, complex textarea content
- **Handling:** Debounce calculations (100ms), use requestAnimationFrame batching
- **User Impact:** Slight delay in dropdown repositioning (imperceptible)

### Library Loading Failures
- **Cause:** Network issues, build errors, missing dependencies
- **Handling:** Try-catch around import, immediate fallback to bottom positioning
- **User Impact:** Feature works with fallback, no crash

## Testing Strategy

### Unit Tests
- Test `useCursorPosition` hook with various textarea states
- Test viewport boundary detection logic
- Test fallback trigger conditions
- Test coordinate transformation (textarea-relative to viewport-relative)

### Property-Based Tests
- **Library:** fast-check (already in project)
- **Configuration:** 100+ iterations per property
- **Properties:** All 6 correctness properties listed above

### Integration Tests
- Test complete flow: type '#' → see dropdown at cursor
- Test with long text, wrapped lines, scrolled textarea
- Test with different font sizes and line heights
- Test keyboard navigation while dropdown is positioned
- Test window resize behavior

### Manual Testing Checklist
- [ ] Dropdown appears at cursor in middle of text
- [ ] Dropdown appears at cursor at start of text
- [ ] Dropdown appears at cursor at end of text
- [ ] Dropdown flips above cursor when near bottom
- [ ] Dropdown stays in viewport when near right edge
- [ ] Dropdown follows cursor when typing continues
- [ ] Fallback works when calculation fails
- [ ] Animations are smooth and not jarring
- [ ] Works in Chrome, Firefox, Safari, Edge

## Implementation Plan

### Phase 1: Library Integration
1. Install `textarea-caret` package
2. Create `useCursorPosition` hook with basic functionality
3. Add error handling and fallback logic
4. Write unit tests for the hook

### Phase 2: Component Updates
1. Update `EnhancedNotesInput` to use the hook
2. Pass cursor position to dropdown component
3. Update dropdown styling for fixed positioning
4. Add CSS transitions and animations

### Phase 3: Smart Positioning
1. Implement viewport boundary detection
2. Add above/below placement logic
3. Handle edge cases (right edge, scrolling)
4. Test with various screen sizes

### Phase 4: Performance Optimization
1. Add debouncing for rapid typing
2. Implement requestAnimationFrame batching
3. Memoize expensive calculations
4. Profile and optimize hot paths

### Phase 5: Polish and Testing
1. Add smooth animations
2. Write property-based tests
3. Conduct cross-browser testing
4. Document fallback behavior

## Dependencies

### New Dependencies
- `textarea-caret` (^3.1.0) - Lightweight library for cursor position calculation
  - Size: ~2KB minified
  - No dependencies
  - TypeScript support via @types/textarea-caret

### Existing Dependencies
- React 19
- TypeScript
- fast-check (for property-based testing)

## Performance Considerations

### Optimization Strategies
1. **Lazy Calculation:** Only calculate position when dropdown is visible
2. **Debouncing:** Wait 100ms after last keystroke before recalculating
3. **RAF Batching:** Batch multiple position updates using requestAnimationFrame
4. **Memoization:** Cache calculations for same cursor position
5. **CSS Transforms:** Use GPU-accelerated transforms for positioning

### Expected Performance
- Cursor calculation: <5ms (well under 16ms budget)
- Position update: <1ms (state update only)
- Animation: 200ms (smooth, perceived as instant)
- Memory overhead: <1KB (minimal state)

## Accessibility

### Keyboard Navigation
- Arrow keys navigate suggestions without moving cursor
- Tab/Enter insert selected suggestion
- Escape closes dropdown
- Focus remains on textarea throughout

### Screen Reader Support
- Dropdown has `role="listbox"`
- Suggestions have `role="option"`
- Selected suggestion announced via `aria-live="polite"`
- Cursor position changes don't trigger announcements

### Visual Accessibility
- High contrast maintained (zinc-800 bg, white border)
- Dropdown has clear focus indicators
- Animations respect `prefers-reduced-motion`
- Minimum touch target size: 44x44px

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Fallback for Older Browsers
- Feature detection for `getCaretCoordinates`
- Automatic fallback to bottom positioning
- No polyfills required (graceful degradation)

## Migration Strategy

### Rollout Plan
1. **Phase 1:** Deploy with feature flag (disabled by default)
2. **Phase 2:** Enable for internal testing
3. **Phase 3:** Enable for 10% of users (A/B test)
4. **Phase 4:** Full rollout if metrics are positive

### Rollback Plan
- Feature flag can disable cursor-following instantly
- Falls back to current bottom-of-textarea behavior
- No data migration required
- No breaking changes to existing functionality

## Future Enhancements

### Potential Improvements
1. **Multi-line selection:** Show dropdown at end of selection
2. **Custom positioning:** User preference for above/below
3. **Dropdown width:** Auto-size based on longest suggestion
4. **Preview on hover:** Show tag usage stats on hover
5. **Fuzzy matching:** Better suggestion filtering

### Alternative Approaches Considered
1. **ContentEditable div:** More control but complex, accessibility issues
2. **Monaco Editor:** Overkill for simple notes, large bundle size
3. **Custom textarea overlay:** Complex z-index management, brittle
4. **Portal-based dropdown:** Considered but fixed positioning is simpler

## Conclusion

This design provides a robust, performant solution for cursor-following tag suggestions with graceful fallback. The use of the proven `textarea-caret` library minimizes implementation risk, while the comprehensive error handling ensures reliability. The phased rollout plan allows for safe deployment and easy rollback if needed.
