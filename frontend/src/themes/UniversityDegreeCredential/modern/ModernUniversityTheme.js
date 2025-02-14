class ModernUniversityTheme extends BaseTheme {
    // Theme metadata in the format expected by the registration system
    static info = {
        id: 'modern',
        name: 'Modern University Theme',
        description: 'A sleek and modern design for university degree credentials',
        author: 'VC Viewer Team'
    };
    
    static supportedTypes = ['UniversityDegreeCredential'];

    constructor(credential) {
        super(credential);
        // Store commonly used credential data for easier access
        if (credential?.credentialSubject) {
            this.degree = credential.credentialSubject.degree || {};
            this.subject = credential.credentialSubject;
        }
    }

    getThemeIcon() {
        // Use custom degree image if available
        if (this.degree.image) {
            return `<img 
                src="${this.degree.image}" 
                alt="Degree Icon" 
                class="degree-icon"
            />`;
        }
        return '<i class="fas fa-graduation-cap"></i>';
    }

    getThemeTitle() {
        if (!this.credential) return 'University Degree';
        return `${this.getIssuerName()} - ${this.degree.type || 'Degree'}`;
    }

    getContentHTML() {
        if (!this.credential || !this.subject) {
            return '<div class="error-message">Invalid credential data</div>';
        }

        // Extract and validate required data
        const recipientId = this.subject.id || '';
        const shortId = recipientId.split(':').pop() || recipientId;
        const degreeName = this.degree.name || 'Not specified';
        const degreeType = this.degree.type || 'Not specified';
        
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
                        <div class="degree-name">${degreeName}</div>
                        <div class="degree-type">${degreeType}</div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Name</div>
                            <div class="info-value">${this.subject.name || 'Not specified'}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Student ID</div>
                            <div class="info-value">${shortId}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Major</div>
                            <div class="info-value">${this.degree.major || degreeName}</div>
                        </div>
                        
                        ${this.degree.minor ? `
                            <div class="info-item">
                                <div class="info-label">Minor</div>
                                <div class="info-value">${this.degree.minor}</div>
                            </div>
                        ` : ''}
                        
                        <div class="info-item">
                            <div class="info-label">Graduation Date</div>
                            <div class="info-value">${this.formatDate(this.degree.graduationDate)}</div>
                        </div>
                        
                        ${this.degree.gpa ? `
                            <div class="info-item">
                                <div class="info-label">Grade Point Average</div>
                                <div class="info-value">${this.degree.gpa}</div>
                            </div>
                        ` : ''}

                        ${this.degree.honors ? `
                            <div class="info-item honors">
                                <div class="info-label">Honors</div>
                                <div class="info-value">${Array.isArray(this.degree.honors) ? 
                                    this.degree.honors.join(', ') : 
                                    this.degree.honors}</div>
                            </div>
                        ` : ''}
                    </div>

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
BaseTheme.register('UniversityDegreeCredential', ModernUniversityTheme); 