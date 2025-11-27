# UI Design Guidelines

## Overview
This document defines the UI/UX patterns and design system for the Receipts Tracker application to ensure consistency across all features.

## Design Principles

### 1. Consistency
- All similar UI elements should follow the same design pattern
- Reuse components and patterns across different views
- Maintain consistent spacing, colors, and interactions

### 2. Clarity
- Clear visual hierarchy
- Obvious interactive elements
- Helpful tooltips and keyboard hints

### 3. Feedback
- Immediate visual feedback for user actions
- Loading states for async operations
- Success/error messages for operations

## Color Palette

### Background Colors
- **Primary Background**: `bg-gradient-to-br from-zinc-900 via-zinc-800 to-black`
- **Card Background**: `bg-white/5` (hover: `bg-white/10`)
- **Modal Background**: `bg-gray-900`
- **Overlay**: `bg-black/60 backdrop-blur-sm`

### Border Colors
- **Default**: `border-white/10` (hover: `border-white/20`)
- **Selected**: `border-blue-500`
- **Error**: `border-red-500/50`

### Text Colors
- **Primary**: `text-white`
- **Secondary**: `text-white/60`
- **Tertiary**: `text-white/40`

### Accent Colors
- **Primary Action**: `bg-blue-600` (hover: `bg-blue-700`)
- **Success**: `bg-green-600` (hover: `bg-green-700`)
- **Danger**: `bg-red-600` (hover: `bg-red-700`)
- **Selection**: `bg-blue-500`

## Component Patterns

### Selection Toolbar

**Purpose**: Provide batch operations for selected items (screenshots, folders, etc.)

**Design Pattern**:
```tsx
<div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
  {/* Left side: Selection checkbox and counter */}
  <div className="flex items-center gap-3">
    <label className="flex items-center gap-2 cursor-pointer group">
      {/* Custom checkbox with checkmark SVG */}
      <div className={`relative w-5 h-5 border-2 rounded transition-all duration-200 ${
        allSelected ? "bg-blue-500 border-blue-500 scale-110" : "border-white/60 scale-100 group-hover:border-white/80"
      }`}>
        {allSelected && (
          <svg className="absolute inset-0 w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="sr-only" />
      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
        {hasSelection ? `${count} ${itemType} selected` : `Select all ${itemType}`}
      </span>
    </label>
  </div>
  
  {/* Right side: Action buttons (only show when items selected) */}
  {hasSelection && (
    <div className="flex items-center gap-2">
      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download">
        <Download className="w-5 h-5 text-white" />
      </button>
      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete">
        <Trash2 className="w-5 h-5 text-red-400" />
      </button>
    </div>
  )}
</div>
```

**Key Features**:
- Custom checkbox with smooth scale animation
- Selection counter that updates dynamically
- Icon-only action buttons with tooltips
- Buttons only appear when items are selected
- Consistent hover states

### Modal Windows

**Design Pattern**:
```tsx
<>
  {/* Backdrop */}
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
  
  {/* Modal */}
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-lg shadow-2xl border border-white/10 max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Modal content */}
      </div>
      
      {/* Footer with keyboard hint */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">ESC</kbd>
          <span>Close</span>
        </div>
      </div>
    </div>
  </div>
</>
```

**Key Features**:
- Dark backdrop with blur effect
- Centered modal with max-width
- Close button in header
- Keyboard hint in footer
- ESC key support

### Keyboard Hints

**Design Pattern**:
```tsx
<div className="flex items-center gap-2 text-xs text-white/40">
  <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">ESC</kbd>
  <span>Action description</span>
</div>
```

**Placement**:
- **Modals**: Bottom footer
- **Viewers**: Bottom-left corner
- **Folder views**: Top-right corner

**Common Shortcuts**:
- `ESC` - Close/Go back
- `Delete` - Delete selected
- `F2` - Rename
- `←` / `→` - Navigate

### Buttons

**Primary Action**:
```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
  Action
</button>
```

**Danger Action**:
```tsx
<button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
  Delete
</button>
```

