class ModernDriverLicenseTheme extends BaseTheme {
    static info = {
        id: 'modern',
        name: 'Modern Driver License Theme',
        description: 'A modern, clean design for driver license credentials',
        author: 'VC Viewer Team'
    };

    static supportedTypes = ['BelgianDriverLicenseCredential'];

    constructor(credential) {
        super(credential);
        this.subject = credential.credentialSubject;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper modern-driver-license-theme';
        wrapper.innerHTML = this.getContentHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-id-card"></i>';
    }

    getThemeTitle() {
        return 'Driver License';
    }

    getContentHTML() {
        return `
            <div class="credential-banner">
                ${this.getThemeIcon()}
                <h1>${this.getThemeTitle()}</h1>
                <div class="issuer-name">${this.getIssuerName()}</div>
            </div>

            <div class="license-content">
                <div class="holder-info">
                    <div class="photo-section">
                        <div class="photo-placeholder">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    
                    <div class="personal-info">
                        <div class="info-row">
                            <div class="info-label">Name</div>
                            <div class="info-value">${this.subject.name}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Date of Birth</div>
                            <div class="info-value">${this.formatDate(this.subject.dateOfBirth)}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Place of Birth</div>
                            <div class="info-value">${this.subject.placeOfBirth}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">National Number</div>
                            <div class="info-value">${this.subject.nationalNumber}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">License Number</div>
                            <div class="info-value">${this.subject.licenseNumber}</div>
                        </div>
                    </div>
                </div>

                <div class="categories-section">
                    <h3>Vehicle Categories</h3>
                    <div class="categories-grid">
                        ${this.subject.categories.map(cat => `
                            <div class="category-item ${cat.status}">
                                <div class="category-name">${cat.code}</div>
                                <div class="category-validity">
                                    Valid until: ${this.formatDate(cat.validUntil)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${this.subject.restrictions ? `
                    <div class="restrictions-section">
                        <h3>Restrictions</h3>
                        <ul class="restrictions-list">
                            ${this.subject.restrictions.map(r => `
                                <li>${r}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="address-section">
                    <h3>Address</h3>
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
            ${this.getBaseFooterHTML()}
        `;
    }
}

// Register the theme
BaseTheme.register('BelgianDriverLicenseCredential', ModernDriverLicenseTheme); 