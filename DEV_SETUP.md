# Developer Setup Guide

🚀 **Welcome to Kanade Development!** This guide will help you set up your local development environment for contributing to the Kanade anime streaming application.

## 📋 Prerequisites

Before you begin, ensure you have the following tools installed on your system:

### Required Tools

- **Node.js** (>= 18.0.0)
  - Download from: https://nodejs.org/
  - We recommend using the LTS version
  - Verify installation: `node --version`

- **npm** (>= 10.2.0)
  - Comes bundled with Node.js
  - Verify installation: `npm --version`

- **Git**
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

### Recommended Tools

- **Visual Studio Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Turbo Console Log
  - Auto Rename Tag

## 🏗️ Project Structure

Kanade is organized as a monorepo using workspaces:

```
kanade/
├── apps/
│   └── web/              # Next.js web application
│       ├── src/
│       ├── package.json
│       └── ...
├── packages/
│   └── ui/               # Shared UI components
│       ├── src/
│       ├── package.json
│       └── ...
├── package.json          # Root package.json with workspace scripts
├── turbo.json           # Turborepo configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc.json     # Prettier configuration
└── tsconfig.json        # TypeScript configuration
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Darshil0305/kanade.git
cd kanade
```

### 2. Install Dependencies

```bash
# Install all dependencies for root and workspaces
npm install
```

This will install dependencies for:
- Root project
- `apps/web` workspace
- `packages/ui` workspace

### 3. Set up Environment Variables

```bash
# Copy environment template (if available)
cp .env.example .env.local

# Edit .env.local with your configuration
# Add any required API keys or configuration
```

### 4. Start Development Server

```bash
# Start all development servers in parallel
npm run dev

# This will start:
# - Web app at http://localhost:3000
# - UI package in watch mode
```

## 📜 Available Scripts

### Root Level Scripts

Run these from the project root (`./`):

```bash
# Development
npm run dev          # Start all workspaces in development mode
npm run build        # Build all workspaces for production
npm run start        # Start production build (web app only)

# Code Quality
npm run lint         # Lint all workspaces
npm run type-check   # Type check all TypeScript files
npm run format       # Format code with Prettier

# Maintenance
npm run clean        # Clean all build outputs
```

### Workspace-Specific Scripts

#### Web App (`apps/web`)

```bash
# Navigate to web workspace
cd apps/web

# Available scripts:
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint web app
npm run type-check   # Type check web app
```

#### UI Package (`packages/ui`)

```bash
# Navigate to UI workspace
cd packages/ui

# Available scripts:
npm run build        # Build UI components
npm run dev          # Build in watch mode
npm run lint         # Lint UI components
npm run type-check   # Type check UI components
```

## 🔧 Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Run quality checks:**
   ```bash
   npm run lint        # Check for linting errors
   npm run type-check  # Check for TypeScript errors
   npm run format      # Format code
   ```

4. **Test your changes:**
   ```bash
   npm run build       # Ensure everything builds
   npm run dev         # Test in development mode
   ```

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   git push origin feature/your-feature-name
   ```

### Code Style

- **ESLint**: Configured for TypeScript, React, and Next.js
- **Prettier**: Handles code formatting automatically
- **TypeScript**: Strict mode enabled for type safety

Run `npm run format` before committing to ensure consistent code style.

## 🌐 API Integration

Kanade uses the HiAnime API for anime data:

- **API Base URL**: `https://hianime-api-qdks.onrender.com/api/v1`
- **Documentation**: https://github.com/yahyaMomin/hianime-API
- **Rate Limiting**: Be mindful of API rate limits during development

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- --port 3001
```

#### Node Modules Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Restart TypeScript server in VS Code
# Command Palette > TypeScript: Restart TS Server
```

#### Build Failures
```bash
# Clean and rebuild
npm run clean
npm run build
```

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/docs/
- **Turborepo Documentation**: https://turbo.build/repo/docs
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs

## 💡 Tips for Contributors

1. **Keep commits atomic**: One logical change per commit
2. **Use conventional commits**: `feat:`, `fix:`, `chore:`, etc.
3. **Test thoroughly**: Run all quality checks before pushing
4. **Update documentation**: Keep README and docs up to date
5. **Ask questions**: Don't hesitate to open issues for clarification

## 🤝 Getting Help

If you encounter any issues:

1. Check this documentation first
2. Search existing [GitHub Issues](https://github.com/Darshil0305/kanade/issues)
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - System information (OS, Node version, etc.)
   - Error messages or logs

---

**Happy coding! 🎌** Welcome to the Kanade development community!
