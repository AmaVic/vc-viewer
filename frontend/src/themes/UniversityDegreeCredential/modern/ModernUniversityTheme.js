class ModernUniversityTheme extends BaseTheme {
    constructor(credential) {
        super(credential);
        this.id = 'modern';
        this.name = 'Modern University Theme';
        this.description = 'A modern, clean design for university degree credentials';
        this.author = 'VC Viewer Team';
        this.supportedTypes = ['UniversityDegreeCredential'];
        
        if (credential) {
            this.degree = credential.credentialSubject.degree;
        }
    }

    static supportedTypes = ['UniversityDegreeCredential'];


    getThemeIcon() {
        return '<i class="fas fa-graduation-cap"></i>';
    }

    getThemeTitle() {
        return this.credential ? `${this.credential.credentialSubject.name}'s Degree` : 'University Degree';
    }

    getContentHTML() {
        if (!this.credential) return '';
        
        const { degree } = this;
        return `
            <div class="credential-banner">
                <div class="credential-icon">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="university-name">${this.getIssuerName()}</div>
            </div>
            
            <div class="degree-content">
                <div class="degree-info">
                    <h2>${degree.name || 'Degree'}</h2>
                    <h3>Conferred upon</h3>
                    <div class="recipient-name">${this.credential.credentialSubject.name || 'Unknown Recipient'}</div>
                    <div class="degree-type">${degree.type || 'Not specified'}</div>
                </div>

                <div class="info-section">
                    <h5>Academic Information</h5>
                    <div class="info-grid">
                        ${degree.graduationDate ? `
                            <div class="info-item">
                                <strong>Graduated</strong>
                                <span>${this.formatDate(degree.graduationDate)}</span>
                            </div>
                        ` : ''}
                        ${degree.gpa ? `
                            <div class="info-item">
                                <strong>GPA</strong>
                                <span>${degree.gpa}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${degree.honors?.length ? `
                    <div class="info-section">
                        <h5>Honors & Achievements</h5>
                        <div class="honors-list">
                            ${degree.honors.map(honor => `
                                <div class="honor-item">${honor}</div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="credential-footer">
                <div>
                    <i class="fas fa-calendar"></i>
                    Issued on ${this.formatDate(this.credential.issuanceDate)}
                </div>
                <div>
                    <i class="fas fa-university"></i>
                    ${this.getIssuerName()}
                </div>
                <div>
                    <i class="fas fa-fingerprint"></i>
                    ${this.credential.id}
                </div>
            </div>
            ${this.getBaseFooterHTML()}
        `;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'modern-university-theme';
        wrapper.innerHTML = this.getContentHTML();
        return wrapper;
    }
}

// Register the theme
BaseTheme.register(ModernUniversityTheme); 