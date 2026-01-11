/**
 * Main Application Initialization
 * Coordinates all modules and starts the application
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing Legal Text Splitter...');

        // Check for required libraries
        this.checkDependencies();

        // Initialize modules (order matters)
        this.initializeModules();

        // Setup event listeners
        this.setupGlobalListeners();

        // Enable service worker if available (for offline support)
        this.registerServiceWorker();

        console.log('Legal Text Splitter initialized successfully');

        // Dispatch initialization event
        window.dispatchEvent(new Event('appInitialized'));
    },

    /**
     * Check for required libraries and features
     */
    checkDependencies() {
        const issues = [];

        // Check for JSON support
        if (typeof JSON === 'undefined') {
            issues.push('JSON support required');
        }

        // Check for Blob support
        if (typeof Blob === 'undefined') {
            issues.push('Blob API required');
        }

        // Check for FileReader
        if (typeof FileReader === 'undefined') {
            issues.push('FileReader API required');
        }

        // Warn about PDF.js if not loaded
        if (typeof pdfjsLib === 'undefined') {
            console.warn('PDF.js not loaded - PDF support will be unavailable');
        }

        // Warn about mammoth if not loaded
        if (typeof mammoth === 'undefined') {
            console.warn('Mammoth.js not loaded - DOCX support will be unavailable');
        }

        if (issues.length > 0) {
            console.error('Missing dependencies:', issues);
            alert('Your browser does not support some required features. Please use a modern browser.');
        }
    },

    /**
     * Initialize all application modules
     */
    initializeModules() {
        // Note: Module order matters - dependencies should be initialized after their dependencies
        
        // Core parsers (no dependencies)
        console.log('Initializing parsers...');
        // DevanagariParser - already available globally
        // ClauseNumberDetector - already available globally
        // LeadingPhraseDetector - already available globally

        // Text processing
        console.log('Initializing text processing...');
        // TextSplitter - already available globally
        // RowGenerator - already available globally
        // TextExtractor - already available globally

        // UI modules
        console.log('Initializing UI modules...');
        FileUploadHandler.init();
        TableRenderer.init?.();
        ExportHandler.init();
        CopyHandler.init();
        UIController.init();
    },

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Listen for split completion
        window.addEventListener('splitCompleted', (e) => {
            console.log('Split completed:', e.detail.stats);
            this.onSplitCompleted(e.detail);
        });

        // Listen for content cleared
        window.addEventListener('contentCleared', () => {
            console.log('Content cleared');
            this.onContentCleared();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });

        // Prevent accidental page unload if there's unsaved data
        window.addEventListener('beforeunload', (e) => {
            const state = UIController.getState();
            if (state.inputText.trim().length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },

    /**
     * Handle split completion event
     * @param {Object} detail - Event detail
     */
    onSplitCompleted(detail) {
        // Can be used for analytics, logging, etc.
        console.log(`Split completed: ${detail.stats.totalRows} rows`);
    },

    /**
     * Handle content cleared event
     */
    onContentCleared() {
        // Any cleanup needed after clear
    },

    /**
     * Handle window resize
     */
    onWindowResize() {
        // Handle responsive adjustments if needed
    },

    /**
     * Handle global keyboard shortcuts
     * @param {KeyboardEvent} e - Key event
     */
    handleGlobalKeydown(e) {
        // Ctrl+A or Cmd+A in textarea
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            const inputTextArea = document.getElementById('inputTextArea');
            if (document.activeElement === inputTextArea) {
                e.preventDefault();
                inputTextArea.select();
            }
        }

        // Ctrl+Z or Cmd+Z - could implement undo in future
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            // Future: implement undo functionality
        }
    },

    /**
     * Register service worker for offline support
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    },

    /**
     * Show version info
     */
    showVersion() {
        const version = '1.0.0';
        const date = '2024-01-11';
        console.log(`Legal Text Splitter v${version} (${date})`);
    },

    /**
     * Get application info
     * @returns {Object}
     */
    getInfo() {
        return {
            name: 'Legal Text Splitter',
            version: '1.0.0',
            description: 'Step 1: Split legal documents into rows',
            features: [
                'File upload (TXT, DOCX, PDF)',
                'Direct text paste',
                'English & Devanagari support',
                'Clause number detection',
                'Leading phrase extraction',
                'Multiple export formats',
                'Copy to clipboard'
            ],
            supportedLanguages: ['English', 'Devanagari (देवनागरी)'],
            exportFormats: ['Text', 'CSV', 'JSON'],
            fileFormats: ['TXT', 'DOCX', 'PDF']
        };
    }
};

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    // DOM is already loaded
    App.init();
}

// Make App available globally for debugging
window.App = App;

// Log version on load
App.showVersion();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
