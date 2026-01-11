/**
 * UI Controller
 * Handles all UI events and state management
 */

const UIController = {
    /**
     * Initialize all UI controls
     */
    init() {
        this.setupEventListeners();
        this.updateInitialState();
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const splitButton = document.getElementById('splitButton');
        const clearButton = document.getElementById('clearButton');
        const inputTextArea = document.getElementById('inputTextArea');
        const collapseEmptyRowsCheckbox = document.getElementById('collapseEmptyRows');

        if (splitButton) {
            splitButton.addEventListener('click', () => this.handleSplit());
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => this.handleClear());
        }

        if (inputTextArea) {
            inputTextArea.addEventListener('input', () => this.updateSplitButtonState());
            inputTextArea.addEventListener('keydown', (e) => this.handleTextAreaKeydown(e));
        }

        if (collapseEmptyRowsCheckbox) {
            collapseEmptyRowsCheckbox.addEventListener('change', () => this.handleCollapseToggle());
        }

        // Listen for content changes
        window.addEventListener('contentUpdated', () => {
            this.updateActionButtonStates();
        });
    },

    /**
     * Update initial UI state
     */
    updateInitialState() {
        this.updateSplitButtonState();
        this.updateActionButtonStates();
    },

    /**
     * Handle split button click
     */
    handleSplit() {
        const inputTextArea = document.getElementById('inputTextArea');
        const text = inputTextArea?.value;

        if (!text || text.trim() === '') {
            FileUploadHandler.showStatus('Please paste or upload legal text first', 'error');
            return;
        }

        // Check for large documents
        if (TextSplitter.isLargeDocument(text)) {
            const confirmed = confirm(
                'This document may produce a large number of rows (>1000). ' +
                'Processing may take a moment. Continue?'
            );
            if (!confirmed) {
                return;
            }
        }

        this.performSplit(text);
    },

    /**
     * Perform the actual splitting
     * @param {string} text - Text to split
     */
    performSplit(text) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const statusMessage = document.getElementById('statusMessage');

        try {
            // Show loading
            if (loadingIndicator) {
                loadingIndicator.classList.add('active');
            }

            // Clear previous status
            if (statusMessage) {
                statusMessage.classList.remove('show');
            }

            // Split text
            const splitRows = TextSplitter.splitWithNormalization(text);

            // Generate row objects
            const rows = RowGenerator.generateRowsFromText(text);
            const enhancedRows = RowGenerator.enhanceRows(rows);

            // Store full rows and compute display rows respecting collapse setting
            TableRenderer.setFullRows(enhancedRows);
            const collapseCheckbox = document.getElementById('collapseEmptyRows');
            const shouldCollapse = collapseCheckbox?.checked || false;
            const displayRows = TableRenderer.getDisplayRows(shouldCollapse, shouldCollapse);

            // Render table (displayRows may be renumbered if collapse is on)
            TableRenderer.render(displayRows);

            // Show success
            const stats = TableRenderer.getStatistics();
            const message = `Successfully split into ${stats.totalRows} rows ` +
                           `(${stats.clauseNumbers} clause numbers, ` +
                           `${stats.leadingPhrases} leading phrases)`;
            FileUploadHandler.showStatus(message, 'success', 5000);

            // Emit event
            this.emitEvent('splitCompleted', { rows: enhancedRows, stats });
        } catch (error) {
            FileUploadHandler.showStatus(`Error: ${error.message}`, 'error');
            console.error('Split error:', error);
        } finally {
            // Hide loading
            if (loadingIndicator) {
                loadingIndicator.classList.remove('active');
            }
        }
    },

    /**
     * Handle clear button click
     */
    handleClear() {
        const confirmed = confirm('Clear all content? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        const inputTextArea = document.getElementById('inputTextArea');
        const fileInput = document.getElementById('fileInput');

        // Clear textarea
        if (inputTextArea) {
            inputTextArea.value = '';
        }

        // Clear file input
        if (fileInput) {
            fileInput.value = '';
        }

        // Clear table
        TableRenderer.clear();

        // Clear status
        const statusMessage = document.getElementById('statusMessage');
        if (statusMessage) {
            statusMessage.classList.remove('show');
        }

        // Update button states
        this.updateSplitButtonState();

        FileUploadHandler.showStatus('Cleared all content', 'info', 2000);

        // Emit event
        this.emitEvent('contentCleared');
    },

    /**
     * Handle collapse empty rows checkbox change
     * Reapplies the current row filtering with new setting
     */
    handleCollapseToggle() {
        const rows = TableRenderer.getRows();
        if (!rows || rows.length === 0) {
            return;
        }

        const collapseCheckbox = document.getElementById('collapseEmptyRows');
        const shouldCollapse = collapseCheckbox?.checked || false;

        // Get the filtered rows based on collapse setting (renumber when collapsing)
        const displayRows = TableRenderer.getDisplayRows(shouldCollapse, shouldCollapse);

        // Re-render table with filtered rows
        TableRenderer.render(displayRows);

        // Update statistics
        const stats = RowGenerator.getRowStatistics(displayRows);
        FileUploadHandler.showStatus(
            `Display updated: ${displayRows.length} row${displayRows.length !== 1 ? 's' : ''}`,
            'info',
            2000
        );

        // Update copy/export buttons
        this.updateActionButtonStates();
    },

    /**
     * Handle textarea key down (Ctrl+Enter to split)
     * @param {KeyboardEvent} e - Key event
     */
    handleTextAreaKeydown(e) {
        // Ctrl+Enter or Cmd+Enter to split
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const splitButton = document.getElementById('splitButton');
            if (splitButton && !splitButton.disabled) {
                this.handleSplit();
            }
        }
    },

    /**
     * Update split button state
     */
    updateSplitButtonState() {
        const inputTextArea = document.getElementById('inputTextArea');
        const splitButton = document.getElementById('splitButton');

        if (splitButton) {
            const hasText = inputTextArea && inputTextArea.value.trim().length > 0;
            splitButton.disabled = !hasText;
        }
    },

    /**
     * Update action button states
     */
    updateActionButtonStates() {
        const rows = TableRenderer.getRows();
        const hasRows = rows && rows.length > 0;

        const copyButton = document.getElementById('copyButton');
        const exportButton = document.getElementById('exportButton');
        const clearButton = document.getElementById('clearButton');

        if (copyButton) copyButton.disabled = !hasRows;
        if (exportButton) exportButton.disabled = !hasRows;
        if (clearButton) clearButton.disabled = !hasRows;
    },

    /**
     * Emit custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail
     */
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    },

    /**
     * Show notification to user
     * @param {string} message - Message text
     * @param {string} type - 'success', 'error', 'info'
     * @param {number} duration - Duration in ms
     */
    showNotification(message, type = 'info', duration = 5000) {
        FileUploadHandler.showStatus(message, type, duration);
    },

    /**
     * Get current application state
     * @returns {Object}
     */
    getState() {
        const inputTextArea = document.getElementById('inputTextArea');
        const collapseEmptyRowsCheckbox = document.getElementById('collapseEmptyRows');
        const rows = TableRenderer.getRows();

        return {
            inputText: inputTextArea?.value || '',
            outputRows: rows,
            collapseEmptyRows: collapseEmptyRowsCheckbox?.checked || false,
            statistics: rows ? RowGenerator.getRowStatistics(rows) : null,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Restore application state
     * @param {Object} state - State to restore
     */
    restoreState(state) {
        if (state.inputText) {
            const inputTextArea = document.getElementById('inputTextArea');
            if (inputTextArea) {
                inputTextArea.value = state.inputText;
            }
        }

        if (state.collapseEmptyRows !== undefined) {
            const collapseEmptyRowsCheckbox = document.getElementById('collapseEmptyRows');
            if (collapseEmptyRowsCheckbox) {
                collapseEmptyRowsCheckbox.checked = state.collapseEmptyRows;
            }
        }

        if (state.outputRows) {
            // Restore full rows into renderer, then render displayRows according to collapse setting
            TableRenderer.setFullRows(state.outputRows);
            const collapseCheckbox = document.getElementById('collapseEmptyRows');
            const shouldCollapse = collapseCheckbox?.checked || false;
            const displayRows = TableRenderer.getDisplayRows(shouldCollapse, shouldCollapse);
            TableRenderer.render(displayRows);
        }

        this.updateInitialState();
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UIController.init();
    });
} else {
    UIController.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
