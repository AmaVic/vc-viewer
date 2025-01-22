class BaseTheme {
    constructor(credential) {
        this.credential = credential;
        this.logger = window.logger;
    }

    // Parse ISO date string to Date object
    parseDate(dateStr) {
        try {
            return new Date(dateStr);
        } catch (e) {
            this.logger.error('Error parsing date', { dateStr, error: e });
            return null;
        }
    }

    // Format date with options
    formatDate(dateStr, options = {}) {
        const date = this.parseDate(dateStr);
        if (!date) return dateStr;

        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        };

        try {
            return date.toLocaleDateString(undefined, defaultOptions);
        } catch (e) {
            this.logger.error('Error formatting date', { date, error: e });
            return dateStr;
        }
    }

    // Format date and time
    formatDateTime(dateStr, options = {}) {
        const date = this.parseDate(dateStr);
        if (!date) return dateStr;

        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };

        try {
            return date.toLocaleString(undefined, defaultOptions);
        } catch (e) {
            this.logger.error('Error formatting datetime', { date, error: e });
            return dateStr;
        }
    }

    // Core rendering method that all themes must implement
    render() {
        throw new Error('render() method must be implemented by theme');
    }

    // Common utility methods that all themes can use
    getIssuerName() {
        const { issuer } = this.credential;
        return typeof issuer === 'string' 
            ? issuer 
            : issuer.name || issuer.id || 'Unknown Issuer';
    }

    truncateId(id, maxLength = 30) {
        if (!id || id.length <= maxLength) return id;
        const start = id.substring(0, maxLength / 2);
        const end = id.substring(id.length - maxLength / 2);
        return `${start}...${end}`;
    }

    // Common HTML structure that all credentials will use
    getBaseHTML() {
        return `
            <div class="credential-wrapper">
                <div class="credential-banner">
                    ${this.getBannerContent()}
                </div>
                <div class="credential-content">
                    ${this.getContentHTML()}
                </div>
                <div class="credential-footer">
                    ${this.getFooterContent()}
                </div>
            </div>
        `;
    }

    // Methods that themes can override to customize specific parts
    getBannerContent() {
        return `
            <div class="credential-icon">
                ${this.getThemeIcon()}
            </div>
            <div class="credential-title">
                <h4>${this.getThemeTitle()}</h4>
            </div>
        `;
    }

    getContentHTML() {
        return ''; // Themes must implement this
    }

    getFooterContent() {
        return `
            <div class="issuer-info">
                <small class="text-muted">Issued by</small>
                <div class="issuer-name">${this.getIssuerName()}</div>
            </div>
            <div class="credential-meta">
                <small class="text-muted">Issuance Date</small>
                <div class="issuance-date">${this.formatDate(this.credential.issuanceDate)}</div>
            </div>
            ${this.credential.id ? `
                <div class="credential-id">
                    <small>Credential ID: ${this.truncateId(this.credential.id)}</small>
                </div>
            ` : ''}
        `;
    }

    // Methods that themes must implement
    getThemeIcon() {
        throw new Error('getThemeIcon() must be implemented by theme');
    }

    getThemeTitle() {
        throw new Error('getThemeTitle() must be implemented by theme');
    }

    // Static methods for theme registration and management
    static register(type, themeClass) {
        if (!BaseTheme.themes) BaseTheme.themes = new Map();
        BaseTheme.themes.set(type, themeClass);
    }

    static getTheme(type) {
        return BaseTheme.themes?.get(type) || null;
    }

    static getAllThemes() {
        return Array.from(BaseTheme.themes?.keys() || []);
    }
}

// Export for use in other files
window.BaseTheme = BaseTheme; 