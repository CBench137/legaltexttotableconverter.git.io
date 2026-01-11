/**
 * Table Renderer
 * Renders split rows into HTML table
 */

const TableRenderer = {
    currentRows: [],

    /**
     * Render rows into the output table
     * @param {Array<Object>} rows - Row objects
     */
    render(rows) {
        this.currentRows = rows;
        
        const tableBody = document.getElementById('tableBody');
        const emptyState = document.getElementById('emptyState');
        const outputTable = document.getElementById('outputTable');
        const rowCounter = document.getElementById('rowCounter');

        if (!tableBody) {
            console.warn('Table body element not found');
            return;
        }

        // Clear existing rows
        tableBody.innerHTML = '';

        if (!rows || rows.length === 0) {
            // Show empty state
            if (emptyState) {
                emptyState.classList.add('show');
            }
            if (outputTable) {
                outputTable.style.display = 'none';
            }
            if (rowCounter) {
                rowCounter.textContent = 'Total: 0 rows';
            }
            return;
        }

        // Hide empty state
        if (emptyState) {
            emptyState.classList.remove('show');
        }
        if (outputTable) {
            outputTable.style.display = '';
        }

        // Render rows
        for (const row of rows) {
            const tr = this.createRowElement(row);
            tableBody.appendChild(tr);
        }

        // Update row counter
        if (rowCounter) {
            rowCounter.textContent = `Total: ${rows.length} rows`;
        }

        // Enable action buttons
        this.updateButtonStates();
    },

    /**
     * Create a table row element
     * @param {Object} row - Row object
     * @returns {HTMLTableRowElement}
     */
    createRowElement(row) {
        const tr = document.createElement('tr');

        // Add classes
        const classes = row.classes || [];
        classes.forEach(cls => tr.classList.add(cls));

        // Number cell
        const tdNumber = document.createElement('td');
        tdNumber.className = 'col-number';
        tdNumber.textContent = row.number;
        tr.appendChild(tdNumber);

        // Content cell
        const tdContent = document.createElement('td');
        tdContent.className = 'col-content';
        
        // Handle empty rows
        if (row.isEmpty) {
            tdContent.innerHTML = '&nbsp;';
        } else {
            // Escape HTML and preserve formatting
            tdContent.textContent = row.text;
        }

        tr.appendChild(tdContent);

        return tr;
    },

    /**
     * Update button states based on whether rows exist
     */
    updateButtonStates() {
        const copyButton = document.getElementById('copyButton');
        const exportButton = document.getElementById('exportButton');
        const clearButton = document.getElementById('clearButton');

        const hasRows = this.currentRows && this.currentRows.length > 0;

        if (copyButton) copyButton.disabled = !hasRows;
        if (exportButton) exportButton.disabled = !hasRows;
        if (clearButton) clearButton.disabled = !hasRows;
    },

    /**
     * Clear all rows from table
     */
    clear() {
        const tableBody = document.getElementById('tableBody');
        const emptyState = document.getElementById('emptyState');
        const outputTable = document.getElementById('outputTable');
        const rowCounter = document.getElementById('rowCounter');

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        if (emptyState) {
            emptyState.classList.add('show');
        }

        if (outputTable) {
            outputTable.style.display = 'none';
        }

        if (rowCounter) {
            rowCounter.textContent = 'Total: 0 rows';
        }

        this.currentRows = [];
        this.updateButtonStates();
    },

    /**
     * Get current rendered rows
     * @returns {Array<Object>}
     */
    getRows() {
        return this.currentRows;
    },

    /**
     * Add a single row to the table
     * @param {Object} row - Row object
     */
    addRow(row) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const tr = this.createRowElement(row);
        tableBody.appendChild(tr);

        this.currentRows.push(row);
        this.updateButtonStates();

        // Update counter
        const rowCounter = document.getElementById('rowCounter');
        if (rowCounter) {
            rowCounter.textContent = `Total: ${this.currentRows.length} rows`;
        }
    },

    /**
     * Remove a row by number
     * @param {number} rowNumber - Row number to remove
     */
    removeRow(rowNumber) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const rows = tableBody.querySelectorAll('tr');
        for (const row of rows) {
            const numberCell = row.querySelector('.col-number');
            if (numberCell && parseInt(numberCell.textContent) === rowNumber) {
                row.remove();
                break;
            }
        }

        this.currentRows = this.currentRows.filter(r => r.number !== rowNumber);
        this.updateButtonStates();
    },

    /**
     * Update row content
     * @param {number} rowNumber - Row number to update
     * @param {string} newText - New text content
     */
    updateRow(rowNumber, newText) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const rows = tableBody.querySelectorAll('tr');
        for (const row of rows) {
            const numberCell = row.querySelector('.col-number');
            if (numberCell && parseInt(numberCell.textContent) === rowNumber) {
                const contentCell = row.querySelector('.col-content');
                if (contentCell) {
                    if (newText.trim() === '') {
                        contentCell.innerHTML = '&nbsp;';
                    } else {
                        contentCell.textContent = newText;
                    }
                }
                break;
            }
        }

        // Update in current rows array
        const rowObj = this.currentRows.find(r => r.number === rowNumber);
        if (rowObj) {
            rowObj.text = newText;
        }
    },

    /**
     * Scroll table to a specific row
     * @param {number} rowNumber - Row number to scroll to
     */
    scrollToRow(rowNumber) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const rows = tableBody.querySelectorAll('tr');
        for (const row of rows) {
            const numberCell = row.querySelector('.col-number');
            if (numberCell && parseInt(numberCell.textContent) === rowNumber) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
        }
    },

    /**
     * Search rows by text content
     * @param {string} searchText - Text to search for
     * @returns {Array<Object>} Matching rows
     */
    search(searchText) {
        const query = searchText.toLowerCase();
        return this.currentRows.filter(row => 
            row.text.toLowerCase().includes(query)
        );
    },

    /**
     * Highlight rows matching criteria
     * @param {Function} predicate - Filter function
     */
    highlightMatching(predicate) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (predicate(this.currentRows[index])) {
                row.classList.add('highlighted');
            } else {
                row.classList.remove('highlighted');
            }
        });
    },

    /**
     * Clear highlighting
     */
    clearHighlighting() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const rows = tableBody.querySelectorAll('tr.highlighted');
        rows.forEach(row => row.classList.remove('highlighted'));
    },

    /**
     * Get statistics about displayed rows
     * @returns {Object} Statistics
     */
    getStatistics() {
        return RowGenerator.getRowStatistics(this.currentRows);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TableRenderer;
}
