class ClassicUniversityTheme extends BaseTheme {
    static info = {
        id: 'classic',
        name: 'Classic University Theme',
        description: 'A traditional academic style for university degrees',
        author: 'VC Viewer Team'
    };

    static supportedTypes = ['UniversityDegreeCredential'];

    getThemeIcon() {
        return '<i class="fas fa-university fa-3x"></i>';
    }

    getThemeTitle() {
        return '<h1>University Degree</h1>';
    }

    renderCredentialContent() {
        const { credentialSubject } = this.credential;
        const { degree } = credentialSubject;

        return `
            <div class="degree-content">
                <div class="content-card">
                    <div class="degree-header">
                        <div class="degree-name">${degree.name}</div>
                        <div class="degree-type">${degree.type}</div>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Name</div>
                            <div class="info-value">${credentialSubject.name}</div>
                        </div>
                        ${degree.gpa ? `
                            <div class="info-item">
                                <div class="info-label">Grade Point Average</div>
                                <div class="info-value">${degree.gpa}</div>
                            </div>
                        ` : ''}
                        ${degree.honors ? `
                            <div class="info-item">
                                <div class="info-label">Honors</div>
                                <div class="info-value">${degree.honors}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

// Register the theme
BaseTheme.register('UniversityDegreeCredential', ClassicUniversityTheme); 