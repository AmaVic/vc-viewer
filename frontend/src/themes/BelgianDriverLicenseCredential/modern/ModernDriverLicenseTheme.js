class ModernDriverLicenseTheme extends BaseTheme {
    static info = {
        id: 'modern',
        name: 'Modern Driver License Theme',
        description: 'A sleek and modern design for Belgian driver licenses',
        author: 'VC Viewer Team',
        supportedTypes: ['BelgianDriverLicenseCredential']
    };

    constructor(credential) {
        super(credential);
        if (credential) {
            this.subject = credential.credentialSubject;
        }
    }

    getThemeIcon() {
        return '<i class="fas fa-id-card"></i>';
    }

    getThemeTitle() {
        return this.getIssuerName();
    }

    getContentHTML() {
        if (!this.credential || !this.subject) return '';

        return `
            <div class="modern-driver-license-theme">
                <div class="credential-banner">
                    ${this.getThemeIcon()}
                    <h1>${this.getThemeTitle()}</h1>
                    <span class="issuer-name">Driver License</span>
                </div>
                <div class="license-content">
                    <div class="personal-info">
                        <div class="info-item">
                            <span class="info-label">Full Name</span>
                            <span class="info-value">${this.subject.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Date of Birth</span>
                            <span class="info-value">${this.formatDate(this.subject.dateOfBirth)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">License Number</span>
                            <span class="info-value">${this.subject.licenseNumber}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Nationality</span>
                            <span class="info-value">${this.subject.nationality}</span>
                        </div>
                    </div>

                    <div class="categories-section">
                        <h3 class="categories-title">License Categories</h3>
                        <div class="categories-grid">
                            ${this.subject.categories.map(cat => `
                                <div class="category-item">
                                    <div class="category-code">${cat.code}</div>
                                    <div class="category-validity">${this.formatDate(cat.validUntil)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    ${this.subject.restrictions ? `
                        <div class="restrictions-section">
                            <h3 class="restrictions-title">Restrictions</h3>
                            <ul class="restrictions-list">
                                ${this.subject.restrictions.map(r => `
                                    <li>${r}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="address-section">
                        <h3 class="address-title">Address</h3>
                        <div class="address-content">
                            ${this.subject.address.streetAddress}<br>
                            ${this.subject.address.postalCode} ${this.subject.address.locality}<br>
                            ${this.subject.address.country}
                        </div>
                    </div>

                    <div class="validity-section">
                        <div class="validity-info">
                            <span class="validity-label">Valid Until</span>
                            <span class="validity-value">${this.formatDate(this.subject.validUntil)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="credential-footer">
                    <div class="credential-info">
                        <div class="info-item">
                            <span class="label">Issued On:</span>
                            <span class="value">${this.formatDate(this.credential.issuanceDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Credential ID:</span>
                            <span class="value">${this.credential.id}</span>
                        </div>
                    </div>
                    <div class="credential-links">
                        <a href="#" class="credential-link" onclick="window.viewOriginalCredential()">
                            <i class="fas fa-external-link-alt"></i>
                            View Original Credential
                        </a>
                        <span class="powered-by">
                            Powered by <a href="https://vc-viewer.vamaralds.be" target="_blank">VC Viewer</a>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Register the theme
BaseTheme.register('BelgianDriverLicenseCredential', ModernDriverLicenseTheme); 