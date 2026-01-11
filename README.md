# Legal Text Splitter - Step 1: Split into Rows

A dynamic web application that splits legal text (English/Devanagari) into individual rows based on structural elements. This is the first step in a two-step legal text processing pipeline.

## 📋 Features

### Input Support
- **Direct paste**: Text area for pasting legal content
- **File upload**: Drag-and-drop zone + file browser
- **Supported formats**: TXT, DOCX, PDF
- **Language support**: English and Devanagari (देवनागरी)
- **File size**: Up to 5MB

### Processing Capabilities
- ✅ Detect main clause numbers (English: 1., 2., 5a., etc.)
- ✅ Detect Devanagari clause numbers (१., २., ५क., etc.)
- ✅ Detect amendment clauses with symbols (*, †, ‡, ☑)
- ✅ Extract leading phrases (text between clause number and colon)
- ✅ Split by paragraphs and line breaks
- ✅ Preserve all original text exactly

### Output Features
- 📊 Interactive table with row numbers
- 🎨 Syntax highlighting for clause numbers, leading phrases, amendments
- 📝 Empty row preservation
- 🔢 Row counter and statistics
- 📋 Copy all rows to clipboard
- 💾 Export in multiple formats (Text, CSV, JSON)

### Export Formats
1. **Plain Text (.txt)**
   ```
   Row 1: साक्षी ऐन, २०३१
   Row 2: 
   Row 3: परिच्छेद–१
   ```

2. **CSV (.csv)**
   ```
   "Row Number","Text Content"
   "1","साक्षी ऐन, २०३१"
   "2",""
   "3","परिच्छेद–१"
   ```

3. **JSON (.json)**
   ```json
   {
     "metadata": {...},
     "rows": [
       {"number": 1, "text": "साक्षी ऐन, २०३१", ...},
       ...
     ]
   }
   ```

## 🚀 Quick Start

1. **Open the application**: Open `index.html` in a modern web browser
2. **Input text**:
   - Paste legal text directly into the textarea, OR
   - Drag and drop a file, OR
   - Click "Browse Files" to select a file
3. **Split**: Click "Split into Rows" button
4. **Review**: Check the output table
5. **Export**: Copy to clipboard or export in your preferred format

### Keyboard Shortcuts
- `Ctrl+Enter` / `Cmd+Enter`: Split text while focused in textarea
- `Ctrl+A` / `Cmd+A`: Select all text in textarea

## 📁 Project Structure

```
project-root/
├── index.html                    # Main HTML structure
├── styles/
│   ├── main.css                 # Core layout & grid system
│   ├── components.css           # Buttons, inputs, dropdowns
│   ├── table.css                # Table styling & responsiveness
│   └── responsive.css           # Media queries for all devices
├── scripts/
│   ├── main.js                  # App initialization
│   ├── devanagariParser.js      # Devanagari numeral/letter recognition
│   ├── clauseNumberDetector.js  # Clause pattern detection
│   ├── leadingPhraseDetector.js # Leading phrase extraction
│   ├── textSplitter.js          # Core splitting logic
│   ├── rowGenerator.js          # Row object generation
│   ├── textExtractor.js         # File reading (TXT, DOCX, PDF)
│   ├── fileUploadHandler.js     # Drag-drop & file input
│   ├── tableRenderer.js         # Table rendering
│   ├── exportHandler.js         # Export functionality
│   ├── copyHandler.js           # Copy to clipboard
│   └── uiController.js          # UI events & state management
└── README.md                    # This file
```

## 🔧 Technical Stack

### Languages
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid & Flexbox
- **JavaScript (ES6+)** - Core application logic

### Libraries (CDN)
- **PDF.js v3.11.174** - PDF text extraction
- **Mammoth.js v1.6.0** - DOCX text extraction
- **No other dependencies**

### Browser Support
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📖 Splitting Rules

### Rule 1: Line Breaks
Every line break (`\n`) creates a new row.

### Rule 2: Paragraph Breaks
Double line breaks (`\n\n`) are preserved as empty rows between paragraphs.

### Rule 3: Clause Numbers
Main clause numbers are split into separate rows:
- English: `1.`, `2.`, `5a.`, `16b.`
- Devanagari: `१.`, `२.`, `५क.`, `१६ख.`
- With amendments: `*5a.`, `†३क.`, `☑16.`

### Rule 4: Leading Phrases
Text between clause number and first colon becomes a separate row:
```
5. Definitions: Content here.
→ Row 1: 5.
  Row 2: Definitions:
  Row 3: Content here.
```

### Rule 5: Sub-clauses
Sub-clauses `(a)`, `(१)`, `(क)` are NOT split—they stay with their content.

### Rule 6: Content Preservation
All original text, whitespace, formatting, and special characters are preserved exactly.

### Rule 7: Preamble
Text before the first numbered clause is split by paragraphs and lines.

## 🌐 Language Support

