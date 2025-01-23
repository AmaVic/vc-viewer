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

    // Real-time validation
    function validateVC(jsonStr) {
        try {
            if (!jsonStr.trim()) {
                return { isValid: false, error: 'Input is empty' };
            }

            const credential = JSON.parse(jsonStr);
            
            // Basic VC validation
            if (!credential['@context'] || !credential['@context'].includes('https://www.w3.org/2018/credentials/v1')) {
                return { isValid: false, error: 'Missing or invalid @context' };
            }
            
            if (!credential.type || !credential.type.includes('VerifiableCredential')) {
                return { isValid: false, error: 'Missing or invalid type' };
            }
            
            if (!credential.issuer) {
                return { isValid: false, error: 'Missing issuer' };
            }
            
            if (!credential.credentialSubject) {
                return { isValid: false, error: 'Missing credentialSubject' };
            }

            return { isValid: true };
        } catch (e) {
            return { isValid: false, error: 'Invalid JSON format' };
        }
    }

    function updateValidationUI(validationResult) {
        const $input = $('#jsonInput');
        const $feedback = $('.validation-feedback');
        const $validFeedback = $('.valid-feedback');
        const $invalidFeedback = $('.invalid-feedback');
        const $errorMessage = $('.error-message');
        const $processBtn = $('#processBtn');
        
        // Remove existing validation states
        $input.removeClass('is-valid is-invalid');
        $feedback.removeClass('d-none');
        
        if (validationResult.isValid) {
            $input.addClass('is-valid');
            $validFeedback.removeClass('d-none');
            $invalidFeedback.addClass('d-none');
            $processBtn.prop('disabled', false);
        } else {
            $input.addClass('is-invalid');
            $validFeedback.addClass('d-none');
            $invalidFeedback.removeClass('d-none');
            $errorMessage.text(validationResult.error);
            $processBtn.prop('disabled', true);
        }
    }

    // Add input event listener for real-time validation with debounce
    let validationTimeout;
    $('#jsonInput').on('input', function() {
        const $input = $(this);
        
        // Clear existing timeout
        clearTimeout(validationTimeout);
        
        // Remove validation states while typing
        $input.removeClass('is-valid is-invalid');
        $('.validation-feedback').addClass('d-none');
        
        // Set new timeout for validation
        validationTimeout = setTimeout(() => {
            const result = validateVC($input.val());
            updateValidationUI(result);
        }, 300); // Debounce for 300ms
    });

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

        // Get all themes for the credential type
        const availableThemes = getThemesByCredentialType(credential.type[credential.type.length - 1]);

        // Add available themes to select
        availableThemes.forEach(theme => {
            $themeSelect.append(`<option value="${theme.id}">${theme.name}</option>`);
        });

        // Select the first available theme
        if (availableThemes.length > 0) {
            $themeSelect.val(availableThemes[0].id);
            updateThemeInfo(availableThemes[0]);
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
        $('#outputCard').removeClass('d-none');
        
        try {
            // Validate credential
            if (!credential.type || !Array.isArray(credential.type)) {
                throw new Error('Invalid credential: missing or invalid type');
            }
            
            // Determine which theme to use
            let themeId = selectedTheme;
            if (!themeId || themeId === '') {
                const credentialType = credential.type[credential.type.length - 1];
                const themes = getThemesByCredentialType(credentialType);
                themeId = themes.length > 0 ? themes[0].id : 'VerifiableCredential:default';
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
            $('#themeSelect').val(themeId);
            updateThemeInfo(ThemeClass.info);
        } catch (error) {
            logger.error('Error rendering credential', error);
            showError('Error rendering credential: ' + error.message);
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
        $('#outputCard').removeClass('d-none');
    }

    // Event handlers
    $('#processBtn').click(function() {
        let jsonData;
        
        try {
            const jsonInput = $('#jsonInput').val();
            logger.debug('Processing input', { input: jsonInput });
            
            if (!jsonInput.trim()) {
                throw new Error('Input is empty');
            }
            
            jsonData = JSON.parse(jsonInput);
        } catch (e) {
            logger.error('JSON parsing error', e);
            showError('Invalid JSON input: ' + e.message);
            return;
        }
        
        $.ajax({
            url: '/process-credential',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(jsonData),
            success: function(response) {
                logger.info('Server response received', response);
                renderCredential(response, $('#themeSelect').val());
            },
            error: function(xhr, status, error) {
                logger.error('Server request failed', { status, error, response: xhr.responseText });
                let errorMessage = 'Error processing the credential';
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

    // Example loading
    $('#loadUniversityExample').click(function() {
        logger.debug('Loading university degree example');
        const example = examples['UniversityDegreeCredential'];
        if (example) {
            $('#jsonInput').val(JSON.stringify(example, null, 2));
            // Trigger validation
            $('#jsonInput').trigger('input');
            // Automatically process the example
            $('#processBtn').click();
        } else {
            logger.error('University degree example not found');
            showError('Failed to load university degree example');
        }
    });

    $('#loadDriverLicenseExample').click(function() {
        logger.debug('Loading driver license example');
        const example = examples['BelgianDriverLicenseCredential'];
        if (example) {
            $('#jsonInput').val(JSON.stringify(example, null, 2));
            // Trigger validation
            $('#jsonInput').trigger('input');
            // Automatically process the example
            $('#processBtn').click();
        } else {
            logger.error('Driver license example not found');
            showError('Failed to load driver license example');
        }
    });
}); 