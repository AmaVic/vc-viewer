$(document).ready(function() {
    // Validation timeout for debouncing
    let validationTimeout;
    let hasUserInput = false; // Track if user has interacted with the editor

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

    function updateValidationUI(validationResult, hasUserInput = false) {
        const $feedback = $('.validation-feedback');
        
        // Remove existing validation states
        $feedback.removeClass('is-valid is-invalid show');
        
        // Only show validation feedback if there's user input
        if (!hasUserInput) {
            return;
        }
        
        // Show the feedback container and add appropriate state
        $feedback.addClass('show');
        
        if (validationResult.isValid) {
            $feedback.addClass('is-valid');
        } else {
            $feedback.addClass('is-invalid');
            
            if (validationResult.details) {
                const detailsHtml = Array.isArray(validationResult.details)
                    ? `<ul class="validation-details">
                        ${validationResult.details.map(detail => `<li>${detail}</li>`).join('')}
                       </ul>`
                    : `<div class="mt-1">${validationResult.details}</div>`;
                
                $('.invalid-feedback').html(`
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                        <strong>${validationResult.error}</strong>
                        ${detailsHtml}
                    </div>
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

    function processInput() {
        const jsonInput = jsonEditor.textContent.trim();
        if (!jsonInput) {
            updateValidationUI({ isValid: false, error: 'Input is empty' }, true);
            document.getElementById('previewContainer').innerHTML = '';
            return;
        }

        try {
            const credential = JSON.parse(jsonInput);
            
            // Validate the credential
            const validationResult = validateVC(jsonInput);
            updateValidationUI(validationResult, true);
            
            if (!validationResult.isValid) {
                // Clear only the preview if validation fails
                document.getElementById('previewContainer').innerHTML = '';
                return;
            }
            
            const selectedTheme = $('#themeSelect').val();
            const outputElement = document.getElementById('previewContainer');
            
            // Clear previous output
            outputElement.innerHTML = '';
            
            // Get theme and render
            const ThemeClass = BaseTheme.getTheme(selectedTheme);
            if (!ThemeClass) {
                updateValidationUI({
                    isValid: false,
                    error: 'Theme Error',
                    details: `No theme found for credential type: ${credential.type[credential.type.length - 1]}`
                }, true);
                return;
            }
            
            const theme = new ThemeClass(credential);
            const rendered = theme.render();
            outputElement.appendChild(rendered);
            
        } catch (error) {
            // Update validation UI with error but don't clear it
            updateValidationUI({
                isValid: false,
                error: 'Invalid JSON format',
                details: error.message
            }, true);
            // Clear only the preview on error
            document.getElementById('previewContainer').innerHTML = '';
        }
    }

    // Handle editor input events
    jsonEditor.addEventListener('input', function() {
        hasUserInput = true; // Set flag when user types
        
        // Clear existing timeout
        clearTimeout(validationTimeout);
        
        // Set new timeout for validation
        validationTimeout = setTimeout(() => {
            const jsonInput = jsonEditor.textContent.trim();
            
            // Only validate if user has interacted
            if (hasUserInput) {
                const validationResult = validateVC(jsonInput);
                updateValidationUI(validationResult, true);
                
                // Only attempt to process and render if validation passes
                if (validationResult.isValid) {
                    processInput();
                } else {
                    // Just clear the preview, leaving validation messages visible
                    document.getElementById('previewContainer').innerHTML = '';
                }
            }
        }, 500);
    });

    // Update validation feedback elements if they don't exist
    if (!$('.validation-feedback').length) {
        $('.card').after(`
            <div class="validation-feedback">
                <div class="valid-feedback">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Valid Verifiable Credential</strong>
                    </div>
                </div>
                <div class="invalid-feedback"></div>
            </div>
        `);
    }

    // Style the validation feedback
    $('<style>')
        .text(`
            .editor-container { position: relative; }
            .validation-feedback {
                padding: 0.75rem;
                border-radius: 0.5rem;
                margin-top: 1.5rem;
                background: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                display: none;
            }
            .validation-feedback.show {
                display: block;
            }
            .validation-feedback i {
                margin-right: 0.5rem;
                font-size: 1.1em;
            }
            .validation-details {
                padding-left: 1.5rem;
                margin-top: 0.5rem;
                font-size: 0.9em;
            }
            .validation-feedback.is-valid .valid-feedback { display: flex !important; }
            .validation-feedback.is-valid .invalid-feedback { display: none !important; }
            .validation-feedback.is-invalid .valid-feedback { display: none !important; }
            .validation-feedback.is-invalid .invalid-feedback { display: flex !important; }
        `)
        .appendTo('head');

    // Handle example buttons
    $('#universityExample').on('click', function() {
        hasUserInput = true; // Set flag when example is loaded
        const example = window.examples['UniversityDegreeCredential'];
        updateEditor(example);
        const result = validateVC(JSON.stringify(example));
        updateValidationUI(result, true);
        if (result.isValid) {
            updateThemeSelect(example);
            processInput();
        }
    });

    $('#driverLicenseExample').on('click', function() {
        hasUserInput = true; // Set flag when example is loaded
        const example = window.examples['BelgianDriverLicenseCredential'];
        updateEditor(example);
        const result = validateVC(JSON.stringify(example));
        updateValidationUI(result, true);
        if (result.isValid) {
            updateThemeSelect(example);
            processInput();
        }
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

    // Add theme select change handler
    $('#themeSelect').change(function() {
        processInput();
    });

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
        $('#previewContainer').prepend(errorHtml);
        $('#outputCard').removeClass('d-none');
    }

    // Update example loading to use new editor
    $('#loadUniversityExample').click(function() {
        logger.debug('Loading university degree example');
        const example = examples['UniversityDegreeCredential'];
        if (example) {
            updateEditor(example);
            const result = validateVC(JSON.stringify(example));
            updateValidationUI(result);
            if (result.isValid) {
                updateThemeSelect(example);
                processInput();
            }
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
            const result = validateVC(JSON.stringify(example));
            updateValidationUI(result);
            if (result.isValid) {
                updateThemeSelect(example);
                processInput();
            }
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

        const $output = $('#previewContainer');
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
        
        const $output = $('#previewContainer');
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

    // Initial state - don't show validation feedback
    $('.validation-feedback').removeClass('show');
}); 