### English
- Standard clause numbering (1., 2., 3., ...)
- Amendment numbers (5a., 5b., 16a., ...)
- Full ASCII text support

### Devanagari (देवनागरी)
- Devanagari numerals (०-९)
- Devanagari letter suffixes (क-य)
- Full Unicode support
- Preserved exactly as input

## 📊 Example

**Input:**
```
साक्षी ऐन, २०३१

१. संक्षिप्त नाम र प्रारम्भ: यो ऐन साक्षी ऐन, २०३१ नाम राखिएको छ।

२. परिभाषाः विषय वा प्रसङ्गले अर्को अर्थ नलागेमा यस ऐनमा,–
☑(क) "अदालत" भन्नाले सर्वोच्च अदालत सम्झनु पर्छ।
*(ख) "न्यायाधीश" भन्नाले न्यायाधीश र मजिस्ट्रेट समेत।
```

**Output (34 rows):**
```
Row 1:  साक्षी ऐन, २०३१
Row 2:  [empty]
Row 3:  १.
Row 4:  संक्षिप्त नाम र प्रारम्भ:
Row 5:  यो ऐन साक्षी ऐन, २०३१ नाम राखिएको छ।
Row 6:  [empty]
Row 7:  २.
Row 8:  परिभाषाः
Row 9:  विषय वा प्रसङ्गले अर्को अर्थ नलागेमा यस ऐनमा,–
Row 10: ☑(क) "अदालत" भन्नाले सर्वोच्च अदालत सम्झनु पर्छ।
Row 11: *(ख) "न्यायाधीश" भन्नाले न्यायाधीश र मजिस्ट्रेट समेत।
```

## 🎨 UI Features

### Responsive Design
- Desktop: Full-width table with sidebar controls
- Tablet: Stacked layout with scrollable table
- Mobile: Optimized for touch with full responsiveness
- Very small screens: Minimal layout with essential controls

### Visual Feedback
- ✅ Green success messages
- ❌ Red error messages
- ℹ️ Blue info messages
- ⏳ Loading spinner for file processing
- 🎯 Drag-over highlight for drop zone

### Accessibility
- WCAG 2.1 compliant color contrast
- Keyboard navigation support
- Screen reader friendly
- Touch-friendly button sizes (44x44px minimum)
- Focus indicators on all interactive elements

## 🔐 Privacy & Security

- **No server uploads**: All processing happens in your browser
- **No data collection**: No analytics or tracking
- **No cookies**: Stateless application
- **Offline capable**: Works without internet connection (after first load)
- **Safe file handling**: Files are processed in-memory only

## ⚙️ Configuration

### File Size Limits
- Maximum file size: 5MB
- Can be adjusted in `TextExtractor.extractFromFile()`

### Performance
- Handles documents up to ~50,000 rows efficiently
- Uses streaming for large PDF processing
- Lazy renders for huge tables

### Customization
- Modify colors in CSS variable declarations (`:root`)
- Adjust clause detection patterns in `ClauseNumberDetector`
- Customize export formats in `ExportHandler`

## 🐛 Known Limitations

1. **PDF text extraction**: Complex layouts may not extract perfectly
2. **DOCX formatting**: Some formatting styles may be lost
3. **Mixed scripts**: Some special Unicode characters may display differently
4. **Very large files**: Files >5MB are rejected (can be increased in code)

## 🔮 Future Enhancements

- [ ] Undo/Redo functionality
- [ ] Drag-to-reorder rows
- [ ] Find & replace in results
- [ ] Advanced filtering/search
- [ ] Batch file processing
- [ ] Save/load project state
- [ ] Keyboard shortcut customization
- [ ] Dark mode toggle
- [ ] Multi-language UI

## 📝 Notes for Step 2

This application produces output ready for Step 2 (ID Assignment):
- Each row has a unique number (1, 2, 3, ...)
- JSON export includes row metadata for easy processing
- CSV format is compatible with spreadsheet applications
- All text is preserved without modification

## 🤝 Contributing

To extend this application:

1. **Adding new export format**: Edit `ExportHandler`
2. **Custom splitting rules**: Modify `TextSplitter`
3. **New file format support**: Extend `TextExtractor`
4. **UI improvements**: Update relevant CSS files

## 📄 License

This project is provided as-is for legal document processing purposes.

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF text not extracting | PDF may have scanned images. Use OCR first. |
| DOCX shows plain text | Some formatting is lost by design. Try exporting to test. |
| File won't upload | Check file size (<5MB), format (TXT/DOCX/PDF), and browser support. |
| Rows not splitting | Ensure file format is correct and text is legal document format. |
| Copy not working | Try Ctrl+C manually after clicking copy button. |
| Table not showing | Check browser console for JavaScript errors. |

## 📧 Support

For issues or questions about using this application, please review the documentation or check browser console for error messages.

---

**Version**: 1.0.0  
**Last Updated**: January 11, 2024  
**Status**: Stable Release
