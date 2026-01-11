# Empty Rows Collapse Feature

## Overview

A new customizable feature has been added that allows users to toggle whether empty rows are displayed in the output table. Users can now choose to:

- **Retain empty rows** (default): Display the complete structure with all empty rows preserved
- **Collapse empty rows**: Remove all empty rows from the display and export

## What Changed

### 1. **User Interface (index.html)**
- Added a new "Options Section" below the Split button
- Includes a checkbox labeled "Collapse empty rows"
- Checkbox is unchecked by default (retains original behavior)

### 2. **Styling (styles/main.css)**
- New `.options-section` class for the container
- Styled checkbox with light background, proper spacing, and focus states
- Fully accessible with proper color contrast and keyboard focus indicators
- Added responsive styling in `styles/responsive.css`

### 3. **Table Renderer (scripts/tableRenderer.js)**
Added two new functions:

```javascript
/**
 * Filter rows to remove empty rows
 * @param {Array<Object>} rows - Row objects to filter
 * @returns {Array<Object>} Filtered rows without empty rows
 */
filterEmptyRows(rows) {
    return rows.filter(row => !row.isEmpty);
}

/**
 * Get rows with optional empty row filtering
 * @param {boolean} collapseEmpty - Whether to filter out empty rows
 * @returns {Array<Object>} Rows (optionally filtered)
 */
getDisplayRows(collapseEmpty = false) {
    if (collapseEmpty) {
        return this.filterEmptyRows(this.currentRows);
    }
    return this.currentRows;
}
```

### 4. **UI Controller (scripts/uiController.js)**
- Added checkbox change event listener
- New `handleCollapseToggle()` function that:
  - Gets the current row display setting
  - Filters rows based on the checkbox state
  - Re-renders the table with filtered rows
  - Shows a status message about the updated display
  - Updates button states
- Updated `getState()` and `restoreState()` to preserve the collapse setting

### 5. **Copy Handler (scripts/copyHandler.js)**
- Modified `copyToClipboard()` to respect the collapse setting
- Uses `getDisplayRows(shouldCollapse)` to copy only displayed rows

### 6. **Export Handler (scripts/exportHandler.js)**
- Modified `exportRows()` to respect the collapse setting
- Uses `getDisplayRows(shouldCollapse)` for all export formats (Text, CSV, JSON)

## How It Works

### User Flow

1. **Default Behavior**: Application starts with the checkbox unchecked
2. **User toggles checkbox**: When user clicks "Collapse empty rows"
3. **Table updates instantly**: 
   - Empty rows are filtered out if checkbox is checked
   - All rows are restored if checkbox is unchecked
4. **Copy/Export respects setting**:
   - Copy to clipboard copies only displayed rows
   - Export (Text, CSV, JSON) exports only displayed rows
5. **State preservation**: The collapse setting is saved in application state

### Example

**Original output with 10 rows:**
```
Row 1: Section A
Row 2: (empty)
Row 3: Clause 1
Row 4: (empty)
Row 5: Content here
Row 6: (empty)
Row 7: Clause 2
Row 8: (empty)
Row 9: More content
Row 10: (empty)
```

**With "Collapse empty rows" checked:**
```
Row 1: Section A
Row 3: Clause 1
Row 5: Content here
Row 7: Clause 2
Row 9: More content
```

Note: Row numbers are preserved to maintain reference to original document structure.

## Backward Compatibility

✅ **All existing functionality is preserved:**
- Splitting logic unchanged
- Language detection unchanged
- All 7 splitting rules unchanged
- File upload functionality unchanged
- Export formats unchanged
- Copy to clipboard functionality unchanged
- State management enhanced but backward compatible

## Accessibility Features

- ✅ Checkbox is properly labeled with associated text
- ✅ Keyboard navigable (Tab to reach checkbox, Space to toggle)
- ✅ Focus indicator shows when checkbox is focused
- ✅ Color contrast meets WCAG 2.1 Level AA
- ✅ Status message confirms action (visual + text feedback)

## Testing Checklist

The feature has been tested for:

- [x] Default behavior (checkbox unchecked)
- [x] Toggle functionality (clicking checkbox)
- [x] Table re-renders with filtered rows
- [x] Copy to clipboard respects setting
- [x] Export formats respect setting
- [x] State preservation and restoration
- [x] CSS styling and responsive design
- [x] Keyboard navigation
- [x] Status message feedback
- [x] Integration with all existing features

## Code Examples

### Toggle the collapse setting programmatically:
```javascript
const checkbox = document.getElementById('collapseEmptyRows');
checkbox.checked = true; // Enable collapse
checkbox.dispatchEvent(new Event('change')); // Trigger update
```

### Get filtered rows:
```javascript
const shouldCollapse = document.getElementById('collapseEmptyRows').checked;
const displayRows = TableRenderer.getDisplayRows(shouldCollapse);
```

### Copy only displayed rows:
```javascript
const collapseCheckbox = document.getElementById('collapseEmptyRows');
const displayRows = TableRenderer.getDisplayRows(collapseCheckbox.checked);
const text = CopyHandler.formatRowsForCopy(displayRows);
```

## Files Modified

1. **index.html** - Added checkbox and options section
2. **styles/main.css** - Added checkbox styling
3. **styles/responsive.css** - Added responsive checkbox styling
4. **scripts/tableRenderer.js** - Added filtering methods
5. **scripts/uiController.js** - Added toggle handler and state management
6. **scripts/copyHandler.js** - Updated to respect collapse setting
7. **scripts/exportHandler.js** - Updated to respect collapse setting

## Future Enhancements

Possible future improvements:
- Keyboard shortcut (e.g., Ctrl+E) to toggle collapse
- Option to renumber rows when collapsing
- "Remember my preference" for persistent settings
- Analytics on collapse usage
