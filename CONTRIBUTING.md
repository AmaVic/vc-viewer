# Contributing to VC Viewer

Thank you for your interest in contributing to VC Viewer! We aim to make verifiable credentials more accessible and visually appealing, and we welcome contributions from the community.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Creating Themes](#creating-themes)
- [Submitting Changes](#submitting-changes)
- [Bug Reports](#bug-reports)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vc-viewer.git
   cd vc-viewer
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/AmaVic/vc-viewer.git
   ```

## Development Setup

### Prerequisites
- Rust 1.84.0 or higher
- Cargo 1.84.0 or higher
- Node.js 22.11.0 or higher
- npm 10.9.0 or higher

### Setting Up the Development Environment
1. Clean the project (if needed):
   ```bash
   ./clean.sh
   ```

2. Build the project:
   ```bash
   ./build.sh
   ```

3. Run the application:
   ```bash
   ./run.sh
   ```

The application will be available at `http://localhost:8080`.

## Contributing Guidelines

### Code Style
- Follow the Rust style guide and use `rustfmt`
- Use meaningful variable and function names
- Comment complex logic and maintain documentation
- Keep functions focused and modular
- Write tests for new functionality

### Commit Messages
- Use clear and descriptive commit messages
- Start with a verb in the present tense
- Keep the first line under 50 characters
- Add detailed description if needed

Example:
```
Add modern university degree theme

- Implement new theme with responsive design
- Add support for optional degree fields
- Include documentation and examples
```

## Creating Themes

Themes are a great way to contribute to VC Viewer. To create a new theme:

1. Follow our [Theme Creation Guide](https://vc-viewer.vamaralds.be/docs/create-theme)
2. Ensure your theme includes:
   - Required theme methods implementation
   - Proper CSS styling
   - Documentation (README.md in theme directory)
   - Example credentials
   - Tests

### Theme Structure
```
frontend/src/themes/[CredentialType]/[theme-name]/
├── ThemeName.js
├── style.css
├── README.md
└── screenshots/
    ├── default.png
    └── mobile.png
```

## Submitting Changes

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Add your commit message"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request:
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all tests pass
   - Update documentation if needed

## Bug Reports

When reporting bugs:
1. Use the GitHub issue tracker
2. Include steps to reproduce
3. Provide expected vs actual behavior
4. Include browser/environment details
5. Add screenshots if applicable

## Areas for Contribution

We welcome contributions in these areas:
- 🎨 New themes
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🧪 Test coverage improvements
- ⚡ Performance optimizations

## Questions?

If you have questions:
1. Check the [documentation](https://vc-viewer.vamaralds.be/docs)
2. Open a GitHub issue
3. Reach out on [LinkedIn](https://www.linkedin.com/in/victor-amaral-de-sousa/)

Thank you for contributing to VC Viewer! 🎉 