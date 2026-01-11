/**
 * Copy Handler
 * Handles copying rows to clipboard
 */

const CopyHandler = {
    /**
     * Initialize copy handlers
     */
    init() {
        const copyButton = document.getElementById('copyButton');

        if (!copyButton) {
            console.warn('Copy button not found');
            return;
        }

        copyButton.addEventListener('click', () => {
            this.copyToClipboard();
        });
    },

    /**
     * Copy rows to clipboard
     */
    async copyToClipboard() {
        const collapseCheckbox = document.getElementById('collapseEmptyRows');
        const shouldCollapse = collapseCheckbox?.checked || false;
        
        const displayRows = TableRenderer.getDisplayRows(shouldCollapse, shouldCollapse);

        if (!displayRows || displayRows.length === 0) {
            FileUploadHandler.showStatus('No rows to copy', 'error');
            return;
        }

        const text = this.formatRowsForCopy(displayRows);

        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                FileUploadHandler.showStatus('Copied to clipboard!', 'success', 3000);
            } else {
                // Fallback to legacy method
                this.fallbackCopyToClipboard(text);
                FileUploadHandler.showStatus('Copied to clipboard!', 'success', 3000);
            }
        } catch (error) {
            FileUploadHandler.showStatus('Failed to copy: ' + error.message, 'error');
        }
    },

    /**
     * Format rows for copying
     * One row per line with row number prefix
     * @param {Array<Object>} rows - Row objects
     * @returns {string}
     */
    formatRowsForCopy(rows) {
        return rows.map(row => {
            if (row.isEmpty) {
                return `Row ${row.number}: `;
            }
            return `Row ${row.number}: ${row.text}`;
        }).join('\n');
    },

    /**
     * Fallback copy to clipboard (legacy)
     * @param {string} text - Text to copy
     */
    fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);

        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    },

    /**
     * Copy specific rows
     * @param {Array<number>} rowNumbers - Row numbers to copy
     */
    copySpecificRows(rowNumbers) {
        const rows = TableRenderer.getRows();
        const selectedRows = rows.filter(r => rowNumbers.includes(r.number));

        if (selectedRows.length === 0) {
            FileUploadHandler.showStatus('No rows selected', 'error');
            return;
        }

        const text = this.formatRowsForCopy(selectedRows);
        this.copyTextToClipboard(text);
    },

    /**
     * Copy as plain text (without row numbers)
     */
    copyAsPlainText() {
        const rows = TableRenderer.getRows();

        if (!rows || rows.length === 0) {
            FileUploadHandler.showStatus('No rows to copy', 'error');
            return;
        }

        const text = rows.map(row => row.text).join('\n');
        this.copyTextToClipboard(text);
    },

    /**
     * Copy as tab-separated values
     */
    copyAsTabSeparated() {
        const rows = TableRenderer.getRows();

        if (!rows || rows.length === 0) {
            FileUploadHandler.showStatus('No rows to copy', 'error');
            return;
        }

        const text = rows.map(row => `${row.number}\t${row.text}`).join('\n');
        this.copyTextToClipboard(text);
    },

    /**
     * Copy text to clipboard (helper)
     * @param {string} text - Text to copy
     */
    async copyTextToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                FileUploadHandler.showStatus('Copied to clipboard!', 'success', 3000);
            } else {
                this.fallbackCopyToClipboard(text);
                FileUploadHandler.showStatus('Copied to clipboard!', 'success', 3000);
            }
        } catch (error) {
            FileUploadHandler.showStatus('Failed to copy: ' + error.message, 'error');
        }
    },

    /**
     * Copy row statistics
     */
    copyStatistics() {
        const stats = TableRenderer.getStatistics();
        const text = this.formatStatistics(stats);
        this.copyTextToClipboard(text);
    },

    /**
     * Format statistics for copying
     * @param {Object} stats - Statistics object
     * @returns {string}
     */
    formatStatistics(stats) {
        const lines = [
            '=== SPLIT STATISTICS ===',
            `Total Rows: ${stats.totalRows}`,
            `Content Rows: ${stats.contentRows}`,
            `Empty Rows: ${stats.emptyRows}`,
            `Clause Numbers: ${stats.clauseNumbers}`,
            `Leading Phrases: ${stats.leadingPhrases}`,
            `Amendment Clauses: ${stats.amendments}`,
            '',
            '=== LANGUAGE BREAKDOWN ===',
            `English: ${stats.languages.english}`,
            `Devanagari: ${stats.languages.devanagari}`,
            `Mixed: ${stats.languages.mixed}`,
            '',
            '=== TEXT STATISTICS ===',
            `Average Row Length: ${stats.averageRowLength.toFixed(2)} characters`,
            `Max Row Length: ${stats.maxRowLength} characters`,
            `Min Row Length: ${stats.minRowLength} characters`,
            `Total Text Length: ${stats.totalTextLength} characters`
        ];

        return lines.join('\n');
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        CopyHandler.init();
    });
} else {
    CopyHandler.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CopyHandler;
}
