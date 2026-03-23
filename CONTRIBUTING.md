# Contributing to Torqvio

Thank you for your interest in contributing. Here's how to get involved.

---

## Branches

| Branch    | Purpose                          |
|-----------|----------------------------------|
| `main`    | Production-ready, protected      |
| `dev`     | Active development — PRs go here |
| `feature/*` | New features                   |
| `fix/*`   | Bug fixes                        |

**Never push directly to `main`.** Open a PR against `dev`.

---

## Workflow

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run linting and tests:
   ```bash
   # Backend
   cd backend && npm run lint && npm test

   # Frontend
   cd frontend && npm run lint
   ```
5. Commit with a clear message: `git commit -m "feat: add X"`
6. Push and open a PR against `dev`

---

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new workflow trigger type
fix: resolve execution timeout bug
docs: update API reference
refactor: simplify scheduler logic
chore: update dependencies
```

---

## Code Style

- Backend: TypeScript, ESLint + Prettier (run `npm run format`)
- Frontend: TypeScript, ESLint (run `npm run lint`)
- Keep PRs focused — one feature or fix per PR

---

## Reporting Bugs

Open an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml). Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, Docker version)

---

## Suggesting Features

Open an issue using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml).

---

## Questions

Open a GitHub Discussion or an issue tagged `question`.
