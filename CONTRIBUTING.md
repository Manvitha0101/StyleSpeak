# Contributing to StyleSpeak

Thank you for considering contributing to StyleSpeak! This document provides guidelines to make the process smooth for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/stylespeek.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run type checks: `cd frontend && npx tsc --noEmit`
6. Commit with a descriptive message: `git commit -m "feat: add Korean fashion term database"`
7. Push and open a Pull Request

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation change
style:    Formatting, no logic change
refactor: Code restructure without behavior change
perf:     Performance improvement
test:     Tests
chore:    Build/tooling changes
```

## Code Standards

- **TypeScript:** All new code must be typed. No `any` without justification.
- **Components:** Keep components focused and under ~200 lines. Split if larger.
- **CSS:** Use existing CSS custom properties from `index.css`. No inline magic numbers.
- **AI Prompts:** Document prompt changes in `geminiService.ts` with a comment explaining the reasoning.
- **Imports:** Use relative imports. No barrel files.

## Areas Open for Contribution

- 🌍 Additional language support (Hindi, Tamil, Telugu fashion terms)
- 🛍️ More Indian shopping platform integrations
- 📱 Mobile responsive improvements
- 🎨 New fashion term categories
- 🔧 FastAPI backend implementation
- 🧪 Unit tests for the Gemini service layer

## Reporting Issues

Use the GitHub issue templates. For bugs, always include:
- Browser and OS
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## Questions?

Open a discussion in the GitHub Discussions tab.
