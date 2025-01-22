class ClassicDriverLicenseTheme extends BaseTheme {
    constructor(credential) {
        super(credential);
        this.subject = credential.credentialSubject;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper classic-driver-license-theme';
        wrapper.innerHTML = this.getBaseHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-id-card"></i>';
    }

    getThemeTitle() {
        return 'Driver License';
    }

    getBannerContent() {
        return `
            <div class="banner-content">
                <div class="credential-icon">
                    ${this.getThemeIcon()}
                </div>
                <div class="credential-title">
                    <div class="license-title">
                        <h4>Belgian Driver's License</h4>
                        <div class="subtitle">Permis de conduire · Rijbewijs · Führerschein</div>
                    </div>
                </div>
            </div>
        `;
    }

    getContentHTML() {
        return `
            <div class="license-content">
                <div class="license-header">
                    <div class="issuer-info">
                        <img src="/frontend/public/be-logo.png" alt="Belgium" class="country-logo" onerror="this.style.display='none'"/>
                        <h2>${this.getIssuerName()}</h2>
                    </div>
                </div>

                <div class="holder-info">
                    <div class="photo-section">
                        <div class="photo-placeholder">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="signature-box">Signature</div>
                    </div>
                    
                    <div class="personal-details">
                        <div class="info-row">
                            <strong>1.</strong>
                            <span>${this.subject.name}</span>
                        </div>
                        <div class="info-row">
                            <strong>2.</strong>
                            <span>${this.formatDate(this.subject.dateOfBirth)}</span>
                        </div>
                        <div class="info-row">
                            <strong>3.</strong>
                            <span>${this.subject.placeOfBirth}</span>
                        </div>
                        <div class="info-row">
                            <strong>4a.</strong>
                            <span>${this.subject.licenseNumber}</span>
                        </div>
                        <div class="info-row">
                            <strong>4c.</strong>
                            <span>Valid until: ${this.formatDate(this.subject.validUntil)}</span>
                        </div>
                    </div>
                </div>

                <div class="categories-section">
                    <h3>Categories</h3>
                    <div class="categories-grid">
                        ${this.subject.categories.map(cat => `
                            <div class="category-item ${cat.status}">
                                <div class="category-code">${cat.code}</div>
                                <div class="category-validity">
                                    <small>Valid until</small>
                                    <span>${this.formatDate(cat.validUntil)}</span>
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
            </div>
        `;
    }

    static info = {
        name: 'Classic License',
        description: 'Traditional official style driver license layout',
        credentialType: 'BelgianDriverLicenseCredential',
        author: 'VC Viewer',
    };
}

// Register this theme
BaseTheme.register('BelgianDriverLicenseCredential:classic', ClassicDriverLicenseTheme); 