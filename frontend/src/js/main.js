$(document).ready(function() {
    // Setup console logging with timestamp
    const logger = {
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

    const credentialTemplates = {
        // Default template for unknown credential types
        'default': function(credential) {
            logger.debug('Using default template for credential', credential);
            const template = document.getElementById('defaultCredentialTemplate');
            const clone = document.importNode(template.content, true);
            
            // Set basic credential info
            clone.querySelector('.card-title').textContent = credential.type.join(', ');
            clone.querySelector('.card-text:nth-child(1)').innerHTML = 
                `<strong>Issuer:</strong> ${typeof credential.issuer === 'string' ? credential.issuer : credential.issuer.id || 'Unknown'}`;
            clone.querySelector('.card-text:nth-child(2)').innerHTML = 
                `<strong>Issuance Date:</strong> ${new Date(credential.issuanceDate).toLocaleDateString()}`;
            
            // Handle credential subject
            const subjectDiv = clone.querySelector('.credential-subject');
            const subject = credential.credentialSubject;
            
            Object.entries(subject).forEach(([key, value]) => {
                if (key !== 'id') {
                    const p = document.createElement('p');
                    p.className = 'card-text';
                    p.innerHTML = `<strong>${key}:</strong> ${JSON.stringify(value, null, 2)}`;
                    subjectDiv.appendChild(p);
                }
            });
            
            return clone;
        },
        
        // University Degree Credential template
        'UniversityDegreeCredential': function(credential) {
            logger.debug('Using UniversityDegreeCredential template for credential', credential);
            const template = document.getElementById('universityDegreeTemplate');
            const clone = document.importNode(template.content, true);
            
            try {
                // Extract degree information
                const degree = credential.credentialSubject.degree || {};
                const recipientId = credential.credentialSubject.id || 'Unknown';
                
                // Set degree title and type
                clone.querySelector('.degree-title').textContent = degree.name || 'Degree';
                clone.querySelector('.degree-type').textContent = degree.type || '';
                
                // Set recipient information
                const shortRecipientId = recipientId.length > 30 
                    ? recipientId.substring(0, 15) + '...' + recipientId.substring(recipientId.length - 15)
                    : recipientId;
                clone.querySelector('.recipient-id').textContent = shortRecipientId;
                
                // Set recipient name if available
                if (credential.credentialSubject.name) {
                    const nameElem = document.createElement('div');
                    nameElem.className = 'row mb-3';
                    nameElem.innerHTML = `
                        <div class="col-sm-4"><strong>Recipient Name:</strong></div>
                        <div class="col-sm-8">${credential.credentialSubject.name}</div>
                    `;
                    clone.querySelector('.degree-details').appendChild(nameElem);
                }
                
                // Set issuer information
                const issuerName = typeof credential.issuer === 'string' 
                    ? credential.issuer 
                    : credential.issuer.name || credential.issuer.id || 'Unknown Institution';
                clone.querySelector('.issuer-name').textContent = issuerName;
                
                // Format and set issuance date
                const issuanceDate = new Date(credential.issuanceDate);
                const formattedDate = issuanceDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                clone.querySelector('.issuance-date').textContent = formattedDate;
                
                // Add additional degree details if available
                const degreeDetails = clone.querySelector('.degree-details');
                
                if (degree.major) {
                    const majorElem = document.createElement('div');
                    majorElem.className = 'row mb-3';
                    majorElem.innerHTML = `
                        <div class="col-sm-4"><strong>Major:</strong></div>
                        <div class="col-sm-8">${degree.major}</div>
                    `;
                    degreeDetails.appendChild(majorElem);
                }

                if (degree.minor) {
                    const minorElem = document.createElement('div');
                    minorElem.className = 'row mb-3';
                    minorElem.innerHTML = `
                        <div class="col-sm-4"><strong>Minor:</strong></div>
                        <div class="col-sm-8">${degree.minor}</div>
                    `;
                    degreeDetails.appendChild(minorElem);
                }

                if (degree.gpa) {
                    const gpaElem = document.createElement('div');
                    gpaElem.className = 'row mb-3';
                    gpaElem.innerHTML = `
                        <div class="col-sm-4"><strong>GPA:</strong></div>
                        <div class="col-sm-8">${degree.gpa}</div>
                    `;
                    degreeDetails.appendChild(gpaElem);
                }

                if (degree.honors) {
                    const honorsElem = document.createElement('div');
                    honorsElem.className = 'row mb-3';
                    honorsElem.innerHTML = `
                        <div class="col-sm-4"><strong>Honors:</strong></div>
                        <div class="col-sm-8">${Array.isArray(degree.honors) ? degree.honors.join(', ') : degree.honors}</div>
                    `;
                    degreeDetails.appendChild(honorsElem);
                }

                if (degree.graduationDate) {
                    const gradDate = new Date(degree.graduationDate);
                    const formattedGradDate = gradDate.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    const gradDateElem = document.createElement('div');
                    gradDateElem.className = 'row mb-3';
                    gradDateElem.innerHTML = `
                        <div class="col-sm-4"><strong>Graduation Date:</strong></div>
                        <div class="col-sm-8">${formattedGradDate}</div>
                    `;
                    degreeDetails.appendChild(gradDateElem);
                }
                
                // Set credential ID if present
                if (credential.id) {
                    clone.querySelector('.credential-id').textContent = `Credential ID: ${credential.id}`;
                }
            } catch (error) {
                logger.error('Error processing UniversityDegreeCredential', error);
                throw error;
            }
            
            return clone;
        }
    };

    function displayCredential(credential) {
        logger.info('Displaying credential', credential);
        const output = $('#output');
        output.empty();
        
        try {
            // Validate credential
            if (!credential.type || !Array.isArray(credential.type)) {
                throw new Error('Invalid credential: missing or invalid type');
            }
            
            // Determine which template to use based on credential type
            const templateName = credential.type.find(t => credentialTemplates[t]) || 'default';
            logger.debug(`Selected template: ${templateName}`);
            const template = credentialTemplates[templateName];
            
            output.append(template(credential));
        } catch (error) {
            logger.error('Error displaying credential', error);
            showError('Error displaying credential: ' + error.message);
        }
    }

    function displayPresentation(presentation) {
        logger.info('Displaying presentation', presentation);
        const output = $('#output');
        output.empty();
        
        try {
            if (!presentation.verifiableCredential || !Array.isArray(presentation.verifiableCredential)) {
                throw new Error('Invalid presentation: no credentials found');
            }
            
            presentation.verifiableCredential.forEach((credential, index) => {
                logger.debug(`Processing credential ${index + 1}/${presentation.verifiableCredential.length}`);
                const templateName = credential.type.find(t => credentialTemplates[t]) || 'default';
                const template = credentialTemplates[templateName];
                output.append(template(credential));
            });
        } catch (error) {
            logger.error('Error displaying presentation', error);
            showError('Error displaying presentation: ' + error.message);
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
                    displayCredential(response);
                } else {
                    displayPresentation(response);
                }
            },
            error: function(xhr, status, error) {
                logger.error('Server request failed', { status, error, response: xhr.responseText });
                let errorMessage = 'Error processing the input';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = response.error || errorMessage;
                } catch (e) {
                    // If response is not JSON, use the error string
                    errorMessage = error || errorMessage;
                }
                showError(errorMessage);
            }
        });
    });

    // Example university degree credential
    const exampleCredential = {
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

    // Add example button to the UI
    $('<button>')
        .addClass('btn btn-secondary ms-2')
        .text('Load Example')
        .click(function() {
            logger.debug('Loading example credential');
            $('#inputType').val('credential');
            $('#jsonInput').val(JSON.stringify(exampleCredential, null, 2));
        })
        .insertAfter('#processBtn');
}); 