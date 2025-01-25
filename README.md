# VC Viewer 🎨

A beautiful, open-source tool for visualizing W3C Verifiable Credentials with customizable themes.

## Features ✨

- 🔒 **Privacy First**: All processing happens client-side. Your credentials never leave your browser.
- 🎨 **Customizable Themes**: Choose from pre-built themes or create your own to match your brand.
- 🚀 **High Performance**: Built with Rust and modern web technologies for optimal speed.
- 🌐 **Standards Compliant**: Full support for W3C Verifiable Credentials Data Model.
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices.
- 🆓 **Free and Open Source**: No ads, no premium features, no catch.

## Quick Start 🚀

Visit [VC Viewer](https://vcviewer.example.com) to start using the tool immediately, or run it locally:

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

The application will be available at `http://localhost:8080`.

## Development 🛠️

### Prerequisites

- Rust 1.70 or later
- Node.js 18 or later (for frontend development)
- Git

### Backend Development

```bash
cd backend
cargo test        # Run tests
cargo doc         # Generate documentation
cargo run         # Run in development mode
```

### Frontend Development

```bash
cd frontend
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production
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

---

<div align="center">
Made with ❤️ for the Verifiable Credentials community
</div> 