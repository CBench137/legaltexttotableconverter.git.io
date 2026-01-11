/**
 * Clause Number Detector
 * Detects main clause patterns (1., 2., 5a., १., २., ५क., etc.)
 */

const ClauseNumberDetector = {
    // Amendment symbols that precede clause numbers but should be preserved
    amendmentSymbols: ['☑', '*', '†', '‡', '§', '¶', '•', '◆', '■', '▪', '▲', '►'],

    /**
     * English numeral pattern: 1., 2., 10., 5a., 16b., etc.
     * Allows optional amendment symbols before the number
     */
    englishNumeralPattern: /^[☑*†‡§¶•◆■▪▲►]?\s*(\d+(?:[a-z])?)\s*\./i,

    /**
     * Devanagari numeral pattern: १., २., ५क., १६ख., etc.
     */
    devanagariNumeralPattern: /^[☑*†‡§¶•◆■▪▲►]?\s*([०-९]+(?:[क-य])?)\s*\./,

    /**
     * Sub-clause pattern: (1), (a), (क), (१), etc.
     * These should NOT be treated as main clauses
     */
    subClausePattern: /^\s*\([0-9a-zA-Zक-य०-९]+\)/,

    /**
     * Check if a line starts with a clause number
     * Returns the matched clause number with prefix symbols or null
     * @param {string} line - Line of text to check
     * @returns {Object|null} Object with {fullClause, baseNumber, amendment, language}
     */
    detectClauseNumber(line) {
        if (!line || line.trim() === '') {
            return null;
        }

        const trimmedLine = line.trimStart();

        // Check for sub-clause first (to exclude them)
        if (this.subClausePattern.test(trimmedLine)) {
            return null;
        }

        // Try English numeral pattern
        const englishMatch = trimmedLine.match(this.englishNumeralPattern);
        if (englishMatch) {
            return {
                fullClause: englishMatch[0].trim(),
                baseNumber: englishMatch[1],
                amendment: this.extractAmendmentSymbol(trimmedLine),
                language: 'english',
                hasAlpha: /[a-z]/i.test(englishMatch[1])
            };
        }

        // Try Devanagari numeral pattern
        const devanagariMatch = trimmedLine.match(this.devanagariNumeralPattern);
        if (devanagariMatch) {
            return {
                fullClause: devanagariMatch[0].trim(),
                baseNumber: devanagariMatch[1],
                amendment: this.extractAmendmentSymbol(trimmedLine),
                language: 'devanagari',
                hasAlpha: DevanagariParser.isAlphaNumeric(devanagariMatch[1])
            };
        }

        return null;
    },

    /**
     * Extract amendment symbol from the beginning of text
     * @param {string} text - Text to check
     * @returns {string|null} Amendment symbol or null
     */
    extractAmendmentSymbol(text) {
        const trimmed = text.trimStart();
        const firstChar = trimmed[0];
        return this.amendmentSymbols.includes(firstChar) ? firstChar : null;
    },

    /**
     * Check if a line contains a clause number
     * @param {string} line - Line to check
     * @returns {boolean}
     */
    hasClauseNumber(line) {
        return this.detectClauseNumber(line) !== null;
    },

    /**
     * Get the clause number from a line (the part that should be on its own row)
     * Includes amendment symbol and dot
     * @param {string} line - Line to extract from
     * @returns {string|null}
     */
    getClauseNumberRow(line) {
        const detected = this.detectClauseNumber(line);
        if (!detected) {
            return null;
        }
        
        // Reconstruct with amendment symbol if present
        if (detected.amendment) {
            return detected.amendment + detected.fullClause;
        }
        return detected.fullClause;
    },

    /**
     * Check if text matches amendment clause pattern (5a., 5b., ५क., ५ख., etc.)
     * @param {string} line - Line to check
     * @returns {boolean}
     */
    isAmendmentClause(line) {
        const detected = this.detectClauseNumber(line);
        if (!detected) {
            return false;
        }
        return detected.hasAlpha || detected.amendment !== null;
    },

    /**
     * Extract the remainder of a line after the clause number
     * @param {string} line - Line to process
     * @returns {string|null} Remainder text or null if no clause number found
     */
    getRemainder(line) {
        const detected = this.detectClauseNumber(line);
        if (!detected) {
            return null;
        }

        // Find where the clause number ends in the original line
        const trimmed = line.trimStart();
        const clauseLength = detected.fullClause.length;
        
        // Find the dot position
        const dotIndex = trimmed.indexOf('.');
        if (dotIndex !== -1) {
            const remainder = trimmed.substring(dotIndex + 1).trimStart();
            return remainder || null;
        }

        return null;
    },

    /**
     * Get clause type for styling/classification
     * @param {string} line - Line to check
     * @returns {string|null} 'regular', 'amendment', or null
     */
    getClauseType(line) {
        const detected = this.detectClauseNumber(line);
        if (!detected) {
            return null;
        }
        
        if (detected.hasAlpha || detected.amendment) {
            return 'amendment';
        }
        return 'regular';
    },

    /**
     * Validate if a clause number is properly formatted
     * @param {string} text - Text to validate
     * @returns {boolean}
     */
    isValidClauseNumber(text) {
        return this.detectClauseNumber(text) !== null;
    },

    /**
     * Check if line appears to be a sub-clause (should not be split)
     * @param {string} line - Line to check
     * @returns {boolean}
     */
    isSubClause(line) {
        return this.subClausePattern.test(line.trimStart());
    },

    /**
     * Extract all clause numbers from a block of text
     * @param {string} text - Text to analyze
     * @returns {Array} Array of detected clause numbers
     */
    extractAllClauseNumbers(text) {
        const lines = text.split('\n');
        const clauses = [];

        for (const line of lines) {
            const detected = this.detectClauseNumber(line);
            if (detected) {
                clauses.push({
                    lineNumber: clauses.length,
                    ...detected
                });
            }
        }

        return clauses;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClauseNumberDetector;
}
