# VC Viewer 🎨
[![Build](https://github.com/AmaVic/vc-viewer/actions/workflows/build.yml/badge.svg)](https://github.com/AmaVic/vc-viewer/actions/workflows/build.yml) [![Test](https://github.com/AmaVic/vc-viewer/actions/workflows/test.yml/badge.svg)](https://github.com/AmaVic/vc-viewer/actions/workflows/test.yml) [![Docs](https://github.com/AmaVic/vc-viewer/actions/workflows/docs.yml/badge.svg)](https://github.com/AmaVic/vc-viewer/actions/workflows/docs.yml)

A beautiful, open-source tool for visualizing W3C Verifiable Credentials with customizable themes.

## Features ✨

- 🔒 **Privacy First**: All processing happens client-side. Your credentials never leave your browser.
- 🎨 **Customizable Themes**: Choose from pre-built themes or create your own to match your brand.
- 🚀 **High Performance**: Built with Rust and modern web technologies for optimal speed.
- 🌐 **Standards Compliant**: (Partial) support for W3C Verifiable Credentials Data Model.
- 🆓 **Free and Open Source**: No ads, no premium features, no catch.

## Quick Start 🚀

Visit [VC Viewer](https://vc-viewer.vamaralds.be) to start using the tool immediately, or run it locally using one of these methods:

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
More details in the [documentation](https://vc-viewer.vamaralds.be/docs).

```bash
# Clone the repository
git clone https://github.com/yourusername/vc-viewer.git
cd vc-viewer

# Clean the app (if needed)
sh ./clean.sh

# Build back-end and front-end
sh ./build.sh

# Run the application
sh ./run.sh
```

## Creating Themes 🎨

Themes are CSS files that define how your credentials are displayed. To create a new theme, check out our [Theme Creation Guide](https://vc-viewer.vamaralds.be/docs/create-theme).

## Contributing 🤝

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution

- 🎨 New themes
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements

## Security 🔒

- All credential processing happens client-side
- No credential data is ever sent to any server
- No tracking or analytics

**Warning**: This is a side project in alpha version. Use at your own risk.


## Documentation 📚

- [User Guide](https://vc-viewer.vamaralds.be/docs)
- [Theme Creation Guide](https://vcviewer.example.com/docs/create-theme)
- [Privacy Policy](https://vcviewer.example.com/privacy)
- [Cookie Policy](https://vcviewer.example.com/cookies)

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ for the Verifiable Credentials community
</div> 