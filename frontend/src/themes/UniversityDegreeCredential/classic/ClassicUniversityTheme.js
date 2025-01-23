class ClassicUniversityTheme extends BaseTheme {
    static info = {
        id: 'classic',
        name: 'Classic University Theme',
        description: 'A traditional, elegant design for university degree credentials',
        author: 'VC Viewer Team'
    };

    static supportedTypes = ['UniversityDegreeCredential'];

    constructor(credential) {
        super(credential);
        this.degree = credential.credentialSubject.degree || {};
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper classic-university-theme';
        wrapper.innerHTML = this.getContentHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-university"></i>';
    }

    getThemeTitle() {
        return 'University Degree';
    }

    getContentHTML() {
        const { degree } = this;
        return `
            <div class="credential-banner">
                ${this.getThemeIcon()}
                <h1>${this.getThemeTitle()}</h1>
                <div class="university-name">${this.getIssuerName()}</div>
            </div>

            <div class="degree-content">
                <h2 class="degree-name">${degree.name || 'Degree'}</h2>
                <h3 class="degree-type">${degree.type || 'Not specified'}</h3>

                <div class="recipient-info">
                    <div class="info-item">
                        <strong>NAME</strong>
                        <span>${this.credential.credentialSubject.name || 'Unknown Recipient'}</span>
                    </div>
                    <div class="info-item">
                        <strong>IDENTIFIER</strong>
                        <span>${this.credential.credentialSubject.id || 'Not specified'}</span>
                    </div>
                    ${this.credential.credentialSubject.birthDate ? `
                        <div class="info-item">
                            <strong>DATE OF BIRTH</strong>
                            <span>${this.formatDate(this.credential.credentialSubject.birthDate)}</span>
                        </div>
                    ` : ''}
                    ${this.credential.credentialSubject.nationality ? `
                        <div class="info-item">
                            <strong>NATIONALITY</strong>
                            <span>${this.credential.credentialSubject.nationality}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="academic-info">
                    <div class="info-item">
                        <strong>GRADUATION DATE</strong>
                        <span>${this.formatDate(degree.graduationDate)}</span>
                    </div>
                    ${degree.gpa ? `
                        <div class="info-item">
                            <strong>GPA</strong>
                            <span>${degree.gpa}</span>
                        </div>
                    ` : ''}
                    ${degree.major ? `
                        <div class="info-item">
                            <strong>MAJOR</strong>
                            <span>${degree.major}</span>
                        </div>
                    ` : ''}
                    ${degree.minor ? `
                        <div class="info-item">
                            <strong>MINOR</strong>
                            <span>${degree.minor}</span>
                        </div>
                    ` : ''}
                    ${degree.studyType ? `
                        <div class="info-item">
                            <strong>STUDY TYPE</strong>
                            <span>${degree.studyType}</span>
                        </div>
                    ` : ''}
                </div>

                ${degree.honors?.length ? `
                    <div class="honors">
                        <h3>Honors & Achievements</h3>
                        <ul>
                            ${degree.honors.map(honor => `<li>${honor}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="credential-footer">
                    <div class="info-item">
                        <strong>ISSUANCE DATE</strong>
                        <span>${this.formatDate(this.credential.issuanceDate)}</span>
                    </div>
                    <div class="info-item">
                        <strong>ISSUER</strong>
                        <span>${this.getIssuerName()}</span>
                    </div>
                    <div class="info-item">
                        <strong>CREDENTIAL ID</strong>
                        <span>${this.credential.id || 'Not specified'}</span>
                    </div>
                </div>
            </div>
            ${this.getBaseFooterHTML()}
        `;
    }

    getRecipientInfo() {
        const { name, id } = this.credential.credentialSubject;
        return `
            <div class="info-section">
                <h5>Recipient Information</h5>
                <div class="info-grid">
                    ${name ? `
                        <div class="info-item">
                            <strong>Name</strong>
                            <span>${name}</span>
                        </div>
                    ` : ''}
                    <div class="info-item">
                        <strong>Identifier</strong>
                        <span>${id}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getAcademicInfo() {
        const { major, minor, gpa, graduationDate } = this.degree;
        const { college, department, creditsEarned } = this.credential.credentialSubject;

        return `
            <div class="info-section">
                <h5>Academic Information</h5>
                <div class="info-grid">
                    ${major ? `
                        <div class="info-item">
                            <strong>Major</strong>
                            <span>${major}</span>
                        </div>
                    ` : ''}
                    ${minor ? `
                        <div class="info-item">
                            <strong>Minor</strong>
                            <span>${minor}</span>
                        </div>
                    ` : ''}
                    ${gpa ? `
                        <div class="info-item">
                            <strong>GPA</strong>
                            <span>${gpa}</span>
                        </div>
                    ` : ''}
                    ${graduationDate ? `
                        <div class="info-item">
                            <strong>Graduation Date</strong>
                            <span>${this.formatDate(graduationDate)}</span>
                        </div>
                    ` : ''}
                    ${college ? `
                        <div class="info-item">
                            <strong>College</strong>
                            <span>${college}</span>
                        </div>
                    ` : ''}
                    ${department ? `
                        <div class="info-item">
                            <strong>Department</strong>
                            <span>${department}</span>
                        </div>
                    ` : ''}
                    ${creditsEarned ? `
                        <div class="info-item">
                            <strong>Credits Earned</strong>
                            <span>${creditsEarned}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getHonorsInfo() {
        const { honors } = this.degree;
        if (!honors) return '';

        return `
            <div class="info-section">
                <h5>Honors & Achievements</h5>
                <div class="honors-list">
                    ${Array.isArray(honors) 
                        ? honors.map(honor => `<div class="honor-item">${honor}</div>`).join('')
                        : `<div class="honor-item">${honors}</div>`
                    }
                </div>
            </div>
        `;
    }
}

// Register the theme
BaseTheme.register('UniversityDegreeCredential', ClassicUniversityTheme); 