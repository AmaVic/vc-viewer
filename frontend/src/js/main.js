$(document).ready(function() {
    // Validation timeout for debouncing
    let validationTimeout;

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
        const $container = $('.editor-container');
        const $feedback = $('.validation-feedback');
        const $validFeedback = $('.valid-feedback');
        const $invalidFeedback = $('.invalid-feedback');
        const $processBtn = $('#processBtn');
        
        // Remove existing validation states
        $container.removeClass('is-valid is-invalid');
        $feedback.removeClass('d-none');
        
        if (validationResult.isValid) {
            $container.addClass('is-valid');
            $validFeedback.removeClass('d-none');
            $invalidFeedback.addClass('d-none');
            $processBtn.prop('disabled', false);
            
            $validFeedback.html(`
                <i class="fas fa-check-circle"></i>
                <div>Valid Verifiable Credential</div>
            `);
        } else {
            $container.addClass('is-invalid');
            $validFeedback.addClass('d-none');
            $invalidFeedback.removeClass('d-none');
            $processBtn.prop('disabled', true);
            
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

    // Initialize JSON editor
    const jsonEditor = document.getElementById('jsonInput');
    
    // Function to update editor content with proper formatting
    function updateEditor(json) {
        let formatted;
        try {
            // If json is a string, parse it first
            const obj = typeof json === 'string' ? JSON.parse(json) : json;
            formatted = JSON.stringify(obj, null, 2);
        } catch (e) {
            formatted = json || '';
        }
        
        jsonEditor.textContent = formatted;
        Prism.highlightElement(jsonEditor);
    }

    // Handle editor input events
    jsonEditor.addEventListener('input', function() {
        // Clear existing timeout
        clearTimeout(validationTimeout);
        
        // Remove validation states while typing
        $('.editor-container').removeClass('is-valid is-invalid');
        $('.validation-feedback').addClass('d-none');
        
        // Set new timeout for validation
        validationTimeout = setTimeout(() => {
            const result = validateVC(this.textContent);
            updateValidationUI(result);
        }, 300);
    });

    // Handle paste events to format JSON
    jsonEditor.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        updateEditor(text);
    });

    // Theme management
    function getThemesByCredentialType(credentialType) {
        logger.debug('Getting themes for credential type:', credentialType);
        return BaseTheme.getThemesByType(credentialType);
    }

    function updateThemeSelect(credential) {
        const $select = $('#themeSelect');
        const $themeInfo = $('.theme-info');
        
        // Clear existing options
        $select.empty().append('<option value="">Select a theme...</option>');
        
        if (!credential || !credential.type) {
            $select.prop('disabled', true);
            $themeInfo.addClass('d-none');
            return;
        }
        
        // Get the most specific credential type
        const credentialType = credential.type[credential.type.length - 1];
        const themes = getThemesByCredentialType(credentialType);
        
        if (themes.length > 0) {
            // Add theme options with full theme IDs
            themes.forEach(theme => {
                const fullThemeId = `${credentialType}:${theme.id}`;
                $select.append(`<option value="${fullThemeId}">${theme.name}</option>`);
            });
            
            // Enable select and show theme info
            $select.prop('disabled', false);
            updateThemeInfo(themes[0]);
            $themeInfo.removeClass('d-none');
            
            // Select the first theme by default
            $select.val(`${credentialType}:${themes[0].id}`);
        } else {
            // If no specific themes found, try to use the default theme
            const defaultThemes = getThemesByCredentialType('VerifiableCredential');
            if (defaultThemes.length > 0) {
                defaultThemes.forEach(theme => {
                    const defaultThemeId = `VerifiableCredential:${theme.id}`;
                    $select.append(`<option value="${defaultThemeId}">${theme.name}</option>`);
                });
                $select.prop('disabled', false);
                updateThemeInfo(defaultThemes[0]);
                $themeInfo.removeClass('d-none');
                $select.val(`VerifiableCredential:${defaultThemes[0].id}`);
            } else {
                $select.prop('disabled', true);
                $themeInfo.addClass('d-none');
            }
        }
    }

    function updateThemeInfo(themeInfo) {
        if (!themeInfo) return;
        
        $('.theme-info')
            .removeClass('d-none')
            .find('.theme-name').text(themeInfo.name)
            .end()
            .find('.theme-description').text(themeInfo.description)
            .end()
            .find('.theme-author').text(`Created by ${themeInfo.author}`);
    }

    function renderCredential(credential, selectedTheme = '') {
        try {
            // Get the most specific credential type
            const credentialType = credential.type[credential.type.length - 1];
            logger.debug('Rendering credential of type:', credentialType);
            
            // Get the theme class
            let ThemeClass;
            if (selectedTheme) {
                logger.debug('Using selected theme:', selectedTheme);
                ThemeClass = BaseTheme.getTheme(selectedTheme);
            } else {
                // Try to find a theme that supports this credential type
                const themes = getThemesByCredentialType(credentialType);
                logger.debug('Available themes:', themes);
                
                if (themes.length > 0) {
                    // Use the first theme's full ID (e.g., "UniversityDegreeCredential:classic")
                    const themeId = `${credentialType}:${themes[0].id}`;
                    logger.debug('Using first available theme:', themeId);
                    ThemeClass = BaseTheme.getTheme(themeId);
                } else {
                    // Fall back to default theme
                    logger.debug('No specific themes found, trying default theme');
                    const defaultThemes = getThemesByCredentialType('VerifiableCredential');
                    if (defaultThemes.length > 0) {
                        const defaultThemeId = `VerifiableCredential:${defaultThemes[0].id}`;
                        ThemeClass = BaseTheme.getTheme(defaultThemeId);
                    } else {
                        ThemeClass = null;
                    }
                }
            }
            
            logger.debug('Selected ThemeClass:', ThemeClass);
            
            if (!ThemeClass) {
                throw new Error(`No theme found for credential type: ${credentialType}`);
            }
            
            // Create and render the theme
            const theme = new ThemeClass(credential);
            return theme.render();
            
        } catch (error) {
            logger.error('Error rendering credential:', error);
            return document.createElement('div');
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

    // Process button click handler
    $('#processBtn').click(function() {
        try {
            const jsonStr = jsonEditor.textContent;
            const credential = JSON.parse(jsonStr);
            
            // Get the selected theme
            const selectedTheme = $('#themeSelect').val();
            logger.debug('Processing credential with selected theme:', selectedTheme);
            
            // Clear the output and show the card
            const output = $('#output');
            output.empty();
            $('#outputCard').removeClass('d-none');
            
            // Render the credential
            const rendered = renderCredential(credential, selectedTheme);
            output.append(rendered);
            
            // Update theme selector
            updateThemeSelect(credential);
            
            logger.info('Credential processed successfully');
        } catch (error) {
            logger.error('Error processing credential:', error);
            showError('Error processing credential: ' + error.message);
        }
    });

    // Theme selection change handler
    $('#themeSelect').change(function() {
        const selectedTheme = $(this).val();
        try {
            // Get the current credential
            const jsonStr = jsonEditor.textContent;
            const credential = JSON.parse(jsonStr);
            
            // Clear the output and show the card
            const output = $('#output');
            output.empty();
            $('#outputCard').removeClass('d-none');
            
            // Render with the new theme
            const rendered = renderCredential(credential, selectedTheme);
            output.append(rendered);
            
            // Update theme info
            const ThemeClass = BaseTheme.getTheme(selectedTheme);
            if (ThemeClass) {
                updateThemeInfo(ThemeClass.info);
            }
            
            logger.info('Theme changed successfully:', selectedTheme);
        } catch (error) {
            logger.error('Error changing theme:', error);
            showError('Error changing theme: ' + error.message);
        }
    });

    // Update example loading to use new editor
    $('#loadUniversityExample').click(function() {
        logger.debug('Loading university degree example');
        const example = examples['UniversityDegreeCredential'];
        if (example) {
            updateEditor(example);
            // Trigger validation
            jsonEditor.dispatchEvent(new Event('input'));
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
            updateEditor(example);
            // Trigger validation
            jsonEditor.dispatchEvent(new Event('input'));
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