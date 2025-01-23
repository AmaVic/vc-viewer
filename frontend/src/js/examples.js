// Example credentials
const examples = {
    'UniversityDegreeCredential': {
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
    },
    'BelgianDriverLicenseCredential': {
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
    }
};

// Make examples available globally
window.examples = examples;

// Function to load example based on type
function loadExample(type) {
    return examples[type] || null;
} 