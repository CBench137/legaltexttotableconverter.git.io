/**
 * Text Extractor
 * Handles file reading and text extraction from various formats
 */

const TextExtractor = {
    /**
     * Extract text from a File object
     * Automatically detects format and calls appropriate handler
     * 
     * @param {File} file - File object
     * @returns {Promise<string>} Extracted text
     */
    async extractFromFile(file) {
        const extension = this.getFileExtension(file.name).toLowerCase();

        switch (extension) {
            case 'txt':
                return await this.extractFromText(file);
            case 'docx':
                return await this.extractFromDocx(file);
            case 'pdf':
                return await this.extractFromPdf(file);
            default:
                throw new Error(`Unsupported file format: ${extension}`);
        }
    },

    /**
     * Get file extension from filename
     * @param {string} filename - File name
     * @returns {string} Extension without dot
     */
    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    },

    /**
     * Extract from plain text file
     * @param {File} file - File object
     * @returns {Promise<string>} File text content
     */
    extractFromText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    resolve(text);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read text file'));
            };

            reader.readAsText(file, 'UTF-8');
        });
    },

    /**
     * Extract from DOCX file using mammoth.js
     * Preserves formatting information (bold, underline)
     * 
     * @param {File} file - File object
     * @returns {Promise<string>} Extracted text
     */
    async extractFromDocx(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;

                    // Use mammoth.js to extract text
                    if (typeof mammoth === 'undefined') {
                        reject(new Error('Mammoth.js library not loaded'));
                        return;
                    }

                    const result = await mammoth.extractRawText({ arrayBuffer });
                    resolve(result.value);
                } catch (error) {
                    reject(new Error(`Failed to extract DOCX: ${error.message}`));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read DOCX file'));
            };

            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Extract from PDF file using PDF.js
     * @param {File} file - File object
     * @returns {Promise<string>} Extracted text
     */
    async extractFromPdf(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;

                    if (typeof pdfjsLib === 'undefined') {
                        reject(new Error('PDF.js library not loaded'));
                        return;
                    }

                    // Set PDF.js worker path
                    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                        pdfjsLib.GlobalWorkerOptions.workerSrc =
                            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    }

                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let fullText = '';

                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }

                    resolve(fullText.trim());
                } catch (error) {
                    reject(new Error(`Failed to extract PDF: ${error.message}`));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read PDF file'));
            };

            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Validate file before extraction
     * Check size and format
     * 
     * @param {File} file - File object
     * @returns {Object} Validation result {valid: boolean, message?: string}
     */
    validateFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!file) {
            return { valid: false, message: 'No file selected' };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                message: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
            };
        }

        const ext = this.getFileExtension(file.name).toLowerCase();
        const supportedFormats = ['txt', 'docx', 'pdf'];

        if (!supportedFormats.includes(ext)) {
            return {
                valid: false,
                message: `Unsupported file format: ${ext}. Supported: ${supportedFormats.join(', ')}`
            };
        }

        return { valid: true };
    },

    /**
     * Get file info for display
     * @param {File} file - File object
     * @returns {Object} File information
     */
    getFileInfo(file) {
        return {
            name: file.name,
            size: file.size,
            sizeFormatted: this.formatFileSize(file.size),
            type: file.type,
            extension: this.getFileExtension(file.name),
            lastModified: new Date(file.lastModified).toLocaleString()
        };
    },

    /**
     * Format file size for display
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Extract text from multiple files
     * @param {FileList} files - List of files
     * @returns {Promise<Array>} Array of extraction results
     */
    async extractFromMultipleFiles(files) {
        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validation = this.validateFile(file);

            if (!validation.valid) {
                results.push({
                    file: file.name,
                    success: false,
                    error: validation.message
                });
                continue;
            }

            try {
                const text = await this.extractFromFile(file);
                results.push({
                    file: file.name,
                    success: true,
                    text: text,
                    length: text.length
                });
            } catch (error) {
                results.push({
                    file: file.name,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    },

    /**
     * Detect encoding of text
     * Simple detection for UTF-8, UTF-16, etc.
     * 
     * @param {string} text - Text to analyze
     * @returns {string} Detected encoding
     */
    detectEncoding(text) {
        // Simple check for UTF-8 (contains non-ASCII UTF-8 sequences)
        if (/[\u0080-\uFFFF]/.test(text)) {
            return 'UTF-8 (with non-ASCII characters)';
        }
        return 'ASCII';
    },

    /**
     * Clean extracted text
     * Removes BOM, normalizes line endings, etc.
     * 
     * @param {string} text - Raw extracted text
     * @returns {string} Cleaned text
     */
    cleanText(text) {
        if (!text) return '';

        let cleaned = text;

        // Remove BOM if present
        if (cleaned.charCodeAt(0) === 0xFEFF) {
            cleaned = cleaned.slice(1);
        }

        // Normalize line endings to \n
        cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        return cleaned;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextExtractor;
}
