/**
 * History Manager
 * Manages browser history storage (localStorage)
 * Keeps track of the last 6 splits
 */

const HistoryManager = {
    MAX_HISTORY_ITEMS: 6,
    STORAGE_KEY: 'legalTextSplitterHistory',
    
    /**
     * Initialize history manager
     */
    init() {
        this.loadHistory();
        this.renderHistoryUI();
        this.setupEventListeners();
    },

    /**
     * Setup event listeners for history UI
     */
    setupEventListeners() {
        const clearButton = document.getElementById('historyLargeScreen');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                    this.clearHistory();
                }
            });
        }
    },

    /**
     * Add a new history item
     * @param {Object} item - History item to add
     * {text: string, rows: Array, timestamp: number, rowCount: number}
     */
    addHistoryItem(item) {
        const history = this.getHistory();
        
        // Add new item to beginning
        const newItem = {
            ...item,
            id: Date.now(),
            timestamp: item.timestamp || new Date().toISOString()
        };
        
        history.unshift(newItem);
        
        // Keep only MAX_HISTORY_ITEMS
        if (history.length > this.MAX_HISTORY_ITEMS) {
            history.pop();
        }
        
        this.saveHistory(history);
        this.renderHistoryUI();
        return newItem;
    },

    /**
     * Get all history items
     * @returns {Array} Array of history items
     */
    getHistory() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading history from localStorage:', error);
            return [];
        }
    },

    /**
     * Save history to localStorage
     * @param {Array} history - History array to save
     */
    saveHistory(history) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving history to localStorage:', error);
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded. Clearing old history.');
                localStorage.removeItem(this.STORAGE_KEY);
            }
        }
    },

    /**
     * Get a specific history item by ID
     * @param {number} id - History item ID
     * @returns {Object|null} History item or null if not found
     */
    getHistoryItem(id) {
        const history = this.getHistory();
        return history.find(item => item.id === id) || null;
    },

    /**
     * Remove a history item by ID
     * @param {number} id - History item ID
     */
    removeHistoryItem(id) {
        let history = this.getHistory();
        history = history.filter(item => item.id !== id);
        this.saveHistory(history);
        this.renderHistoryUI();
    },

    /**
     * Clear all history
     */
    clearHistory() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.renderHistoryUI();
    },

    /**
     * Load history from localStorage
     */
    loadHistory() {
        const history = this.getHistory();
        return history;
    },

    /**
     * Render history UI
     */
    renderHistoryUI() {
        const historyContainer = document.getElementById('historyContainer');
        const historyList = document.getElementById('historyList');
        const noHistoryMsg = document.getElementById('noHistoryMessage');
        
        if (!historyContainer || !historyList) return;
        
        const history = this.getHistory();
        
        // Clear existing list
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            if (noHistoryMsg) noHistoryMsg.style.display = 'block';
            historyContainer.classList.add('empty');
            return;
        }
        
        if (noHistoryMsg) noHistoryMsg.style.display = 'none';
        historyContainer.classList.remove('empty');
        
        // Render each history item
        history.forEach((item, index) => {
            const historyItem = this.createHistoryItemElement(item, index);
            historyList.appendChild(historyItem);
        });
    },

    /**
     * Create a history item HTML element
     * @param {Object} item - History item
     * @param {number} index - Item index
     * @returns {HTMLElement}
     */
    createHistoryItemElement(item, index) {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.dataset.id = item.id;
        
        // Format timestamp
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString();
        
        // Truncate preview text
        const preview = item.text.substring(0, 60).replace(/\n/g, ' ');
        const truncated = preview.length > 60 ? preview + '...' : preview;
        
        div.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-preview">${this.escapeHtml(truncated)}</div>
                <div class="history-item-meta">
                    <span class="history-item-rows">${item.rowCount || 0} rows</span>
                    <span class="history-item-time">${timeStr}</span>
                </div>
            </div>
            <div class="history-item-actions">
                <button class="history-btn-restore" data-id="${item.id}" title="Restore">↩️</button>
                <button class="history-btn-delete" data-id="${item.id}" title="Delete">🗑️</button>
            </div>
        `;
        
        // Add event listeners
        const restoreBtn = div.querySelector('.history-btn-restore');
        const deleteBtn = div.querySelector('.history-btn-delete');
        
        restoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.restoreHistoryItem(item.id);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeHistoryItem(item.id);
        });
        
        return div;
    },

    /**
     * Restore a history item to the textarea
     * @param {number} id - History item ID
     */
    restoreHistoryItem(id) {
        const item = this.getHistoryItem(id);
        if (!item) return;
        
        const textarea = document.getElementById('inputTextArea');
        if (textarea) {
            textarea.value = item.text;
            textarea.focus();
            
            // Trigger split automatically
            const splitButton = document.getElementById('splitButton');
            if (splitButton) {
                splitButton.click();
            }
        }
    },

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string}
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Get history statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        const history = this.getHistory();
        const totalRows = history.reduce((sum, item) => sum + (item.rowCount || 0), 0);
        const avgRows = history.length > 0 ? Math.round(totalRows / history.length) : 0;
        
        return {
            totalItems: history.length,
            totalRows: totalRows,
            averageRows: avgRows,
            oldestItem: history[history.length - 1]?.timestamp,
            newestItem: history[0]?.timestamp
        };
    },

    /**
     * Export history as JSON
     * @returns {string} JSON string
     */
    exportHistory() {
        const history = this.getHistory();
        return JSON.stringify(history, null, 2);
    },

    /**
     * Import history from JSON
     * @param {string} jsonString - JSON history data
     * @returns {boolean} Success or failure
     */
    importHistory(jsonString) {
        try {
            const history = JSON.parse(jsonString);
            if (!Array.isArray(history)) return false;
            
            // Validate items
            if (!history.every(item => item.text && item.timestamp)) return false;
            
            // Limit to MAX_HISTORY_ITEMS
            const filtered = history.slice(0, this.MAX_HISTORY_ITEMS);
            this.saveHistory(filtered);
            this.renderHistoryUI();
            return true;
        } catch (error) {
            console.error('Error importing history:', error);
            return false;
        }
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        HistoryManager.init();
    });
} else {
    HistoryManager.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}
