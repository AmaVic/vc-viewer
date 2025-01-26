class SelectiveUniversityTheme extends BaseTheme {
    constructor(credential) {
        super(credential);
        this.degree = credential.credentialSubject.degree || {};
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper selective-university-theme';
        wrapper.innerHTML = this.getBaseHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-user-graduate"></i>';
    }

    getThemeTitle() {
        return 'Selective Academic Credential';
    }

    getBannerContent() {
        return `
            <div class="banner-content">
                <div class="credential-icon">
                    ${this.getThemeIcon()}
                </div>
                <div class="credential-title">
                    <h4>${this.getThemeTitle()}</h4>
                    <div class="metadata-grid">
                        <div class="metadata-item">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(this.credential.issuanceDate)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getContentHTML() {
        return `
            <div class="selective-content">
                <div class="main-info">
                    <h1 class="university-name">${this.getIssuerName()}</h1>
                    <div class="degree-info">
                        <h2>${this.degree.name || 'Degree'}</h2>
                        <h3>Conferred upon</h3>
                        <h2 class="recipient-name">${this.credential.credentialSubject.name || 'Unknown Recipient'}</h2>
                        <p class="degree-type">${this.degree.type || ''}</p>
                    </div>
                </div>

                <div class="details-grid">
                    ${this.getDetailsSection()}
                </div>

                <div class="disclosure-notice">
                    <i class="fas fa-info-circle"></i>
                    <span>This is a selective disclosure of the academic credential</span>
                </div>
            </div>
        `;
    }

    getDetailsSection() {
        const details = [
            { label: 'Major', value: this.degree.major },
            { label: 'College', value: this.credential.credentialSubject.college },
            { label: 'Department', value: this.credential.credentialSubject.department },
            { label: 'Graduation Date', value: this.degree.graduationDate ? this.formatDate(this.degree.graduationDate) : 'Not specified' }
        ].filter(detail => detail.value);

        return details.map(detail => `
            <div class="detail-item">
                <div class="detail-label">${detail.label}</div>
                <div class="detail-value">${detail.value}</div>
            </div>
        `).join('');
    }

    static info = {
        name: 'Selective Academic',
        description: 'A selective disclosure view showing only major and essential details',
        credentialType: 'UniversityDegreeCredential',
        author: 'VC Viewer',
    };
}

// Register this theme
BaseTheme.register('UniversityDegreeCredential:selective', SelectiveUniversityTheme); 