class BaseTheme {
    static themes = {};
    
    constructor(credential) {
        this.credential = credential;
        // Set default values if not provided by child class
        this.id = this.id || 'base';
        this.name = this.name || 'Base Theme';
        this.description = this.description || 'Base theme for verifiable credentials';
        this.author = this.author || 'VC Viewer';
        this.supportedTypes = this.supportedTypes || ['VerifiableCredential'];
    }

    static register(typeOrClass, themeClass = null) {
        try {
            if (themeClass) {
                // Old format: register(type, class)
                const key = `${typeOrClass}:${themeClass.info.id}`;
                BaseTheme.themes[key] = themeClass;
                console.log('Successfully registered theme:', key);
            } else {
                // New format: register(class)
                if (typeOrClass.info && typeOrClass.info.supportedTypes) {
                    // Class has static info property
                    const type = typeOrClass.info.supportedTypes[0];
                    const key = `${type}:${typeOrClass.info.id}`;
                    BaseTheme.themes[key] = typeOrClass;
                    console.log('Successfully registered theme:', key);
                } else {
                    // Fallback for classes without static info
                    const tempInstance = new typeOrClass(null);
                    const key = `${tempInstance.supportedTypes[0]}:${tempInstance.id}`;
                    BaseTheme.themes[key] = typeOrClass;
                    console.log('Successfully registered theme:', key);
                }
            }
        } catch (error) {
            console.error('Failed to register theme:', error);
        }
    }

    static getTheme(themeId) {
        return BaseTheme.themes[themeId];
    }

    static getThemesByType(credentialType) {
        console.debug('Getting themes for credential type:', credentialType);
        const themes = [];
        for (const [key, ThemeClass] of Object.entries(BaseTheme.themes)) {
            try {
                const [type, id] = key.split(':');
                if (type === credentialType) {
                    if (ThemeClass.info) {
                        // Use static info if available
                        themes.push({
                            id: id,
                            name: ThemeClass.info.name,
                            description: ThemeClass.info.description,
                            author: ThemeClass.info.author
                        });
                    } else {
                        // Fallback for old format
                        const tempInstance = new ThemeClass(null);
                        themes.push({
                            id: id,
                            name: tempInstance.name,
                            description: tempInstance.description,
                            author: tempInstance.author
                        });
                    }
                }
            } catch (error) {
                console.error('Error getting theme info:', error);
            }
        }
        return themes;
    }

    getBaseHTML() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper';
        wrapper.innerHTML = this.getContentHTML();
        return wrapper;
    }

    getBaseFooterHTML() {
        if (!this.credential) return '';
        
        return `
            <div class="credential-footer">
                <div class="credential-info">
                    <div class="info-item">
                        <span class="label">Issued On:</span>
                        <span class="value">${new Date(this.credential.issuanceDate).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Issuer:</span>
                        <span class="value">${this.getIssuerName()}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Credential ID:</span>
                        <span class="value">${this.credential.id}</span>
                    </div>
                </div>
                <div class="credential-links">
                    <a href="${this.credential.id}" target="_blank" class="credential-link">
                        <i class="fas fa-external-link-alt"></i>
                        View Original Credential
                    </a>
                    <div class="powered-by">
                        Powered by <a href="/" target="_blank">VC Viewer</a>
                    </div>
                </div>
            </div>
        `;
    }

    getThemeIcon() {
        return '<i class="fas fa-certificate"></i>';
    }

    getThemeTitle() {
        return 'Verifiable Credential';
    }

    getContentHTML() {
        if (!this.credential) return '';
        
        return `
            <div class="credential-banner">
                <div class="banner-content">
                    ${this.getThemeIcon()}
                    <h1>${this.getThemeTitle()}</h1>
                </div>
            </div>
            <div class="credential-content">
                <pre>${JSON.stringify(this.credential, null, 2)}</pre>
            </div>
            ${this.getBaseFooterHTML()}
        `;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper';
        wrapper.innerHTML = this.getContentHTML();
        return wrapper;
    }

    // Helper methods
    getIssuerName() {
        if (!this.credential || !this.credential.issuer) return 'Unknown Issuer';
        return typeof this.credential.issuer === 'string' 
            ? this.credential.issuer 
            : this.credential.issuer.name || this.credential.issuer.id || 'Unknown Issuer';
    }

    formatDate(dateStr) {
        if (!dateStr) return 'Not specified';
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }
} 