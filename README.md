# MalGit

MalGit is a Node.js CLI that generates Conventional Commit messages from staged Git changes. syahrul efendi

## Install

```bash
npm install
npm link
```

## Commands

```bash
malgit suggest
malgit suggest --lang id
malgit explain
malgit commit
malgit commit --dry-run
malgit commit --yes
malgit config set language id
```

## Behavior

- Reads `git diff --staged` and `git status --short`.
- Parses only file paths, file status, added lines, and removed lines.
- Uses scoring rules to classify changes into Conventional Commit types.
- Shows multiple suggestions when confidence is below `70%`.
- Always asks for confirmation before `malgit commit`, unless `--yes` is used.
- Supports English (`en`) and Indonesian (`id`) descriptions.

## Config

MalGit reads `.malgitrc` from the current directory:

```json
{
  "language": "en",
  "defaultMode": "staged",
  "confirmBeforeCommit": true,
  "scopeMapping": {
    "src/auth/": "auth",
    "src/payment/": "payment"
  }
}
```
