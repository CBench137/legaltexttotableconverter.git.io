/**
 * Text Splitter
 * Core splitting logic implementing all splitting rules
 */

const TextSplitter = {
    /**
     * Main splitting function
     * Implements Rules 1-7 of the splitting algorithm
     * 
     * @param {string} text - Input legal text
     * @returns {Array<string>} Array of split rows
     */
    splitText(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        const rows = [];
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            
            // Rule 1: Each line becomes a row (basic case)
            // But check first if it's a clause number line (Rule 3)
            
            const clauseDetected = ClauseNumberDetector.detectClauseNumber(line);
            
            if (clauseDetected) {
                // Rule 3: Main clause number detection
                // Split clause number into separate row
                rows.push(ClauseNumberDetector.getClauseNumberRow(line));

                // Rule 4: Leading phrase detection
                const leadingPhrase = LeadingPhraseDetector.getLeadingPhrase(line);
                const contentAfterPhrase = LeadingPhraseDetector.getContentAfterPhrase(line);

                if (leadingPhrase) {
                    // Leading phrase found
                    rows.push(leadingPhrase);
                    
                    if (contentAfterPhrase) {
                        // Content after leading phrase
                        rows.push(contentAfterPhrase);
                    }
                } else {
                    // No leading phrase, just remainder text (if any)
                    const remainder = ClauseNumberDetector.getRemainder(line);
                    if (remainder) {
                        rows.push(remainder);
                    }
                }
            } else if (ClauseNumberDetector.isSubClause(line)) {
                // Rule 5: Sub-clauses (keep on same row, don't split)
                rows.push(line);
            } else {
                // Rule 1: Regular line break handling
                // Rule 2: Paragraph handling (preserve empty lines)
                rows.push(line);
            }
        }

        // Rule 6: All content is preserved (no modification of text)
        // Already handled by not modifying individual text items

        return rows;
    },

    /**
     * Split text with paragraph handling
     * Treats double line breaks as paragraph separators
     * 
     * @param {string} text - Input text
     * @returns {Array<string>}
     */
    splitByParagraphs(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        // Split by double line breaks first
        const paragraphs = text.split(/\n\s*\n/);
        const rows = [];

        for (const paragraph of paragraphs) {
            if (paragraph.trim() === '') {
                // Empty paragraph - preserve as empty row
                rows.push('');
            } else {
                // Split paragraph by single line breaks
                const paraLines = paragraph.split('\n');
                for (const line of paraLines) {
                    const clauseDetected = ClauseNumberDetector.detectClauseNumber(line);
                    
                    if (clauseDetected) {
                        // Apply clause splitting rules
                        rows.push(ClauseNumberDetector.getClauseNumberRow(line));
                        
                        const leadingPhrase = LeadingPhraseDetector.getLeadingPhrase(line);
                        const contentAfterPhrase = LeadingPhraseDetector.getContentAfterPhrase(line);
                        
                        if (leadingPhrase) {
                            rows.push(leadingPhrase);
                            if (contentAfterPhrase) {
                                rows.push(contentAfterPhrase);
                            }
                        } else {
                            const remainder = ClauseNumberDetector.getRemainder(line);
                            if (remainder) {
                                rows.push(remainder);
                            }
                        }
                    } else if (ClauseNumberDetector.isSubClause(line)) {
                        rows.push(line);
                    } else {
                        rows.push(line);
                    }
                }
            }

            // Add empty row between paragraphs
            if (paragraph !== paragraphs[paragraphs.length - 1]) {
                rows.push('');
            }
        }

        return rows;
    },

    /**
     * Advanced splitting with better whitespace handling
     * Removes extra whitespace within rows but preserves internal formatting
     * 
     * @param {string} text - Input text
     * @returns {Array<string>}
     */
    splitWithNormalization(text) {
        const rows = this.splitText(text);
        
        // Normalize each row: trim leading/trailing whitespace
        // but preserve internal whitespace and structure
        return rows.map(row => {
            if (typeof row !== 'string') {
                return row;
            }
            
            // Trim leading and trailing whitespace
            let normalized = row.trim();
            
            // Preserve tabs and special whitespace within the row
            // Only normalize excess spaces
            normalized = normalized.replace(/  +/g, ' ');
            
            return normalized;
        });
    },

    /**
     * Get analysis of splitting without actually splitting
     * Useful for preview or validation
     * 
     * @param {string} text - Text to analyze
     * @returns {Object} Analysis results
     */
    analyzeSplitting(text) {
        if (!text || typeof text !== 'string') {
            return {
                totalLines: 0,
                clauseCount: 0,
                leadingPhraseCount: 0,
                estimatedRows: 0
            };
        }

        const lines = text.split('\n');
        let clauseCount = 0;
        let leadingPhraseCount = 0;
        let estimatedRows = lines.length;

        for (const line of lines) {
            if (ClauseNumberDetector.hasClauseNumber(line)) {
                clauseCount++;
                estimatedRows++; // Clause number gets own row
                
                if (LeadingPhraseDetector.hasLeadingPhrase(line)) {
                    leadingPhraseCount++;
                    estimatedRows++; // Leading phrase gets own row
                    
                    const content = LeadingPhraseDetector.getContentAfterPhrase(line);
                    if (content) {
                        estimatedRows++; // Content gets own row
                    }
                }
            }
        }

        return {
            totalLines: lines.length,
            clauseCount: clauseCount,
            leadingPhraseCount: leadingPhraseCount,
            estimatedRows: estimatedRows,
            nonEmptyLines: lines.filter(l => l.trim() !== '').length
        };
    },

    /**
     * Split with language detection
     * Handles English and Devanagari mixed text
     * 
     * @param {string} text - Input text
     * @returns {Array<string>}
     */
    splitWithLanguageDetection(text) {
        const rows = [];
        const lines = text.split('\n');

        for (const line of lines) {
            const hasDevanagari = DevanagariParser.hasDevanagari(line);
            
            if (ClauseNumberDetector.hasClauseNumber(line)) {
                // Handle clause splitting
                rows.push(ClauseNumberDetector.getClauseNumberRow(line));
                
                const leadingPhrase = LeadingPhraseDetector.getLeadingPhrase(line);
                const contentAfterPhrase = LeadingPhraseDetector.getContentAfterPhrase(line);
                
                if (leadingPhrase) {
                    rows.push(leadingPhrase);
                    if (contentAfterPhrase) {
                        rows.push(contentAfterPhrase);
                    }
                } else {
                    const remainder = ClauseNumberDetector.getRemainder(line);
                    if (remainder) {
                        rows.push(remainder);
                    }
                }
            } else {
                rows.push(line);
            }
        }

        return rows;
    },

    /**
     * Check if splitting will produce many rows
     * Useful for warning user about large outputs
     * 
     * @param {string} text - Input text
     * @returns {boolean}
     */
    isLargeDocument(text) {
        if (!text) return false;
        const analysis = this.analyzeSplitting(text);
        return analysis.estimatedRows > 1000;
    },

    /**
     * Get splitting statistics
     * @param {string} text - Input text
     * @returns {Object} Statistics
     */
    getStatistics(text) {
        const lines = text.split('\n');
        const analysis = this.analyzeSplitting(text);

        return {
            ...analysis,
            avgLineLength: lines.length > 0 ? 
                text.length / lines.length : 0,
            hasDevanagari: DevanagariParser.hasDevanagari(text),
            hasAmendments: text.includes('*') || text.includes('†') || 
                          text.includes('‡') || text.includes('☑'),
            characterCount: text.length,
            wordCount: text.split(/\s+/).filter(w => w.length > 0).length
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextSplitter;
}
