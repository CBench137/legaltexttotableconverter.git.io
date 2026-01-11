# Quick Start Guide - Empty Rows Collapse Feature

## 🎯 What's New

Users can now **toggle empty rows** on/off with a single checkbox, keeping all other functionality completely intact.

## 🖱️ How to Use (3 Simple Steps)

### Step 1: Split Your Text
```
1. Paste legal text or upload a file
2. Click "Split into Rows"
3. View the output table
```

### Step 2: Toggle Empty Rows (NEW!)
```
Look below the "Split into Rows" button for the new option:

[✓] Collapse empty rows  ← Check this box to hide empty rows
```

### Step 3: Use Normally
```
- View the updated table instantly
- Copy to clipboard (respects collapse setting)
- Export as Text, CSV, or JSON (respects collapse setting)
```

## 📊 Visual Example

### Before Checking "Collapse Empty Rows"
```
┌────┬──────────────────────┐
│ No.│ Text Content         │
├────┼──────────────────────┤
│ 1  │ Section A            │
│ 2  │                      │ ← Empty
│ 3  │ Clause 1             │
│ 4  │                      │ ← Empty
│ 5  │ Some content here    │
│ 6  │                      │ ← Empty
│ 7  │ Clause 2             │
│ 8  │                      │ ← Empty
│ 9  │ More content         │
│ 10 │                      │ ← Empty
└────┴──────────────────────┘
Total: 10 rows
```

### After Checking "Collapse Empty Rows"
```
┌────┬──────────────────────┐
│ No.│ Text Content         │
├────┼──────────────────────┤
│ 1  │ Section A            │
│ 3  │ Clause 1             │
│ 5  │ Some content here    │
│ 7  │ Clause 2             │
│ 9  │ More content         │
└────┴──────────────────────┘
Total: 5 rows (empty rows hidden)
```

**Note**: Row numbers are preserved so you can still reference the original document

## ✨ Key Points

✅ **Default behavior unchanged** - Checkbox is unchecked by default  
✅ **Non-destructive** - Just hiding rows, not deleting data  
✅ **Smart numbering** - Original row numbers preserved  
✅ **Works everywhere** - Copy, Export, and Display all respect the setting  
✅ **Instant updates** - No reload needed, instant table refresh  
✅ **Accessible** - Full keyboard navigation support  

## 🎮 Feature Highlights

| Feature | Behavior |
|---------|----------|
| **Toggle** | Click checkbox to show/hide empty rows |
| **Instant** | Table updates immediately |
| **Preserves** | Original row numbers, data structure |
| **Respects** | Copy and Export operations |
| **Remembers** | Your preference during session |
| **Accessible** | Keyboard and screen reader friendly |

## ❓ FAQ

**Q: What happens to my data when I enable collapse?**
A: Nothing! The data stays the same. Empty rows are just hidden from view.

**Q: Do my row numbers change?**
A: No! Row numbers remain the same (e.g., 1, 3, 5, 7, 9). This helps you reference the original document.

**Q: Does this affect the copy/export?**
A: Yes! When you copy or export, only the visible rows are included.

**Q: Can I turn it back on?**
A: Absolutely! Just uncheck the box to restore the full view.

**Q: Is this a permanent change?**
A: No. The setting only applies during your current session. When you reload the page, it resets.

## 🚀 Try It Now

1. Open `index.html` in your browser
2. Paste some legal text with multiple paragraphs
3. Click "Split into Rows"
4. Check the "Collapse empty rows" checkbox
5. Watch the table update instantly!
6. Try copying or exporting - it respects your setting
7. Uncheck to see all rows again

## 📚 More Documentation

- **[FEATURE_COLLAPSE_EMPTY_ROWS.md](./FEATURE_COLLAPSE_EMPTY_ROWS.md)** - Complete technical details
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation overview

---

**All features work alongside the existing functionality without any changes!** ✨
