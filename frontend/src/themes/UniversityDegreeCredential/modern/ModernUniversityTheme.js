class ModernUniversityTheme extends BaseTheme {
    constructor(credential) {
        super(credential);
        this.id = 'modern';
        this.name = 'Modern University Theme';
        this.description = 'A sleek and modern design for university degree credentials';
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
        return this.credential ? `${this.getIssuerName()}` : 'University Degree';
    }

    getContentHTML() {
        if (!this.credential) return '';
        
        const { degree } = this;
        const recipientId = this.credential.credentialSubject.id || '';
        const shortId = recipientId.split(':').pop() || recipientId;
        
        return `
            <div class="credential-banner">
                <div class="banner-content">
                    ${this.getThemeIcon()}
                    <h1>University Degree</h1>
                    <div class="university-name">${this.getIssuerName()}</div>
                </div>
            </div>
            
            <div class="degree-content">
                <div class="content-card">
                    <div class="degree-header">
                        <div class="degree-name">${degree.name || 'Computer Science'}</div>
                        <div class="degree-type">${degree.type || 'Bachelor of Science'}</div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Name</div>
                            <div class="info-value">${this.credential.credentialSubject.name}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Student ID</div>
                            <div class="info-value">${shortId}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Major</div>
                            <div class="info-value">${degree.major || degree.name || 'Not specified'}</div>
                        </div>
                        
                        ${degree.minor ? `
                            <div class="info-item">
                                <div class="info-label">Minor</div>
                                <div class="info-value">${degree.minor}</div>
                            </div>
                        ` : ''}
                        
                        <div class="info-item">
                            <div class="info-label">Graduation Date</div>
                            <div class="info-value">${this.formatDate(degree.graduationDate)}</div>
                        </div>
                        
                        ${degree.gpa ? `
                            <div class="info-item">
                                <div class="info-label">Grade Point Average</div>
                                <div class="info-value">${degree.gpa}</div>
                            </div>
                        ` : ''}
                    </div>

                    ${degree.honors?.length ? `
                        <div class="honors-section">
                            <div class="honors-title">Honors & Achievements</div>
                            <div class="honors-list">
                                ${degree.honors.map(honor => `
                                    <div class="honor-item">${honor}</div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="credential-footer">
                        <div class="footer-grid">
                            <div class="footer-item">
                                <i class="fas fa-calendar"></i>
                                <div class="footer-item-content">
                                    <strong>Issued On</strong>
                                    <span>${this.formatDate(this.credential.issuanceDate)}</span>
                                </div>
                            </div>
                            
                            <div class="footer-item">
                                <i class="fas fa-university"></i>
                                <div class="footer-item-content">
                                    <strong>Issuing Institution</strong>
                                    <span>${this.getIssuerName()}</span>
                                </div>
                            </div>
                            
                            <div class="footer-item">
                                <i class="fas fa-fingerprint"></i>
                                <div class="footer-item-content">
                                    <strong>Credential ID</strong>
                                    <span>${this.credential.id.split(':').pop() || this.credential.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="credential-links">
                    <a href="${this.credential.id}" target="_blank" class="credential-link">
                        <i class="fas fa-external-link-alt"></i>
                        View Original Credential
                    </a>
                    <div class="powered-by">
                        Powered by <a href="/" target="_blank">VC Viewer</a>
                    </div>
                </div>
            </div>
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