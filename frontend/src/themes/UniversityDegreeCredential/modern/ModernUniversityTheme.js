class ModernUniversityTheme extends BaseTheme {
    constructor(credential) {
        super(credential);
        this.degree = credential.credentialSubject.degree || {};
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper modern-university-theme';
        wrapper.innerHTML = this.getBaseHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-graduation-cap"></i>';
    }

    getThemeTitle() {
        return 'Academic Credential';
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
                        <div class="metadata-item">
                            <i class="fas fa-fingerprint"></i>
                            <span>${this.truncateId(this.credential.id || 'Not specified')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getContentHTML() {
        return `
            <div class="modern-content">
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

                ${this.getHonorsSection()}
            </div>
        `;
    }

    getDetailsSection() {
        const details = [
            { label: 'Major', value: this.degree.major },
            { label: 'Minor', value: this.degree.minor },
            { label: 'GPA', value: this.degree.gpa },
            { label: 'College', value: this.credential.credentialSubject.college },
            { label: 'Department', value: this.credential.credentialSubject.department },
            { label: 'Credits Earned', value: this.credential.credentialSubject.creditsEarned },
            { label: 'Graduation Date', value: this.degree.graduationDate ? this.formatDate(this.degree.graduationDate) : 'Not specified' },
            { label: 'Program Duration', value: this.credential.credentialSubject.programDuration }
        ].filter(detail => detail.value);

        return details.map(detail => `
            <div class="detail-item">
                <div class="detail-label">${detail.label}</div>
                <div class="detail-value">${detail.value}</div>
            </div>
        `).join('');
    }

    getHonorsSection() {
        const { honors } = this.degree;
        if (!honors || (Array.isArray(honors) && honors.length === 0)) return '';

        const honorsList = Array.isArray(honors) ? honors : [honors];
        
        return `
            <div class="honors-section">
                <h4>Honors & Distinctions</h4>
                <div class="honors-list">
                    ${honorsList.map(honor => `
                        <div class="honor-badge">
                            <i class="fas fa-award"></i>
                            <span>${honor}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static info = {
        name: 'Modern Academic',
        description: 'A contemporary design with clean typography and modern layout',
        credentialType: 'UniversityDegreeCredential',
        author: 'VC Viewer',
    };
}

// Register this theme
BaseTheme.register('UniversityDegreeCredential:modern', ModernUniversityTheme); 