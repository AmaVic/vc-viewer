# VC Viewer

A minimalistic web application for visualizing W3C Verifiable Credentials and Verifiable Presentations.

## Features

- Support for both Verifiable Credentials and Verifiable Presentations
- Clean and intuitive user interface
- Dynamic card-based visualization
- Support for different credential types with customizable templates
- Example credential loader for testing

## Project Structure

```
vc-viewer/
├── backend/                 # Rust backend
│   ├── src/
│   │   └── main.rs         # Main server code
│   ├── Cargo.toml          # Rust dependencies
│   └── Cargo.lock
│
├── frontend/               # Frontend assets
│   ├── public/            # Static public files
│   └── src/
│       ├── css/           # Stylesheets
│       │   └── styles.css
│       ├── js/            # JavaScript files
│       │   └── main.js
│       └── templates/     # HTML templates
│           └── index.html
│
└── README.md
```

## Prerequisites

- Rust (latest stable version)
- Cargo (comes with Rust)
- A modern web browser

## Setup

1. Clone the repository:
```bash
git clone https://github.com/AmaVic/vc-viewer.git
cd vc-viewer
```

2. Build and run the backend:
```bash
cd backend
cargo build --release
cargo run --release
```

The application will be available at `http://localhost:8080`

## Development

### Backend Development
- The backend is built with Rust and Actix-web
- Main server code is in `backend/src/main.rs`
- Dependencies are managed in `backend/Cargo.toml`

### Frontend Development
- Pure HTML/JS/CSS implementation
- Bootstrap 5 for UI components
- jQuery for DOM manipulation and AJAX
- Organized in `frontend/src/`:
  - `css/`: Stylesheets
  - `js/`: JavaScript files
  - `templates/`: HTML templates

## Usage

1. Select the input type (Verifiable Credential or Verifiable Presentation)
2. Paste your JSON input into the text area
3. Click "Process" to visualize the credential(s)
4. Use the "Load Example" button to test the application with a sample credential

## Supported Credential Types

1. UniversityDegreeCredential
   - Comprehensive degree information
   - Academic details (GPA, honors, etc.)
   - Institution information
   - Student details

2. Default Template (fallback)
   - Generic visualization for unsupported types
   - Displays all credential fields

## Technologies Used

- Backend:
  - Rust
  - Actix-web framework
  - Serde for JSON handling
  - Logging with env_logger

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Bootstrap 5
  - jQuery
  - Font Awesome icons

## License

MIT 