/**
 * Export Handler
 * Handles exporting rows in various formats
 */

const ExportHandler = {
    /**
     * Initialize export handlers
     */
    init() {
        const exportButton = document.getElementById('exportButton');
        const exportDropdown = document.getElementById('exportDropdown');
        const exportLinks = exportDropdown?.querySelectorAll('a');

        if (!exportButton || !exportDropdown) {
            console.warn('Export elements not found');
            return;
        }

        // Toggle dropdown
        exportButton.addEventListener('click', (e) => {
            e.preventDefault();
            exportDropdown.classList.toggle('show');
        });

        // Handle export options (use explicit ExportHandler reference)
        exportLinks?.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const format = link.dataset.format;
                ExportHandler.exportRows(format);
                exportDropdown.classList.remove('show');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-wrapper')) {
                exportDropdown.classList.remove('show');
            }
        });

        // Ensure export button enables when splitting completes
        window.addEventListener('splitCompleted', (e) => {
            const rows = e?.detail?.rows || TableRenderer.getRows();
            if (rows && rows.length > 0) {
                exportButton.disabled = false;
            }
        });
    },

    /**
     * Export rows in specified format
     * @param {string} format - 'text', 'csv', 'tsv', 'psv', or 'json'
     */
    exportRows(format) {
        const collapseCheckbox = document.getElementById('collapseEmptyRows');
        const shouldCollapse = collapseCheckbox?.checked || false;
        
        const displayRows = TableRenderer.getDisplayRows(shouldCollapse, shouldCollapse);

        if (!displayRows || displayRows.length === 0) {
            FileUploadHandler.showStatus('No rows to export', 'error');
            return;
        }

        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
            case 'text':
                content = this.exportAsText(displayRows);
                filename = 'legal-text-split.txt';
                mimeType = 'text/plain';
                break;

            case 'csv':
                content = this.exportAsDelimited(displayRows, ',');
                filename = 'legal-text-split.csv';
                mimeType = 'text/csv';
                break;

            case 'tsv':
                content = this.exportAsDelimited(displayRows, '\t');
                filename = 'legal-text-split.tsv';
                mimeType = 'text/tab-separated-values';
                break;

            case 'psv':
                content = this.exportAsDelimited(displayRows, '|');
                filename = 'legal-text-split.psv';
                mimeType = 'text/plain';
                break;

            case 'json':
                content = this.exportAsJson(displayRows);
                filename = 'legal-text-split.json';
                mimeType = 'application/json';
                break;

            default:
                FileUploadHandler.showStatus('Unknown export format', 'error');
                return;
        }

        this.downloadFile(content, filename, mimeType);
        FileUploadHandler.showStatus(`Exported as ${format.toUpperCase()}`, 'success');
    },

    /**
     * Export rows as plain text
     * @param {Array<Object>} rows - Row objects
     * @returns {string}
     */
    exportAsText(rows) {
        const lines = rows.map(row => {
            if (row.isEmpty) {
                return '';
            }
            return `Row ${row.number}: ${row.text}`;
        });

        return lines.join('\n');
    },

    /**
     * Export rows as CSV
     * @param {Array<Object>} rows - Row objects
     * @returns {string}
     */
    exportAsCsv(rows) {
        const lines = [];

        // Header
        lines.push('"Row Number","Text Content"');

        // Data rows
        for (const row of rows) {
            const number = row.number;
            const text = this.escapeCsvValue(row.text);
            lines.push(`"${number}","${text}"`);
        }

        return lines.join('\n');
    },

    /**
     * Export rows as a delimited text (CSV/TSV/PSV)
     * @param {Array<Object>} rows
     * @param {string} delimiter - delimiter character (e.g. ',', '\t', '|')
     * @returns {string}
     */
    exportAsDelimited(rows, delimiter) {
        const lines = [];

        // Header
        const headers = ['Row Number', 'Text Content'];
        lines.push(headers.join(delimiter));

        for (const row of rows) {
            const number = row.number;
            const text = this.escapeDelimitedValue(row.text, delimiter);
            lines.push([number, text].join(delimiter));
        }

        return lines.join('\n');
    },

    /**
     * Escape a value for use in a delimited file (CSV/TSV/PSV)
     * @param {string} value
     * @param {string} delimiter
     * @returns {string}
     */
    escapeDelimitedValue(value, delimiter) {
        if (value === null || value === undefined) return '';
        let v = String(value);
        // Normalize newlines
        v = v.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // Escape double quotes
        v = v.replace(/"/g, '""');
        // If value contains delimiter, newline or double quotes, wrap in double quotes
        if (v.indexOf(delimiter) !== -1 || /[\n\"]/.test(v)) {
            return '"' + v + '"';
        }
        return v;
    },

    /**
     * Export rows as JSON
     * @param {Array<Object>} rows - Row objects
     * @returns {string}
     */
    exportAsJson(rows) {
        const data = {
            metadata: {
                totalRows: rows.length,
                exportDate: new Date().toISOString(),
                statistics: TableRenderer.getStatistics()
            },
            rows: rows.map(row => ({
                number: row.number,
                text: row.text,
                isEmpty: row.isEmpty,
                type: this.getRowType(row),
                language: row.language
            }))
        };

        return JSON.stringify(data, null, 2);
    },

    /**
     * Get row type for export
     * @param {Object} row - Row object
     * @returns {string}
     */
    getRowType(row) {
        if (row.isEmpty) return 'empty';
        if (row.isClauseNumber) return row.isAmendment ? 'amendment-clause' : 'clause-number';
        if (row.isLeadingPhrase) return 'leading-phrase';
        return 'content';
    },

    /**
     * Escape CSV value
     * Handles quotes and special characters
     * @param {string} value - Value to escape
     * @returns {string}
     */
    escapeCsvValue(value) {
        if (!value) return '';

        // Escape double quotes
        let escaped = value.replace(/"/g, '""');

        // Escape newlines for CSV
        escaped = escaped.replace(/\n/g, '\\n').replace(/\r/g, '\\r');

        return escaped;
    },

    /**
     * Download file to user's computer
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType) {
        // Create blob
        const blob = new Blob([content], { type: mimeType });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        window.URL.revokeObjectURL(url);
    },

    /**
     * Export with custom formatter
     * @param {Array<Object>} rows - Row objects
     * @param {Function} formatter - Custom formatting function
     * @returns {string}
     */
    exportWithCustomFormatter(rows, formatter) {
        return rows.map(row => formatter(row)).join('\n');
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ExportHandler.init();
    });
} else {
    ExportHandler.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportHandler;
}
