class DefaultTheme extends BaseTheme {
    constructor(credential) {
        super(credential);
        this.id = 'default';
        this.name = 'Default Theme';
        this.description = 'A simple theme for any verifiable credential';
        this.author = 'VC Viewer';
        this.supportedTypes = ['VerifiableCredential'];
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper default-theme';
        wrapper.innerHTML = this.getContentHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-certificate fa-2x"></i>';
    }

    getThemeTitle() {
        return `<h4>Verifiable Credential</h4>`;
    }

    getContentHTML() {
        if (!this.credential) return '';
        
        const { credentialSubject } = this.credential;
        
        // Convert credential subject to a formatted list of properties
        const subjectProperties = Object.entries(credentialSubject)
            .filter(([key]) => key !== 'id') // Exclude id as it's shown in footer
            .map(([key, value]) => {
                const formattedKey = key
                    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
                
                let formattedValue = value;
                if (typeof value === 'object' && value !== null) {
                    formattedValue = Object.entries(value)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                }
                
                return `
                    <div class="property-item">
                        <div class="property-label">${formattedKey}</div>
                        <div class="property-value">${formattedValue}</div>
                    </div>
                `;
            })
            .join('');

        return `
            <div class="credential-content">
                <div class="subject-properties">
                    ${subjectProperties}
                </div>
            </div>
            ${this.getBaseFooterHTML()}
        `;
    }
}

// Register the theme
BaseTheme.register(DefaultTheme); 