class ModernDriverLicenseTheme extends BaseTheme {
    static info = {
        id: 'modern',
        name: 'Modern Driver License Theme',
        description: 'A contemporary design for driver license credentials',
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
        wrapper.innerHTML = this.getBaseHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-id-badge"></i>';
    }

    getThemeTitle() {
        return 'Digital License';
    }

    getBannerContent() {
        return `
            <div class="banner-content">
                <div class="credential-icon">
                    ${this.getThemeIcon()}
                </div>
                <div class="credential-title">
                    <h4>Digital Driver's License</h4>
                    <div class="issuer">${this.getIssuerName()}</div>
                </div>
            </div>
        `;
    }

    getContentHTML() {
        return `
            <div class="license-content">
                <div class="holder-section">
                    <div class="holder-header">
                        <div class="photo-placeholder">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="holder-main-info">
                            <h2>${this.subject.name}</h2>
                            <div class="holder-details">
                                <span><i class="fas fa-calendar"></i> ${this.formatDate(this.subject.dateOfBirth)}</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${this.subject.placeOfBirth}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="license-details">
                        <div class="detail-item">
                            <i class="fas fa-hashtag"></i>
                            <div class="detail-content">
                                <label>License Number</label>
                                <span>${this.subject.licenseNumber}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <div class="detail-content">
                                <label>Valid Until</label>
                                <span>${this.formatDate(this.subject.validUntil)}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-fingerprint"></i>
                            <div class="detail-content">
                                <label>National Number</label>
                                <span>${this.subject.nationalNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="categories-section">
                    <h3><i class="fas fa-check-circle"></i> Authorized Categories</h3>
                    <div class="categories-grid">
                        ${this.subject.categories.map(cat => `
                            <div class="category-card ${cat.status}">
                                <div class="category-header">
                                    <span class="category-code">${cat.code}</span>
                                    <span class="status-indicator"></span>
                                </div>
                                <div class="category-validity">
                                    Valid until<br>
                                    <strong>${this.formatDate(cat.validUntil)}</strong>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${this.subject.restrictions ? `
                    <div class="restrictions-section">
                        <h3><i class="fas fa-exclamation-triangle"></i> Restrictions</h3>
                        <div class="restrictions-list">
                            ${this.subject.restrictions.map(r => `
                                <div class="restriction-item">
                                    <i class="fas fa-info-circle"></i>
                                    <span>${r}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="address-section">
                    <h3><i class="fas fa-home"></i> Address</h3>
                    <div class="address-content">
                        <p>${this.subject.address.streetAddress}</p>
                        <p>${this.subject.address.postalCode} ${this.subject.address.locality}</p>
                        <p>${this.subject.address.country}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Register the theme
BaseTheme.register('BelgianDriverLicenseCredential', ModernDriverLicenseTheme); 