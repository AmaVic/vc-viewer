class GenericTheme extends BaseTheme {
    static info = {
        id: 'generic',
        name: 'Generic Theme',
        description: 'A clean, modern theme suitable for any type of Verifiable Credential',
        author: 'VC Viewer Team'
    };

    // Support any type of VC by making this theme the default fallback
    static supportedTypes = ['*'];

    constructor(credential) {
        super(credential);
        this.subject = credential.credentialSubject;
    }

    getThemeIcon() {
        return '<i class="fas fa-certificate"></i>';
    }

    getThemeTitle() {
        // Try to infer a meaningful title from the credential content
        if (this.subject) {
            // Check for common credential properties to infer type
            if (this.subject.licenseNumber && this.subject.categories) {
                return 'Driver License';
            }
            if (this.subject.degree) {
                return 'Academic Degree';
            }
            if (this.subject.email) {
                return 'Email Credential';
            }
            if (this.subject.membershipNumber || this.subject.organization) {
                return 'Membership Credential';
            }
        }

        // Default to generic title
        return 'Verifiable Credential';
    }

    formatTypeName(type) {
        // Convert camelCase or PascalCase to space-separated words
        return type
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    formatValue(value) {
        if (value === null || value === undefined) {
            return '-';
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (typeof value === 'string' || typeof value === 'number') {
            return value.toString();
        }
        if (Array.isArray(value)) {
            if (value.length === 0) return '-';
            if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
                return value.join(', ');
            }
            return JSON.stringify(value, null, 2);
        }
        if (typeof value === 'object') {
            if (Object.keys(value).length === 0) return '-';
            
            // Special handling for common nested objects
            if (value.code && value.validUntil) {
                return `${value.code} (Valid until: ${this.formatDate(value.validUntil)})`;
            }
            if (value.streetAddress) {
                return [
                    value.streetAddress,
                    value.postalCode,
                    value.locality,
                    value.country
                ].filter(Boolean).join(', ');
            }
            
            return JSON.stringify(value, null, 2);
        }
        return value.toString();
    }

    isComplexValue(value) {
        if (Array.isArray(value)) {
            return !value.every(item => typeof item === 'string' || typeof item === 'number');
        }
        return typeof value === 'object' && value !== null;
    }

    renderDataItem(label, value) {
        const isComplex = this.isComplexValue(value);
        const formattedValue = this.formatValue(value);
        return `
            <div class="data-item">
                <div class="data-label">${label}</div>
                <div class="data-value ${isComplex ? 'complex' : ''}">${formattedValue}</div>
            </div>
        `;
    }

    renderDataSection(title, data) {
        if (!data || Object.keys(data).length === 0) return '';
        
        const items = Object.entries(data).map(([key, value]) => 
            this.renderDataItem(this.formatTypeName(key), value)
        ).join('');

        return `
            <div class="data-section">
                <div class="section-title">${title}</div>
                ${items}
            </div>
        `;
    }

    getContentHTML() {
        // Extract credential subject data
        const subjectData = { ...this.subject };
        delete subjectData.id;  // Remove id as it's typically not needed for display

        // Get all credential types
        const types = Array.isArray(this.credential.type) 
            ? this.credential.type 
            : [this.credential.type];

        // Filter out base VC types for display (case insensitive)
        const displayTypes = types.filter(t => !/^verifiablecredential$/i.test(t));

        // If no specific types found, try to infer from content
        const typeDisplay = displayTypes.length > 0
            ? displayTypes.join(' • ')
            : this.getThemeTitle();

        return `
            <div class="credential-banner">
                ${this.getThemeIcon()}
                <h1>${typeDisplay}</h1>
                <div class="issuer-name">${this.getIssuerName()}</div>
            </div>
            <div class="credential-content">
                <div class="content-card">
                    <div class="credential-data">
                        <div class="data-grid">
                            ${this.renderDataSection('Credential Subject', subjectData)}
                        </div>
                    </div>
                </div>
            </div>
            ${this.getBaseFooterHTML()}
        `;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper generic-theme';
        wrapper.innerHTML = this.getContentHTML();
        return wrapper;
    }
}

// Register the theme
BaseTheme.register(GenericTheme); 