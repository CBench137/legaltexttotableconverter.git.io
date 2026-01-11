/**
 * File Upload Handler
 * Manages drag-drop and file browsing
 */

const FileUploadHandler = {
    /**
     * Initialize file upload handlers
     * Set up drag-drop and file input listeners
     */
    init() {
        const fileUploadZone = document.getElementById('fileUploadZone');
        const fileInput = document.getElementById('fileInput');
        const browseButton = document.getElementById('browseButton');

        if (!fileUploadZone || !fileInput || !browseButton) {
            console.warn('File upload elements not found');
            return;
        }

        // Browse button click
        browseButton.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag-drop zone
        fileUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileUploadZone.classList.add('drag-over');
        });

        fileUploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileUploadZone.classList.remove('drag-over');
        });

        fileUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileUploadZone.classList.remove('drag-over');

            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // Prevent default browser drag-drop behavior
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    },

    /**
     * Handle file selection
     * @param {File} file - Selected file
     */
    async handleFileSelect(file) {
        const fileUploadZone = document.getElementById('fileUploadZone');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const statusMessage = document.getElementById('statusMessage');
        const inputTextArea = document.getElementById('inputTextArea');

        // Validate file
        const validation = TextExtractor.validateFile(file);
        if (!validation.valid) {
            this.showStatus(validation.message, 'error');
            return;
        }

        // Show loading
        if (loadingIndicator) {
            loadingIndicator.classList.add('active');
        }

        try {
            // Extract text
            const text = await TextExtractor.extractFromFile(file);
            const cleanedText = TextExtractor.cleanText(text);

            // Put text in textarea
            if (inputTextArea) {
                inputTextArea.value = cleanedText;
                inputTextArea.focus();
            }

            // Show success message
            const fileInfo = TextExtractor.getFileInfo(file);
            this.showStatus(
                `Successfully loaded: ${fileInfo.name} (${fileInfo.sizeFormatted})`,
                'success'
            );

            // Update button state
            this.updateButtonStates();
        } catch (error) {
            this.showStatus(`Error: ${error.message}`, 'error');
        } finally {
            // Hide loading
            if (loadingIndicator) {
                loadingIndicator.classList.remove('active');
            }
        }
    },

    /**
     * Show status message to user
     * @param {string} message - Message text
     * @param {string} type - 'success', 'error', 'info'
     * @param {number} duration - Duration in ms (0 = persistent)
     */
    showStatus(message, type = 'info', duration = 5000) {
        const statusElement = document.getElementById('statusMessage');
        if (!statusElement) return;

        statusElement.className = `status-message show ${type}`;
        statusElement.textContent = message;

        if (duration > 0) {
            setTimeout(() => {
                statusElement.classList.remove('show');
            }, duration);
        }
    },

    /**
     * Update button enabled/disabled state
     */
    updateButtonStates() {
        const inputTextArea = document.getElementById('inputTextArea');
        const splitButton = document.getElementById('splitButton');

        if (splitButton) {
            const hasText = inputTextArea && inputTextArea.value.trim().length > 0;
            splitButton.disabled = !hasText;
        }
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        FileUploadHandler.init();
    });
} else {
    FileUploadHandler.init();
}
