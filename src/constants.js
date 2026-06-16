export const COMMIT_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "test",
  "chore",
  "perf",
  "ci"
];

export const PRIORITY_ORDER = [
  "feat",
  "fix",
  "perf",
  "refactor",
  "test",
  "docs",
  "style",
  "chore",
  "ci"
];

export const DEFAULT_SCOPE_MAPPING = {
  "src/auth/": "auth",
  "src/users/": "users",
  "src/components/": "ui",
  "src/pages/": "page",
  "src/api/": "api",
  "src/utils/": "utils",
  "src/config/": "config",
  "tests/": "test",
  "docs/": "docs",
  ".github/workflows/": "ci"
};

export const SUPPORTED_LANGUAGES = ["en", "id"];

export function createEmptyScores() {
  return Object.fromEntries(COMMIT_TYPES.map((type) => [type, 0]));
}
