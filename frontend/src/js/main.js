$(document).ready(function() {
    // Setup console logging with timestamp
    window.logger = {
        info: (msg, data) => {
            const time = new Date().toISOString();
            console.log(`[${time}] INFO: ${msg}`, data || '');
        },
        error: (msg, err) => {
            const time = new Date().toISOString();
            console.error(`[${time}] ERROR: ${msg}`, err || '');
        },
        debug: (msg, data) => {
            const time = new Date().toISOString();
            console.debug(`[${time}] DEBUG: ${msg}`, data || '');
        }
    };

    // Theme management
    function getThemesByCredentialType(credentialType) {
        return BaseTheme.getAllThemes()
            .filter(themeId => themeId.startsWith(credentialType + ':'))
            .map(themeId => {
                const ThemeClass = BaseTheme.getTheme(themeId);
                return {
                    id: themeId,
                    ...ThemeClass.info
                };
            });
    }

    function updateThemeSelect(credential) {
        const $themeSelect = $('#themeSelect');
        const $themeInfo = $('.theme-info');
        
        // Clear existing options except the first one
        $themeSelect.find('option:not(:first)').remove();
        
        if (!credential) {
            $themeSelect.prop('disabled', true);
            $themeInfo.addClass('d-none');
            return;
        }

        // Get all themes for each credential type
        const availableThemes = credential.type.reduce((themes, type) => {
            return themes.concat(getThemesByCredentialType(type));
        }, []);

        // Add available themes to select
        availableThemes.forEach(theme => {
            $themeSelect.append(`<option value="${theme.id}">${theme.name}</option>`);
        });

        // If credential has a matching theme, select it
        if (credential.type) {
            // Try to find a theme for the most specific type first
            for (let i = credential.type.length - 1; i >= 0; i--) {
                const type = credential.type[i];
                const themes = getThemesByCredentialType(type);
                if (themes.length > 0) {
                    $themeSelect.val(themes[0].id);
                    updateThemeInfo(themes[0]);
                    break;
                }
            }
        }

        $themeSelect.prop('disabled', false);
    }

    function updateThemeInfo(theme) {
        const $themeInfo = $('.theme-info');
        if (!theme) {
            $themeInfo.addClass('d-none');
            return;
        }

        $('.theme-name', $themeInfo).text(theme.name);
        $('.theme-description', $themeInfo).text(theme.description);
        $('.theme-author', $themeInfo).text(`Created by ${theme.author}`);
        $themeInfo.removeClass('d-none');
    }

    function renderCredential(credential, selectedTheme = '') {
        logger.info('Rendering credential', { credential, selectedTheme });
        const output = $('#output');
        output.empty();
        
        try {
            // Validate credential
            if (!credential.type || !Array.isArray(credential.type)) {
                throw new Error('Invalid credential: missing or invalid type');
            }
            
            // Determine which theme to use
            let themeId = selectedTheme;
            if (!themeId || themeId === '') {
                // Try to find a matching theme from credential types
                for (let i = credential.type.length - 1; i >= 0; i--) {
                    const type = credential.type[i];
                    const themes = getThemesByCredentialType(type);
                    if (themes.length > 0) {
                        themeId = themes[0].id;
                        break;
                    }
                }
                // If no matching theme found, use default
                if (!themeId) {
                    themeId = 'VerifiableCredential:default';
                }
            }
            
            logger.debug(`Using theme: ${themeId}`);
            const ThemeClass = BaseTheme.getTheme(themeId);
            
            if (!ThemeClass) {
                throw new Error(`Theme not found: ${themeId}`);
            }
            
            const theme = new ThemeClass(credential);
            output.append(theme.render());
            
            // Update theme selector and info
            updateThemeSelect(credential);
            // Set the selected theme in the dropdown
            $('#themeSelect').val(themeId);
            updateThemeInfo(ThemeClass.info);
        } catch (error) {
            logger.error('Error rendering credential', error);
            showError('Error rendering credential: ' + error.message);
        }
    }

    function renderPresentation(presentation) {
        logger.info('Rendering presentation', presentation);
        const output = $('#output');
        output.empty();
        
        try {
            if (!presentation.verifiableCredential || !Array.isArray(presentation.verifiableCredential)) {
                throw new Error('Invalid presentation: no credentials found');
            }
            
            presentation.verifiableCredential.forEach((credential, index) => {
                logger.debug(`Processing credential ${index + 1}/${presentation.verifiableCredential.length}`);
                renderCredential(credential);
            });
        } catch (error) {
            logger.error('Error rendering presentation', error);
            showError('Error rendering presentation: ' + error.message);
        }
    }

    function showError(message) {
        const errorHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        $('#output').prepend(errorHtml);
    }

    // Event handlers
    $('#processBtn').click(function() {
        const inputType = $('#inputType').val();
        let jsonData;
        
        try {
            const jsonInput = $('#jsonInput').val();
            logger.debug('Processing input', { type: inputType, input: jsonInput });
            
            if (!jsonInput.trim()) {
                throw new Error('Input is empty');
            }
            
            jsonData = JSON.parse(jsonInput);
        } catch (e) {
            logger.error('JSON parsing error', e);
            showError('Invalid JSON input: ' + e.message);
            return;
        }
        
        const endpoint = inputType === 'credential' ? '/process-credential' : '/process-presentation';
        
        $.ajax({
            url: endpoint,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(jsonData),
            success: function(response) {
                logger.info('Server response received', response);
                if (inputType === 'credential') {
                    renderCredential(response, $('#themeSelect').val());
                } else {
                    renderPresentation(response);
                }
            },
            error: function(xhr, status, error) {
                logger.error('Server request failed', { status, error, response: xhr.responseText });
                let errorMessage = 'Error processing the input';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = response.error || errorMessage;
                } catch (e) {
                    errorMessage = error || errorMessage;
                }
                showError(errorMessage);
            }
        });
    });

    // Theme selection change
    $('#themeSelect').change(function() {
        const themeId = $(this).val();
        try {
            const jsonInput = $('#jsonInput').val();
            if (!jsonInput.trim()) {
                throw new Error('No credential loaded');
            }
            
            const credential = JSON.parse(jsonInput);
            renderCredential(credential, themeId);
        } catch (e) {
            logger.error('Error applying theme', e);
            showError('Please process a valid credential first');
            // Reset to previous selection on error
            updateThemeSelect(JSON.parse($('#jsonInput').val()));
        }
    });

    // Example credentials
    const exampleUniversityCredential = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "id": "http://example.edu/credentials/3732",
        "type": ["VerifiableCredential", "UniversityDegreeCredential"],
        "issuer": {
            "id": "https://example.edu/issuers/14",
            "name": "Example University"
        },
        "issuanceDate": "2023-06-15T19:23:24Z",
        "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "name": "Jane Marie Smith",
            "degree": {
                "type": "Bachelor of Science",
                "name": "Computer Science and Engineering",
                "major": "Computer Science",
                "minor": "Mathematics",
                "gpa": "3.92",
                "honors": ["Magna Cum Laude", "Dean's List"],
                "graduationDate": "2023-05-15T00:00:00Z"
            },
            "college": "College of Engineering",
            "department": "Department of Computer Science",
            "studentId": "123456789",
            "completionStatus": "Completed",
            "enrollmentStatus": "Graduated",
            "programDuration": "4 years",
            "creditsEarned": 128
        }
    };

    const exampleDriverLicenseCredential = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "id": "https://example.be/credentials/driver-license/123",
        "type": ["VerifiableCredential", "BelgianDriverLicenseCredential"],
        "issuer": {
            "id": "https://mobilit.belgium.be/",
            "name": "FPS Mobility and Transport"
        },
        "issuanceDate": "2023-01-15T10:00:00Z",
        "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "name": "Jean Dupont",
            "dateOfBirth": "1990-05-20",
            "placeOfBirth": "Brussels",
            "nationalNumber": "90.05.20-123.45",
            "licenseNumber": "B123456789",
            "validUntil": "2033-01-15T10:00:00Z",
            "categories": [
                {
                    "code": "B",
                    "status": "active",
                    "validUntil": "2033-01-15T10:00:00Z"
                },
                {
                    "code": "A",
                    "status": "active",
                    "validUntil": "2033-01-15T10:00:00Z"
                },
                {
                    "code": "AM",
                    "status": "active",
                    "validUntil": "2033-01-15T10:00:00Z"
                }
            ],
            "restrictions": ["Requires corrective lenses"],
            "address": {
                "streetAddress": "Rue de la Loi 16",
                "locality": "Brussels",
                "postalCode": "1000",
                "country": "Belgium"
            }
        }
    };

    // Example loading
    $('#loadUniversityExample').click(function() {
        logger.debug('Loading university degree example');
        $('#inputType').val('credential');
        $('#jsonInput').val(JSON.stringify(exampleUniversityCredential, null, 2));
    });

    $('#loadDriverLicenseExample').click(function() {
        logger.debug('Loading driver license example');
        $('#inputType').val('credential');
        $('#jsonInput').val(JSON.stringify(exampleDriverLicenseCredential, null, 2));
    });
}); 