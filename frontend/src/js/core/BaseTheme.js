class BaseTheme {
    static #themes = new Map();
    static #examples = new Map();

    constructor(credential) {
        this.credential = credential;
        this.logger = window.logger || console;
    }

    // Abstract methods that must be implemented by child classes
    render() {
        throw new Error('render() must be implemented by child class');
    }

    getThemeIcon() {
        throw new Error('getThemeIcon() must be implemented by child class');
    }

    getThemeTitle() {
        throw new Error('getThemeTitle() must be implemented by child class');
    }

    // Utility methods
    formatDate(isoDate) {
        if (!isoDate) return 'Not specified';
        try {
            return new Date(isoDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return isoDate;
        }
    }

    getIssuerName() {
        const { issuer } = this.credential;
        if (typeof issuer === 'string') return issuer;
        return issuer.name || issuer.id || 'Unknown Issuer';
    }

    // Static methods for theme registration and discovery
    static register(credentialType, ThemeClass) {
        if (!ThemeClass.info) {
            throw new Error('Theme must provide static info object');
        }

        if (!ThemeClass.info.name || !ThemeClass.info.description || !ThemeClass.info.author) {
            throw new Error('Theme info must include name, description, and author');
        }

        if (!ThemeClass.supportedTypes || !Array.isArray(ThemeClass.supportedTypes)) {
            throw new Error('Theme must specify supportedTypes array');
        }

        // Register theme for each supported credential type
        ThemeClass.supportedTypes.forEach(type => {
            const themeId = `${type}:${ThemeClass.info.id || ThemeClass.name.toLowerCase()}`;
            this.#themes.set(themeId, ThemeClass);
        });

        // Register example if provided
        if (ThemeClass.example) {
            ThemeClass.supportedTypes.forEach(type => {
                if (!this.#examples.has(type)) {
                    this.#examples.set(type, ThemeClass.example);
                }
            });
        }
    }

    static getTheme(themeId) {
        return this.#themes.get(themeId);
    }

    static getAllThemes() {
        return Array.from(this.#themes.keys());
    }

    static getThemesByType(credentialType) {
        return Array.from(this.#themes.entries())
            .filter(([id]) => id.startsWith(credentialType + ':'))
            .map(([id, ThemeClass]) => ({
                id,
                ...ThemeClass.info
            }));
    }

    static getExample(credentialType) {
        return this.#examples.get(credentialType);
    }

    static getAllExamples() {
        return Object.fromEntries(this.#examples);
    }

    // Helper method to get base HTML structure
    getBaseHTML() {
        return `
            <div class="credential-wrapper ${this.constructor.info.id || this.constructor.name.toLowerCase()}-theme">
                <div class="credential-banner">
                    ${this.getThemeIcon()}
                    <div class="banner-content">
                        ${this.getThemeTitle()}
                    </div>
                </div>
                <div class="credential-content">
                    ${this.getContentHTML()}
                </div>
                <div class="credential-footer">
                    <div class="issuer">Issued by: ${this.getIssuerName()}</div>
                    <div class="issue-date">Date: ${this.formatDate(this.credential.issuanceDate)}</div>
                    <div class="credential-id">ID: ${this.credential.id}</div>
                </div>
            </div>
        `;
    }

    getBaseFooterHTML() {
        return `
            <div class="credential-links">
                <a href="${this.credential.id}" class="certificate-link" target="_blank">
                    <i class="fas fa-external-link-alt"></i> View Certificate
                </a>
                <div class="powered-by">
                    Created with <a href="https://github.com/spruceid/vc-viewer" target="_blank">VC Viewer</a>
                </div>
            </div>
        `;
    }
}

// Add base styles for the footer links that will be consistent across all themes
const style = document.createElement('style');
style.textContent = `
    .credential-links {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
        font-size: 0.875rem;
    }

    .certificate-link {
        color: #3b82f6;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .certificate-link:hover {
        text-decoration: underline;
    }

    .powered-by {
        color: #64748b;
    }

    .powered-by a {
        color: #3b82f6;
        text-decoration: none;
    }

    .powered-by a:hover {
        text-decoration: underline;
    }
`;
document.head.appendChild(style);

// Export for use in other files
window.BaseTheme = BaseTheme; 