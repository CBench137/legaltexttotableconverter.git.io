/**
 * Row Generator
 * Generates row objects from split text
 */

const RowGenerator = {
    /**
     * Generate row objects from split rows array
     * Each row gets a number and metadata
     * 
     * @param {Array<string>} rows - Array of split text rows
     * @returns {Array<Object>} Array of row objects
     */
    generateRows(rows) {
        const rowObjects = [];

        for (let i = 0; i < rows.length; i++) {
            const text = rows[i];
            const rowObj = {
                number: i + 1,
                text: text,
                isEmpty: text.trim() === '',
                isClauseNumber: this.isClauseNumber(text),
                isLeadingPhrase: this.isLeadingPhrase(text),
                isAmendment: this.isAmendment(text),
                language: this.detectLanguage(text),
                length: text.length
            };

            rowObjects.push(rowObj);
        }

        return rowObjects;
    },

    /**
     * Check if a row contains only a clause number
     * @param {string} text - Row text
     * @returns {boolean}
     */
    isClauseNumber(text) {
        if (!text || text.trim() === '') {
            return false;
        }

        // Check if it matches clause number pattern
        const trimmed = text.trim();
        
        // English pattern: 1., 2., 5a., etc.
        if (/^[☑*†‡§¶•◆■▪▲►]?\d+[a-z]?\.?$/.test(trimmed)) {
            return true;
        }

        // Devanagari pattern: १., २., ५क., etc.
        if (/^[☑*†‡§¶•◆■▪▲►]?[०-९]+[क-य]?\.?$/.test(trimmed)) {
            return true;
        }

        return false;
    },

    /**
     * Check if a row is a leading phrase (ends with colon)
     * @param {string} text - Row text
     * @returns {boolean}
     */
    isLeadingPhrase(text) {
        if (!text || text.trim() === '') {
            return false;
        }

        const trimmed = text.trim();
        return trimmed.endsWith(':');
    },

    /**
     * Check if a row contains amendment symbols
     * @param {string} text - Row text
     * @returns {boolean}
     */
    isAmendment(text) {
        if (!text) {
            return false;
        }

        const amendmentSymbols = ['☑', '*', '†', '‡', '§', '¶', '•', '◆', '■', '▪', '▲', '►'];
        return amendmentSymbols.some(symbol => text.includes(symbol));
    },

    /**
     * Detect language of a row (English, Devanagari, Mixed)
     * @param {string} text - Row text
     * @returns {string} 'english', 'devanagari', or 'mixed'
     */
    detectLanguage(text) {
        if (!text) {
            return 'unknown';
        }

        const hasEnglish = /[a-zA-Z]/.test(text);
        const hasDevanagari = /[\u0900-\u097F]/.test(text);

        if (hasEnglish && hasDevanagari) {
            return 'mixed';
        } else if (hasDevanagari) {
            return 'devanagari';
        } else if (hasEnglish) {
            return 'english';
        } else {
            return 'other';
        }
    },

    /**
     * Get CSS class names for row styling
     * @param {Object} row - Row object
     * @returns {Array<string>} Array of class names
     */
    getRowClasses(row) {
        const classes = [];

        if (row.isEmpty) {
            classes.push('empty-row');
        }

        if (row.isClauseNumber) {
            classes.push('clause-number');
        }

        if (row.isLeadingPhrase) {
            classes.push('leading-phrase');
        }

        if (row.isAmendment) {
            classes.push('amendment-clause');
        }

        if (row.language === 'devanagari' || row.language === 'mixed') {
            classes.push('devanagari');
        }

        return classes;
    },

    /**
     * Get row display text (with empty row indicator if needed)
     * @param {Object} row - Row object
     * @returns {string}
     */
    getDisplayText(row) {
        if (row.isEmpty) {
            return '';
        }
        return row.text;
    },

    /**
     * Generate rows from split text with full metadata
     * @param {string} text - Input text
     * @returns {Array<Object>}
     */
    generateRowsFromText(text) {
        const splitRows = TextSplitter.splitWithNormalization(text);
        return this.generateRows(splitRows);
    },

    /**
     * Enhance rows with additional metadata
     * @param {Array<Object>} rows - Row objects
     * @returns {Array<Object>}
     */
    enhanceRows(rows) {
        const enhanced = rows.map((row, index) => {
            return {
                ...row,
                index: index,
                isFirst: index === 0,
                isLast: index === rows.length - 1,
                classes: this.getRowClasses(row),
                displayText: this.getDisplayText(row),
                isMainClause: row.isClauseNumber && !row.isAmendment,
                isAmendmentClause: row.isClauseNumber && row.isAmendment
            };
        });

        return enhanced;
    },

    /**
     * Filter rows by criteria
     * @param {Array<Object>} rows - Row objects
     * @param {Function} predicate - Filter function
     * @returns {Array<Object>}
     */
    filterRows(rows, predicate) {
        return rows.filter(predicate);
    },

    /**
     * Get summary statistics for rows
     * @param {Array<Object>} rows - Row objects
     * @returns {Object} Statistics
     */
    getRowStatistics(rows) {
        const emptyRows = rows.filter(r => r.isEmpty).length;
        const clauseNumbers = rows.filter(r => r.isClauseNumber).length;
        const leadingPhrases = rows.filter(r => r.isLeadingPhrase).length;
        const amendments = rows.filter(r => r.isAmendment).length;
        const devanagariRows = rows.filter(r => r.language === 'devanagari').length;
        const mixedRows = rows.filter(r => r.language === 'mixed').length;
        const englishRows = rows.filter(r => r.language === 'english').length;

        const totalTextLength = rows.reduce((sum, r) => sum + r.length, 0);
        const avgRowLength = rows.length > 0 ? totalTextLength / rows.length : 0;

        return {
            totalRows: rows.length,
            emptyRows: emptyRows,
            contentRows: rows.length - emptyRows,
            clauseNumbers: clauseNumbers,
            leadingPhrases: leadingPhrases,
            amendments: amendments,
            languages: {
                english: englishRows,
                devanagari: devanagariRows,
                mixed: mixedRows
            },
            averageRowLength: avgRowLength,
            totalTextLength: totalTextLength,
            maxRowLength: rows.length > 0 ? 
                Math.max(...rows.map(r => r.length)) : 0,
            minRowLength: rows.length > 0 ? 
                Math.min(...rows.map(r => r.length)) : 0
        };
    },

    /**
     * Validate row objects
     * @param {Array<Object>} rows - Row objects to validate
     * @returns {Object} Validation result
     */
    validateRows(rows) {
        const issues = [];

        if (!Array.isArray(rows)) {
            issues.push('Rows is not an array');
            return { valid: false, issues };
        }

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (row.number !== i + 1) {
                issues.push(`Row ${i} has incorrect number: ${row.number}`);
            }

            if (typeof row.text !== 'string') {
                issues.push(`Row ${row.number} text is not a string`);
            }

            if (!Array.isArray(row.classes)) {
                issues.push(`Row ${row.number} classes is not an array`);
            }
        }

        return {
            valid: issues.length === 0,
            issues: issues,
            rowCount: rows.length
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RowGenerator;
}
