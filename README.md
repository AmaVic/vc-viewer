# VC Viewer 🎨
[![Build](https://github.com/AmaVic/vc-viewer/actions/workflows/build.yml/badge.svg)](https://github.com/AmaVic/vc-viewer/actions/workflows/build.yml) [![Test](https://github.com/AmaVic/vc-viewer/actions/workflows/test.yml/badge.svg)](https://github.com/AmaVic/vc-viewer/actions/workflows/test.yml) [![Docs](https://github.com/AmaVic/vc-viewer/actions/workflows/docs.yml/badge.svg)](https://github.com/AmaVic/vc-viewer/actions/workflows/docs.yml)

A beautiful, open-source tool for visualizing W3C Verifiable Credentials with customizable themes.

## Features ✨

- 🔒 **Privacy First**: All processing happens client-side. Your credentials never leave your browser.
- 🎨 **Customizable Themes**: Choose from pre-built themes or create your own to match your brand.
- 🚀 **High Performance**: Built with Rust and modern web technologies for optimal speed.
- 🌐 **Standards Compliant**: Full support for W3C Verifiable Credentials Data Model.
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices.
- 🆓 **Free and Open Source**: No ads, no premium features, no catch.

## Quick Start 🚀

Visit [VC Viewer](https://vcviewer.example.com) to start using the tool immediately, or run it locally using one of these methods:

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/vc-viewer.git
cd vc-viewer

# Build and run using Docker Compose
docker compose up --build
```

The application will be available at `http://localhost:8080`.

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vc-viewer.git
cd vc-viewer

# Build and run the backend
cd backend
cargo build --release
cargo run --release

# In another terminal, serve the frontend
cd ../frontend
# Serve using your preferred static file server
```

## Development 🛠️

### Prerequisites

- Rust 1.75 or later
- Node.js 18 or later (for frontend development)
- Git
- Docker (optional, for containerized deployment)

### Backend Development

```bash
cd backend
cargo test        # Run tests
cargo doc         # Generate documentation
cargo run         # Run in development mode
```

### Running with Docker

```bash
# Development mode
docker compose up --build

# Or in detached mode
docker compose up --build -d
```

## Creating Themes 🎨

Themes are CSS files that define how your credentials are displayed. To create a new theme:

1. Visit the [Theme Creation Guide](https://vcviewer.example.com/docs/create-theme)
2. Use our interactive theme builder
3. Download your theme
4. Submit a PR to share it with the community!

## Contributing 🤝

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution

- 🎨 New themes
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🌐 Translations

## Security 🔒

- All credential processing happens client-side
- No data is ever sent to any server
- No tracking or analytics
- Regular security audits

See our [Security Policy](SECURITY.md) for more details.

## Documentation 📚

- [User Guide](https://vcviewer.example.com/docs)
- [API Documentation](https://vcviewer.example.com/docs/api)
- [Theme Creation Guide](https://vcviewer.example.com/docs/create-theme)
- [Privacy Policy](https://vcviewer.example.com/privacy)
- [Cookie Policy](https://vcviewer.example.com/cookies)

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [W3C Verifiable Credentials Working Group](https://www.w3.org/groups/wg/vc)
- All our [contributors](https://github.com/yourusername/vc-viewer/graphs/contributors)

## Deployment 🚀

### CapRover Deployment

The application can be deployed to your CapRover instance using one of these methods:

#### Method 1: One-Click Deploy (Recommended)

1. Log in to your CapRover dashboard
2. Go to Apps → Create New App
3. Enter your app name (e.g., `vc-viewer`)
4. Check "Has Persistent Data" if you plan to store any data
5. Go to the "Deployment" tab
6. Under "Deploy from Github", enter:
   - Repository: `https://github.com/yourusername/vc-viewer`
   - Branch: `main`
   - Username: Your GitHub username
   - Password: Your GitHub personal access token (with repo access)
7. Click "Deploy Now"

The application will be built and deployed automatically. Access it at `https://vc-viewer.your-caprover-domain.com`

#### Method 2: Manual Deploy

If you prefer manual deployment or need more control:

```bash
# Install CapRover CLI if you haven't already
npm install -g caprover

# Login to your CapRover instance
caprover login

# Deploy the application
caprover deploy
```

### Environment Variables

When deploying to CapRover, you might want to configure these environment variables:

- `HOST`: Set to `0.0.0.0` (required for container deployment)
- `PORT`: Usually set by CapRover automatically
- `RUST_LOG`: Set to `info` for production or `debug` for troubleshooting

---

<div align="center">
Made with ❤️ for the Verifiable Credentials community
</div> 