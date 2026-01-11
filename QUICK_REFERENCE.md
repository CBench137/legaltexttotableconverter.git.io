# Legal Text Splitter - Quick Reference Guide

## 🎯 One-Minute Overview

This is a **web-based tool** that converts legal documents into structured rows, with one piece of information per row.

**Input**: Legal text (English/Devanagari) in any format (paste, TXT, DOCX, PDF)  
**Output**: Numbered rows in a table (also exportable as Text, CSV, or JSON)

## 📖 How to Use

### Step 1: Get Your Text
```
Option A: Copy/paste into the text area
Option B: Drag & drop a file
Option C: Click "Browse Files" button
```

### Step 2: Split
```
Click "Split into Rows" button
```

### Step 3: Export
```
Copy to clipboard OR
Export → Choose format (Text/CSV/JSON)
```

## 🧩 What Gets Split (Examples)

### Clause Numbers
```
Input:  5. Definitions: Some content here.
Output: 
  Row: 5.
  Row: Definitions:
  Row: Some content here.
```

### Line Breaks
```
Input:
  Line 1
  Line 2
  Line 3
  
Output:
  Row 1: Line 1
  Row 2: Line 2
  Row 3: Line 3
```

### Amendment Clauses
```
Input:  *16a. New clause here.
Output:
  Row: *16a.
  Row: New clause here.
```

## 🌍 Languages Supported

| Feature | English | Devanagari |
|---------|---------|-----------|
| Numbers | 1, 2, 3, ... | १, २, ३, ... |
| Alpha-numeric | 5a, 5b, 16a | ५क, ५ख, १६क |
| Text | Full ASCII | Full Unicode |

## 📤 Export Formats

### Text Format
```
Row 1: THE EVIDENCE ACT
Row 2: 
Row 3: Preamble
```

### CSV Format
```csv
"Row Number","Text Content"
"1","THE EVIDENCE ACT"
"2",""
"3","Preamble"
```

### JSON Format
```json
{
  "rows": [
    {"number": 1, "text": "THE EVIDENCE ACT"},
    {"number": 2, "text": ""},
    {"number": 3, "text": "Preamble"}
  ]
}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Split text |
| `Cmd+Enter` | Split text (Mac) |
| `Ctrl+A` | Select all (in textarea) |

## 🐛 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| PDF won't upload | Some PDFs have scanned images - need OCR |
| DOCX loses formatting | Formatting is normal - text is preserved |
| Rows not splitting right | Make sure file format matches content type |
| Can't copy to clipboard | Use Ctrl+C after clicking copy |

## 💾 File Size Limits

- **Maximum**: 5 MB
- **Recommended**: Under 1 MB
- **Performance**: Handles 10,000+ rows smoothly

## 🎨 Table Features

- 🔢 Row numbers (automatic)
- 🎯 Color highlighting:
  - **Gray**: Clause numbers
  - **Yellow**: Leading phrases (text before colon)
  - **Orange**: Amendment clauses (with symbols)
- 📊 Row counter showing total rows
- 🔍 Scrollable for large documents

## 🛠️ Settings & Customization

### File Validation
```
Supported formats: TXT, DOCX, PDF
Max size: 5 MB
Encoding: UTF-8
```

### Processing
```
Preserves: All original text, whitespace, formatting
Modifies: Nothing - text is never changed
```

## 🔐 Privacy

- ✅ All processing in your browser
- ✅ No data sent to any server
- ✅ No cookies or tracking
- ✅ Works offline after first load

## 📊 Output Statistics

After splitting, you get:
- **Total rows**: Count of all rows
- **Clause count**: Number of detected clauses
- **Leading phrases**: Number of detected phrases
- **Language breakdown**: English vs Devanagari
- **Average row length**: Characters per row

## 🔗 Module Dependencies

```
DevanagariParser
    ↓
ClauseNumberDetector ← LeadingPhraseDetector
    ↓
TextSplitter
    ↓
RowGenerator
    ↓
TableRenderer ← ExportHandler ← CopyHandler
    ↓
UIController
```

## 📝 File Extraction Details

### TXT Files
- Read as plain UTF-8 text
- Line breaks preserved
- No formatting extracted

### DOCX Files
- Text extracted using Mammoth.js
- Paragraph structure preserved
- Basic formatting detected

### PDF Files
- Text extracted using PDF.js
- Page order preserved
- Complex layouts may not extract perfectly

## 🎯 Clause Detection Patterns

### English
```
Regular:      1. 2. 3. ... 99.
Alpha-numeric: 5a. 5b. 16a. 16b.
```

### Devanagari
```
Regular:      १. २. ३. ... ९९.
Alpha-numeric: ५क. ५ख. १६क. १६ख.
```

### Amendment Symbols (preserved in output)
```
* † ‡ ☑ § ¶ • ◆ ■ ▪ ▲ ►
```

## 📋 Tips & Tricks

1. **Split after pasting**: Don't forget to click "Split into Rows"
2. **Use Ctrl+Enter**: Faster than clicking the button
3. **Export before closing**: Rows aren't saved automatically
4. **Check row count**: Compare input lines to output rows
5. **Use CSV for spreadsheets**: Import into Excel/Sheets easily
6. **Use JSON for automation**: Easy to parse programmatically

## 🎓 Understanding Row Types

| Type | Looks Like | Example |
|------|-----------|---------|
| Clause Number | Just a number | `5.` or `५.` |
| Leading Phrase | Ends with colon | `Definitions:` |
| Content | Regular text | `The meaning is...` |
| Sub-clause | In parentheses | `(a) content` |
| Empty | Blank line | (empty) |

## 📞 Getting Help

1. Check the README.md for detailed documentation
2. Look at examples in the Quick Reference (this file)
3. Check browser console (F12) for error messages
4. Verify file format and size are correct

## 🔄 Workflow Example

```
Input File (DOCX)
    ↓
Open in Legal Text Splitter
    ↓
Paste text OR Upload file
    ↓
Click "Split into Rows"
    ↓
Review table (check for correct splitting)
    ↓
Export as JSON
    ↓
Use in Step 2 (ID Assignment)
```

## ✨ What's Next?

Once you have split rows, you can:
1. **Step 2**: Add unique IDs to each row
2. **Step 3**: Map to legal document hierarchy
3. **Step 4**: Create index/references
4. **Step 5**: Build searchable database

---

**Pro Tip**: For best results, ensure your input document has:
- Clear clause numbering
- Consistent formatting
- Proper line breaks between clauses
- Standard punctuation (colons after headers)

**Version**: 1.0.0
