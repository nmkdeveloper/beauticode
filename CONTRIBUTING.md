# Contributing to BeautiCode

First off, thank you for considering contributing to **BeautiCode**! It's people like you that make BeautiCode a delightful tool for developers everywhere.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported.

When filing an issue, please include:
- A clear, descriptive title.
- Steps to reproduce the behavior.
- Expected vs actual behavior.
- Information about your browser, OS, and screen resolution.
- Any relevant code snippet that triggers the issue.

### Suggesting Enhancements

Feature requests are welcome! Please submit an issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Pull Requests

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes:
   - Ensure anti-slop frontend styling and adherence to the design aesthetic.
   - Write tests for new logic if applicable.
4. Run tests and type checks:
   ```bash
   npm test
   npm run build
   ```
5. Commit your changes with descriptive messages:
   ```bash
   git commit -m "feat: add support for Kotlin syntax and custom watermark"
   ```
6. Push to your branch and submit a Pull Request!

## Development Setup

```bash
# Start local dev server
npm run dev

# Run Vitest test suite
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

Thank you for building with us!
