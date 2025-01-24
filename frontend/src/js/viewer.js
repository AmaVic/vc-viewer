// Initialize editor
const jsonEditor = document.getElementById('jsonEditor');
if (jsonEditor) {
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

    // Handle paste events to format JSON
    jsonEditor.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        updateEditor(text);
    });
}

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