**Secondary Action**:
```tsx
<button className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors">
  Cancel
</button>
```

**Icon Button**:
```tsx
<button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Tooltip">
  <Icon className="w-5 h-5 text-white" />
</button>
```

### Cards

**Selectable Card**:
```tsx
<div className={`relative rounded-lg p-6 border-2 transition-all ${
  isSelected 
    ? "bg-blue-600/20 border-blue-500" 
    : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
}`}>
  {/* Checkbox in top-right */}
  <input
    type="checkbox"
    checked={isSelected}
    onChange={onSelect}
    className="absolute top-3 right-3 w-5 h-5 rounded border-2 border-white/20 bg-white/10 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
  />
  
  {/* Card content */}
</div>
```

## Interaction Patterns

### Optimistic Updates
- Update UI immediately when user performs an action
- Show loading state only if operation takes > 200ms
- Revert on error with error message

### Confirmation Dialogs
- Always confirm destructive actions (delete, etc.)
- Show impact (e.g., "Delete 3 folders (25 screenshots)?")
- Use ConfirmDialog component for consistency

### Loading States
- Show spinner for initial page loads
- Show "Saving..." / "Loading..." text for operations
- Disable buttons during operations

### Error Handling
- Show user-friendly error messages
- Preserve user input on error
- Provide retry option when applicable

## Spacing

### Padding
- **Small**: `p-2` (8px)
- **Medium**: `p-4` (16px)
- **Large**: `p-6` (24px)

### Gaps
- **Small**: `gap-2` (8px)
- **Medium**: `gap-3` (12px) or `gap-4` (16px)
- **Large**: `gap-6` (24px)

### Margins
- **Small**: `mb-2` (8px)
- **Medium**: `mb-4` (16px)
- **Large**: `mb-6` (24px) or `mb-8` (32px)

## Typography

### Headings
- **Page Title**: `text-3xl font-bold text-white`
- **Section Title**: `text-xl font-semibold text-white`
- **Card Title**: `text-lg font-semibold text-white`

### Body Text
- **Primary**: `text-white`
- **Secondary**: `text-white/60`
- **Small**: `text-sm text-white/60`
- **Extra Small**: `text-xs text-white/40`

## Icons

### Size
- **Small**: `w-4 h-4` (16px)
- **Medium**: `w-5 h-5` (20px)
- **Large**: `w-6 h-6` (24px)
- **Extra Large**: `w-12 h-12` (48px)

### Library
- Use **Lucide React** for all icons
- Maintain consistent icon style throughout

## Animations

### Transitions
- **Default**: `transition-colors` (200ms)
- **Transform**: `transition-all` (200ms)
- **Scale**: `transition-all duration-200`

### Hover Effects
- **Scale up**: `hover:scale-110`
- **Background**: `hover:bg-white/10`
- **Border**: `hover:border-white/20`
- **Text**: `hover:text-white`

## Accessibility

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Provide keyboard shortcuts for common actions
- Show keyboard hints for discoverability

### Focus States
- Use `focus:outline-none focus:ring-2 focus:ring-blue-500`
- Ensure focus is visible on all interactive elements

### Screen Readers
- Use `sr-only` for hidden but accessible text
- Provide `aria-label` for icon-only buttons
- Use semantic HTML elements

## Future Additions

When adding new UI features:

1. **Check existing patterns** - Use components and patterns from this guide
2. **Maintain consistency** - Follow the same design language
3. **Add keyboard support** - Include keyboard shortcuts and hints
4. **Test accessibility** - Ensure keyboard and screen reader support
5. **Update this guide** - Document new patterns for future reference

## Examples

See these components for reference implementations:
- `FileExplorer.tsx` - Selection toolbar pattern
- `UserProfileSelector.tsx` - Modal pattern
- `ConfirmDialog.tsx` - Confirmation dialog pattern
- `ScreenshotViewer.tsx` - Viewer with keyboard hints
- `Header.tsx` - Navigation pattern
