/**
 * Devanagari Parser
 * Handles Devanagari numeral and letter recognition
 */

const DevanagariParser = {
    // Devanagari digit mapping
    devanagariDigits: {
        '०': '0',
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9'
    },

    // Devanagari letter mapping for alpha-numeric clauses
    devanagariLetters: {
        'क': 'a',
        'ख': 'b',
        'ग': 'c',
        'घ': 'd',
        'ङ': 'e',
        'च': 'f',
        'छ': 'g',
        'ज': 'h',
        'झ': 'i',
        'ञ': 'j',
        'ट': 'k',
        'ठ': 'l',
        'ड': 'm',
        'ढ': 'n',
        'ण': 'o',
        'त': 'p',
        'थ': 'q',
        'द': 'r',
        'ध': 's',
        'न': 't',
        'प': 'u',
        'फ': 'v',
        'ब': 'w',
        'भ': 'x',
        'म': 'y',
        'य': 'z'
    },

    /**
     * Convert Devanagari digits to English digits
     * @param {string} devanagariNumber - Number in Devanagari script
     * @returns {string} Converted English number
     */
    convertDevanagariToEnglish(devanagariNumber) {
        let result = '';
        for (let char of devanagariNumber) {
            result += this.devanagariDigits[char] || char;
        }
        return result;
    },

    /**
     * Check if a string contains Devanagari digits
     * @param {string} text - Text to check
     * @returns {boolean}
     */
    hasDevanagariDigits(text) {
        return /[०-९]/.test(text);
    },

    /**
     * Check if a string contains Devanagari script
     * @param {string} text - Text to check
     * @returns {boolean}
     */
    hasDevanagari(text) {
        return /[\u0900-\u097F]/.test(text);
    },

    /**
     * Extract Devanagari numeral from text
     * Handles both simple (१, २) and alpha-numeric (१क, २ख)
     * @param {string} text - Text to extract from
     * @returns {string|null} Extracted Devanagari numeral or null
     */
    extractDevanagariNumeral(text) {
        // Pattern: optional amendment symbols + devanagari digits + optional devanagari letter + dot
        const pattern = /^[☑*†‡§¶•◆■▪▲►]?([०-९]+[क-य]?)\.?/;
        const match = text.match(pattern);
        return match ? match[1] : null;
    },

    /**
     * Extract Devanagari letter (का-य) from numeral string
     * @param {string} numeral - Devanagari numeral string
     * @returns {string|null} The letter character or null
     */
    extractDevanagariLetter(numeral) {
        const lastChar = numeral[numeral.length - 1];
        if (Object.keys(this.devanagariLetters).includes(lastChar)) {
            return lastChar;
        }
        return null;
    },

    /**
     * Get the base number without letter suffix
     * E.g., "५क" returns "५", "३" returns "३"
     * @param {string} numeral - Devanagari numeral
     * @returns {string}
     */
    getBaseNumber(numeral) {
        if (this.extractDevanagariLetter(numeral)) {
            return numeral.slice(0, -1);
        }
        return numeral;
    },

    /**
     * Normalize Devanagari numeral (remove formatting, convert to standard form)
     * @param {string} numeral - Devanagari numeral
     * @returns {string}
     */
    normalizeDevanagariNumeral(numeral) {
        // Remove any extra whitespace
        return numeral.trim();
    },

    /**
     * Get English equivalent of Devanagari numeral
     * Converts both digits and letters
     * @param {string} devanagariNumeral - Devanagari numeral
     * @returns {string}
     */
    getEnglishEquivalent(devanagariNumeral) {
        let result = '';
        
        for (let char of devanagariNumeral) {
            if (this.devanagariDigits[char]) {
                result += this.devanagariDigits[char];
            } else if (this.devanagariLetters[char]) {
                result += this.devanagariLetters[char];
            } else {
                result += char;
            }
        }
        
        return result;
    },

    /**
     * Check if a Devanagari numeral is alpha-numeric (has a letter suffix)
     * @param {string} numeral - Devanagari numeral
     * @returns {boolean}
     */
    isAlphaNumeric(numeral) {
        return this.extractDevanagariLetter(numeral) !== null;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DevanagariParser;
}
