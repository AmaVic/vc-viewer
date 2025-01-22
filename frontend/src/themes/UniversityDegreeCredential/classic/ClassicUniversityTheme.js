class ClassicUniversityTheme extends BaseTheme {
    constructor(credential) {
        super(credential);
        this.degree = credential.credentialSubject.degree || {};
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'credential-wrapper classic-university-theme';
        wrapper.innerHTML = this.getBaseHTML();
        return wrapper;
    }

    getThemeIcon() {
        return '<i class="fas fa-university"></i>';
    }

    getThemeTitle() {
        return 'University Degree';
    }

    getBannerContent() {
        return `
            <div class="credential-icon">
                ${this.getThemeIcon()}
            </div>
            <div class="credential-title">
                <h4>${this.getThemeTitle()}</h4>
                <div class="university-name">${this.getIssuerName()}</div>
            </div>
        `;
    }

    getContentHTML() {
        return `
            <div class="degree-content">
                <div class="degree-header">
                    <div class="university-seal">
                        <i class="fas fa-university fa-3x"></i>
                    </div>
                    <h2 class="degree-name">${this.degree.name || 'Degree'}</h2>
                    <div class="degree-type">${this.degree.type || ''}</div>
                </div>

                <div class="degree-details">
                    ${this.getRecipientInfo()}
                    ${this.getAcademicInfo()}
                    ${this.getHonorsInfo()}
                </div>
            </div>
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
                        <span>${this.truncateId(id)}</span>
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

    static info = {
        name: 'Classic Academic',
        description: 'A traditional academic style with classic typography and layout',
        credentialType: 'UniversityDegreeCredential',
        author: 'VC Viewer',
    };
}

// Register this theme
BaseTheme.register('UniversityDegreeCredential:classic', ClassicUniversityTheme); 