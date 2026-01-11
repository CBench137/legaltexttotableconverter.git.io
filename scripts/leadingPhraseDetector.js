/**
 * Leading Phrase Detector
 * Detects text between clause number and first colon (leading phrase)
 */

const LeadingPhraseDetector = {
    /**
     * Detect and extract leading phrase from a line with clause number
     * Pattern: [Clause]. [Leading Phrase]: [Content]
     * 
     * @param {string} line - Line to analyze
     * @param {string} remainder - Text after clause number (from ClauseNumberDetector)
     * @returns {Object|null} {phrase, content} or null if no leading phrase found
     */
    detectLeadingPhrase(line, remainder) {
        if (!remainder) {
            return null;
        }

        // Look for first colon
        const colonIndex = remainder.indexOf(':');
        if (colonIndex === -1) {
            return null;
        }

        // Extract text before colon (leading phrase)
        const leadingPhraseRaw = remainder.substring(0, colonIndex).trim();
        
        // Must have content before colon
        if (!leadingPhraseRaw) {
            return null;
        }

        // Get content after colon
        const contentAfterColon = remainder.substring(colonIndex + 1).trim();

        return {
            phrase: leadingPhraseRaw + ':',  // Include colon with phrase
            content: contentAfterColon || null,  // null if empty
            hasContent: contentAfterColon.length > 0
        };
    },

    /**
     * Check if a line has a leading phrase
     * @param {string} line - Line with clause number
     * @returns {boolean}
     */
    hasLeadingPhrase(line) {
        const clauseDetected = ClauseNumberDetector.detectClauseNumber(line);
        if (!clauseDetected) {
            return false;
        }

        const remainder = ClauseNumberDetector.getRemainder(line);
        if (!remainder) {
            return false;
        }

        return this.detectLeadingPhrase(line, remainder) !== null;
    },

    /**
     * Extract just the leading phrase text (with colon)
     * @param {string} line - Line to analyze
     * @returns {string|null} Leading phrase with colon or null
     */
    getLeadingPhrase(line) {
        const clauseDetected = ClauseNumberDetector.detectClauseNumber(line);
        if (!clauseDetected) {
            return null;
        }

        const remainder = ClauseNumberDetector.getRemainder(line);
        if (!remainder) {
            return null;
        }

        const detected = this.detectLeadingPhrase(line, remainder);
        return detected ? detected.phrase : null;
    },

    /**
     * Extract content after leading phrase (after the colon)
     * @param {string} line - Line to analyze
     * @returns {string|null} Content after colon or null
     */
    getContentAfterPhrase(line) {
        const clauseDetected = ClauseNumberDetector.detectClauseNumber(line);
        if (!clauseDetected) {
            return null;
        }

        const remainder = ClauseNumberDetector.getRemainder(line);
        if (!remainder) {
            return null;
        }

        const detected = this.detectLeadingPhrase(line, remainder);
        return detected && detected.hasContent ? detected.content : null;
    },

    /**
     * Normalize leading phrase by handling whitespace around colon
     * "Evidence in certain cases   :" becomes "Evidence in certain cases:"
     * @param {string} phrase - Raw leading phrase
     * @returns {string} Normalized phrase
     */
    normalizeLeadingPhrase(phrase) {
        // Remove extra whitespace before colon, ensure single space after
        return phrase.replace(/\s*:\s*$/, ':').trim();
    },

    /**
     * Check if leading phrase looks like a definition/explanation header
     * (typically short, ends with colon, may contain key terms)
     * @param {string} phrase - Leading phrase to check
     * @returns {boolean}
     */
    isDefinitionPhrase(phrase) {
        if (!phrase) return false;
        
        // Typically definition phrases are relatively short
        const wordCount = phrase.split(/\s+/).length;
        return wordCount <= 10 && phrase.endsWith(':');
    },

    /**
     * Check if line has minimal content after leading phrase
     * (just a colon with little/no content following)
     * @param {string} line - Line to check
     * @returns {boolean}
     */
    hasMinimalContent(line) {
        const clauseDetected = ClauseNumberDetector.detectClauseNumber(line);
        if (!clauseDetected) {
            return false;
        }

        const remainder = ClauseNumberDetector.getRemainder(line);
        if (!remainder) {
            return false;
        }

        const detected = this.detectLeadingPhrase(line, remainder);
        if (!detected) {
            return false;
        }

        // Check if content after phrase is very short or empty
        return !detected.hasContent || detected.content.length < 10;
    },

    /**
     * Detect leading phrase from DOCX formatting
     * (would need to handle bold/underline info from extraction layer)
     * For now, this is a placeholder for when DOCX formatting info is available
     * 
     * @param {string} text - Text to check
     * @param {Object} formatting - Optional formatting info {bold: [], underline: []}
     * @returns {Array|null} Array of phrase positions or null
     */
    detectFromFormatting(text, formatting) {
        if (!formatting) {
            return null;
        }

        const phrases = [];

        if (formatting.bold) {
            for (const boldRange of formatting.bold) {
                // Check if bold text is followed by colon
                if (boldRange.endIndex < text.length && 
                    text[boldRange.endIndex] === ':') {
                    phrases.push({
                        type: 'bold',
                        startIndex: boldRange.startIndex,
                        endIndex: boldRange.endIndex + 1  // Include colon
                    });
                }
            }
        }

        if (formatting.underline) {
            for (const underlineRange of formatting.underline) {
                if (underlineRange.endIndex < text.length && 
                    text[underlineRange.endIndex] === ':') {
                    phrases.push({
                        type: 'underline',
                        startIndex: underlineRange.startIndex,
                        endIndex: underlineRange.endIndex + 1
                    });
                }
            }
        }

        return phrases.length > 0 ? phrases : null;
    },

    /**
     * Get all leading phrases from a text block
     * @param {string} text - Text to analyze
     * @returns {Array} Array of detected leading phrases with their lines
     */
    extractAllLeadingPhrases(text) {
        const lines = text.split('\n');
        const phrases = [];

        for (let i = 0; i < lines.length; i++) {
            const phrase = this.getLeadingPhrase(lines[i]);
            if (phrase) {
                phrases.push({
                    lineNumber: i,
                    phrase: phrase,
                    fullLine: lines[i]
                });
            }
        }

        return phrases;
    },

    /**
     * Check if text contains Devanagari colon equivalents
     * Devanagari may use '।' (danda) instead of colon
     * @param {string} text - Text to check
     * @returns {boolean}
     */
    hasDevanagariColon(text) {
        return /[:|।]/.test(text);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeadingPhraseDetector;
}
