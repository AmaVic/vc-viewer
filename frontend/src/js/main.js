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

            let credential;
            try {
                credential = JSON.parse(jsonStr);
            } catch (e) {
                return { 
                    isValid: false, 
                    error: 'Invalid JSON format',
                    details: e.message
                };
            }

            const errors = [];
            
            // Context validation
            if (!credential['@context']) {
                errors.push('Missing @context field');
            } else if (!Array.isArray(credential['@context'])) {
                errors.push('@context must be an array');
            } else if (!credential['@context'].includes('https://www.w3.org/2018/credentials/v1')) {
                errors.push('@context must include "https://www.w3.org/2018/credentials/v1"');
            }
            
            // Type validation
            if (!credential.type) {
                errors.push('Missing type field');
            } else if (!Array.isArray(credential.type)) {
                errors.push('type must be an array');
            } else {
                if (!credential.type.includes('VerifiableCredential')) {
                    errors.push('type must include "VerifiableCredential"');
                }
                if (credential.type.length < 2) {
                    errors.push('type should include at least one specific credential type');
                }
            }
            
            // Issuer validation
            if (!credential.issuer) {
                errors.push('Missing issuer field');
            } else if (typeof credential.issuer !== 'object' && typeof credential.issuer !== 'string') {
                errors.push('issuer must be an object or string');
            } else if (typeof credential.issuer === 'object' && !credential.issuer.id) {
                errors.push('issuer object must have an id field');
            }
            
            // Issuance date validation
            if (!credential.issuanceDate) {
                errors.push('Missing issuanceDate field');
            } else {
                try {
                    new Date(credential.issuanceDate).toISOString();
                } catch (e) {
                    errors.push('issuanceDate must be a valid ISO 8601 date');
                }
            }
            
            // Credential subject validation
            if (!credential.credentialSubject) {
                errors.push('Missing credentialSubject field');
            } else if (typeof credential.credentialSubject !== 'object') {
                errors.push('credentialSubject must be an object');
            }

            if (errors.length > 0) {
                return {
                    isValid: false,
                    error: 'Invalid Verifiable Credential',
                    details: errors
                };
            }

            return { 
                isValid: true,
                details: [
                    `Valid credential type: ${credential.type[credential.type.length - 1]}`,
                    `Issued by: ${typeof credential.issuer === 'string' ? credential.issuer : credential.issuer.name || credential.issuer.id}`,
                    `Issued on: ${new Date(credential.issuanceDate).toLocaleDateString()}`
                ]
            };
        } catch (e) {
            return { 
                isValid: false, 
                error: 'Validation error',
                details: e.message
            };
        }
    }

    function updateValidationUI(validationResult) {
        const $input = $('#jsonInput');
        const $feedback = $('.validation-feedback');
        const $validFeedback = $('.valid-feedback');
        const $invalidFeedback = $('.invalid-feedback');
        const $processBtn = $('#processBtn');
        
        // Remove existing validation states
        $input.removeClass('is-valid is-invalid');
        $feedback.removeClass('d-none');
        
        if (validationResult.isValid) {
            $input.addClass('is-valid');
            $validFeedback.removeClass('d-none');
            $invalidFeedback.addClass('d-none');
            $processBtn.prop('disabled', false);
            
            // Simple success message
            $validFeedback.html(`
                <i class="fas fa-check-circle"></i>
                <div>Valid Verifiable Credential</div>
            `);
        } else {
            $input.addClass('is-invalid');
            $validFeedback.addClass('d-none');
            $invalidFeedback.removeClass('d-none');
            $processBtn.prop('disabled', true);
            
            // Show error details if available
            if (validationResult.details) {
                const detailsHtml = Array.isArray(validationResult.details)
                    ? `<ul class="validation-details mb-0 mt-1">
                        ${validationResult.details.map(detail => `<li>${detail}</li>`).join('')}
                       </ul>`
                    : `<div class="mt-1">${validationResult.details}</div>`;
                
                $invalidFeedback.html(`
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                        <div>${validationResult.error}</div>
                        ${detailsHtml}
                    </div>
                `);
            } else {
                $invalidFeedback.html(`
                    <i class="fas fa-exclamation-circle"></i>
                    <div>${validationResult.error}</div>
                `);
            }
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

    // Browser compatibility check for export features
    function isChromiumBased() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /chrome/.test(userAgent) || /chromium/.test(userAgent) || /brave/.test(userAgent);
    }

    function showBrowserCompatibilityError() {
        showError(`
            Export features require a Chromium-based browser. Please use either:
            <div class="mt-2">
                <a href="https://brave.com" target="_blank" class="text-decoration-none me-3">
                    <i class="fa-brands fa-brave"></i> Brave Browser
                </a>
                <a href="https://www.google.com/chrome" target="_blank" class="text-decoration-none">
                    <i class="fa-brands fa-chrome"></i> Google Chrome
                </a>
            </div>
        `);
    }

    // Export functionality
    $('#exportImage').click(async function() {
        if (!isChromiumBased()) {
            showBrowserCompatibilityError();
            return;
        }

        const $output = $('#output');
        const $credential = $output.find('.credential-wrapper').first();
        
        try {
            // Show loading state
            const $btn = $(this);
            const originalText = $btn.html();
            $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Exporting...');
            
            // Create canvas from the credential
            const canvas = await html2canvas($credential[0], {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff',
                logging: false
            });
            
            // Convert to image and download
            const link = document.createElement('a');
            link.download = 'credential.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Reset button state
            $btn.prop('disabled', false).html(originalText);
            
            logger.info('Credential exported as image');
        } catch (error) {
            logger.error('Error exporting credential as image:', error);
            showError('Failed to export image. Please try again.');
        }
    });

    $('#exportPDF').click(async function() {
        if (!isChromiumBased()) {
            showBrowserCompatibilityError();
            return;
        }

        const $output = $('#output');
        const $credential = $output.find('.credential-wrapper').first();
        
        try {
            // Show loading state
            const $btn = $(this);
            const originalText = $btn.html();
            $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Exporting...');
            
            // Create canvas from the credential
            const canvas = await html2canvas($credential[0], {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff',
                logging: false
            });
            
            // Initialize PDF with A4 format
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // A4 dimensions in mm
            const pageWidth = 210;
            const pageHeight = 297;
            
            // Calculate scaling to fit the page with margins
            const margins = 20; // 20mm margins
            const maxWidth = pageWidth - (margins * 2);
            const maxHeight = pageHeight - (margins * 2);
            
            // Convert canvas dimensions from px to mm (assuming 96 DPI)
            const pxToMm = 0.264583333;
            const imageWidth = canvas.width * pxToMm;
            const imageHeight = canvas.height * pxToMm;
            
            // Calculate scale to fit within margins while maintaining aspect ratio
            const scale = Math.min(
                maxWidth / imageWidth,
                maxHeight / imageHeight
            );
            
            // Calculate centered position
            const scaledWidth = imageWidth * scale;
            const scaledHeight = imageHeight * scale;
            const x = (pageWidth - scaledWidth) / 2;
            const y = (pageHeight - scaledHeight) / 2;
            
            // Add the image to PDF
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                x,
                y,
                scaledWidth,
                scaledHeight
            );
            
            // Save the PDF
            pdf.save('credential.pdf');
            
            // Reset button state
            $btn.prop('disabled', false).html(originalText);
            
            logger.info('Credential exported as PDF');
        } catch (error) {
            logger.error('Error exporting credential as PDF:', error);
            showError('Failed to export PDF. Please try again.');
        }
    });
}); 