# Modern University Theme

A sleek and modern design for university degree credentials, featuring a clean layout and responsive design.

## Features

- Clean, modern layout with card-based design
- Support for university logos and degree icons
- Responsive grid layout for credential information
- Proper handling of optional fields (honors, GPA, minor)
- Accessible design with proper ARIA labels
- Fallback handling for missing data

## Supported Credential Types

- `UniversityDegreeCredential`

## Supported Fields

### Required Fields
- `credentialSubject.name` - Recipient's name
- `credentialSubject.id` - Recipient's identifier
- `credentialSubject.degree.name` - Name of the degree
- `credentialSubject.degree.type` - Type of degree (e.g., "Bachelor of Science")
- `issuanceDate` - When the credential was issued
- `issuer` - Issuing institution

### Optional Fields
- `credentialSubject.degree.major` - Major field of study
- `credentialSubject.degree.minor` - Minor field of study
- `credentialSubject.degree.gpa` - Grade Point Average
- `credentialSubject.degree.honors` - Honors or achievements (string or array)
- `credentialSubject.degree.graduationDate` - Date of graduation
- `credentialSubject.degree.image` - Custom degree icon URL
- `credentialSubject.degree.universityLogo` - University logo URL

## Example Credential

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": ["VerifiableCredential", "UniversityDegreeCredential"],
  "issuer": {
    "id": "did:example:123",
    "name": "Example University"
  },
  "issuanceDate": "2024-01-24T00:00:00Z",
  "credentialSubject": {
    "id": "did:example:456",
    "name": "John Doe",
    "degree": {
      "type": "Bachelor of Science",
      "name": "Computer Science",
      "major": "Computer Science",
      "minor": "Mathematics",
      "gpa": "3.8",
      "honors": ["Magna Cum Laude", "Dean's List"],
      "graduationDate": "2024-05-15",
      "image": "https://example.com/degree-icon.png",
      "universityLogo": "https://example.com/university-logo.png"
    }
  }
}
```

## Screenshots

### Default View
![Default Theme View](./screenshots/default.png)

### With Optional Fields
![Theme with All Fields](./screenshots/full.png)

### Mobile View
![Mobile Layout](./screenshots/mobile.png)

## Development

### Building
```bash
npm install
npm run build
```

### Testing
Test the theme with various credential data:
```bash
npm test
```

## Contributing

Feel free to submit issues and enhancement requests! 