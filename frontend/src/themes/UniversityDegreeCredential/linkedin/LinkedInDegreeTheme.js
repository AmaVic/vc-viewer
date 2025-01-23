class LinkedInDegreeTheme extends BaseTheme {
    static info = {
        id: 'linkedin',
        name: 'LinkedIn Post',
        description: 'Optimized for LinkedIn feed dimensions',
        author: 'VC Viewer Team'
    };

    static supportedTypes = ['UniversityDegreeCredential'];

    constructor(credential) {
        super(credential);
        this.degree = {
            name: credential.credentialSubject.name,
            type: credential.credentialSubject.degree.type,
            degreeName: credential.credentialSubject.degree.name,
            honors: credential.credentialSubject.degree.honors,
            graduationDate: credential.credentialSubject.degree.graduationDate
        };
    }

    render() {
        return `
            <div class="credential-wrapper linkedin-degree-theme">
                <div class="linkedin-card">
                    <div class="university-banner">
                        <div class="university-logo">
                            <i class="fas fa-university"></i>
                        </div>
                        <h1 class="university-name">${this.getIssuerName()}</h1>
                    </div>
                    
                    <div class="degree-content">
                        <div class="recipient-info">
                            <p class="conferred-text">has conferred upon</p>
                            <h2 class="recipient-name">${this.degree.name}</h2>
                            <p class="degree-details">${this.degree.type} in ${this.degree.degreeName}</p>
                        </div>

                        ${this.degree.honors ? `
                            <div class="honors">
                                <p class="honors-text">${this.degree.honors}</p>
                            </div>
                        ` : ''}
                    </div>

                    <div class="credential-footer">
                        <div class="issue-date">
                            ${this.degree.graduationDate ? `Graduated ${new Date(this.degree.graduationDate).toLocaleDateString()}` : 
                            `Issued ${new Date(this.credential.issuanceDate).toLocaleDateString()}`}
                        </div>
                        <div class="credential-verify">
                            <i class="fas fa-shield-check"></i> Verified Credential
                        </div>
                    </div>

                    <div class="credential-links">
                        <a href="${this.credential.id}" class="certificate-link" target="_blank">
                            <i class="fas fa-external-link-alt"></i> View Certificate
                        </a>
                        <div class="powered-by">
                            Created with <a href="https://github.com/spruceid/vc-viewer" target="_blank">VC Viewer</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getThemeIcon() {
        return '<i class="fab fa-linkedin"></i>';
    }

    getThemeTitle() {
        return 'LinkedIn Post';
    }
}

// Register the theme
BaseTheme.register('UniversityDegreeCredential', LinkedInDegreeTheme); 