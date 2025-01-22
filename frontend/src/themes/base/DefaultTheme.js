class DefaultTheme extends BaseTheme {
    constructor(credential) {
        super(credential);
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper default-theme';
        wrapper.innerHTML = this.getBaseHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-certificate"></i>';
    }

    getThemeTitle() {
        // Get the most specific type from the credential's type array
        const types = this.credential.type;
        return types[types.length - 1] || 'Verifiable Credential';
    }

    getContentHTML() {
        const subject = this.credential.credentialSubject;
        if (!subject) return '';

        // Create a list of all credential subject properties
        const entries = Object.entries(subject)
            .filter(([key]) => key !== 'id') // Exclude id as it's shown in footer
            .map(([key, value]) => {
                const formattedKey = key
                    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
                    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter

                let formattedValue = value;
                if (typeof value === 'object') {
                    formattedValue = JSON.stringify(value, null, 2);
                } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                    formattedValue = this.formatDate(value);
                }

                return `
                    <div class="credential-property">
                        <strong>${formattedKey}</strong>
                        <span>${formattedValue}</span>
                    </div>
                `;
            })
            .join('');

        return `
            <div class="credential-properties">
                ${entries}
            </div>
        `;
    }
}

// Register this theme as the default
BaseTheme.register('default', DefaultTheme); 