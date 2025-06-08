# Web Video Translator

[![CI](https://github.com/maye-msft/web-video-translator/actions/workflows/test.yml/badge.svg)](https://github.com/maye-msft/web-video-translator/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/maye-msft/web-video-translator/branch/main/graph/badge.svg)](https://codecov.io/gh/maye-msft/web-video-translator)
[![Last Commit](https://img.shields.io/github/last-commit/maye-msft/web-video-translator)](https://github.com/maye-msft/web-video-translator/commits/main)

A web-based application for video subtitle extraction, translation, and merging using WebAssembly and transformer.js models.

## 🚀 Live Demo

**[Try the Application](https://maye-msft.github.io/web-video-translator/)**

[GitHub Repository](https://github.com/maye-msft/web-video-translator)

## Features

- Extract subtitles from video files
- Edit SRT content directly in the browser
- Translate subtitles to different languages
- Save subtitles as files
- Generate new videos with translated subtitles embedded
- Model caching with progress indicators
- Clean and compact UI built with Tailwind CSS

## Development Setup

### Prerequisites

- Node.js 18+ with Corepack enabled
- VS Code (recommended for devcontainer support)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-video-translator
   ```

2. **Enable Corepack and install dependencies**
   ```bash
   corepack enable
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Development Container

This project includes a devcontainer configuration for consistent development environments:

1. Open the project in VS Code
2. Install the "Dev Containers" extension
3. Press `F1` and select "Dev Containers: Reopen in Container"

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run unit tests with Vitest
- `yarn e2e` - Run end-to-end tests with Playwright
- `yarn e2e:ui` - Run Playwright tests with UI
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues automatically
- `yarn format` - Format code with Prettier
- `yarn type-check` - Check TypeScript types

### Testing

#### Unit Tests
```bash
yarn test
```

#### End-to-End Tests
```bash
# Install Playwright browsers (first time only)
yarn playwright install

# Run tests
yarn e2e
```

### Project Structure

```
web-video-translator/
├── .devcontainer/          # Development container configuration
├── .github/                # GitHub workflows
├── dist/                   # Production build output
├── e2e/                    # End-to-end tests
├── public/                 # Static assets
├── src/                    # Source code
├── tests/                  # Unit tests
├── userstories/            # Project user stories
└── index.html              # Application entry point
```

## Technology Stack

- **Frontend**: Vanilla TypeScript with Vite
- **Styling**: Tailwind CSS
- **Video Processing**: FFmpeg WebAssembly
- **Machine Learning**: Hugging Face Transformers.js
- **Testing**: Vitest (unit), Playwright (e2e)
- **Development**: ESLint, Prettier, TypeScript

## License

This project is licensed under the MIT License.