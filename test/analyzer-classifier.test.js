import test from "node:test";
import assert from "node:assert/strict";
import { analyzeChanges } from "../src/analyzer/change-analyzer.js";
import { classifyCommit } from "../src/classifier/commit-classifier.js";
import { DEFAULT_CONFIG } from "../src/config/config-reader.js";
import { generateMessage } from "../src/generator/message-generator.js";

test("classifies auth verification as feature with auth scope", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/auth/service.ts",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["const verifyEmail = async () => {}"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "feat");
  assert.equal(classification.scope, "auth");
  assert.equal(suggestion.message, "feat(auth): add email verification");
});

test("supports Indonesian description formatting", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/auth/service.ts",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["const verifyEmail = async () => {}"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "id");

  assert.equal(suggestion.message, "feat(auth): menambahkan verifikasi email");
});

test("uses priority order when scores tie", () => {
  const classification = classifyCommit({
    dominantScope: "auth",
    confidence: 0.5,
    globalScores: {
      feat: 2,
      fix: 2,
      docs: 0,
      style: 0,
      refactor: 0,
      test: 0,
      chore: 0,
      perf: 0,
      ci: 0
    }
  });

  assert.equal(classification.type, "feat");
  assert.equal(classification.lowConfidence, true);
});

test("keeps feature target when source and README change together", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/auth/service.ts",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["const verifyEmail = async () => {}"],
        removedLines: []
      },
      {
        path: "README.md",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["## Email verification"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "feat");
  assert.equal(suggestion.message, "feat(auth): add email verification");
});

test("describes README intro changes as project description", () => {
  const parsedDiff = {
    files: [
      {
        path: "README.md",
        status: "modified",
        additions: 1,
        deletions: 1,
        addedLines: ["MalGit generates Conventional Commit messages for staged changes."],
        removedLines: ["MalGit is a CLI."]
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "docs");
  assert.equal(suggestion.message, "docs(readme): update project description");
});

test("detects author information in README changes", () => {
  const parsedDiff = {
    files: [
      {
        path: "README.md",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["Author: Syahrul Efendi"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(suggestion.message, "docs(readme): update author information");
});

test("detects installation guide in README changes", () => {
  const parsedDiff = {
    files: [
      {
        path: "README.md",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["npm install -g malgit"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "id");

  assert.equal(suggestion.message, "docs(readme): memperbarui panduan instalasi");
});

test("classifies validation error handling as fix", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/auth/validation.js",
        status: "added",
        additions: 1,
        deletions: 0,
        addedLines: ["try { return validateEmail(email); } catch (error) { return false; }"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "fix");
  assert.equal(suggestion.message, "fix(auth): fix validation handling");
});

test("classifies test files as test with high confidence", () => {
  const parsedDiff = {
    files: [
      {
        path: "tests/auth.test.js",
        status: "added",
        additions: 1,
        deletions: 0,
        addedLines: ["test(\"validates email\", () => {})"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "test");
  assert.equal(classification.lowConfidence, false);
  assert.equal(suggestion.message, "test(test): update test cases");
});

test("classifies workflow files as ci with high confidence", () => {
  const parsedDiff = {
    files: [
      {
        path: ".github/workflows/ci.yml",
        status: "added",
        additions: 1,
        deletions: 0,
        addedLines: ["name: CI"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "ci");
  assert.equal(classification.lowConfidence, false);
  assert.equal(suggestion.message, "ci(ci): update workflow");
});

test("classifies cache optimization as perf", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/cache/user-cache.js",
        status: "added",
        additions: 1,
        deletions: 0,
        addedLines: ["const cache = new Map();"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "perf");
  assert.equal(classification.lowConfidence, false);
  assert.equal(suggestion.message, "perf(cache): optimize caching");
});

test("classifies stylesheet changes as style", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/styles/button.css",
        status: "added",
        additions: 1,
        deletions: 0,
        addedLines: [".button { padding: 8px; }"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "style");
  assert.equal(classification.lowConfidence, false);
  assert.equal(suggestion.message, "style(styles): format styles");
});

test("describes deletion-heavy calculation changes as refactor", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/app.js",
        status: "modified",
        additions: 1,
        deletions: 4,
        addedLines: ["return calculateTotal(items);"],
        removedLines: [
          "const subtotal = items.reduce((sum, item) => sum + item.price, 0);",
          "const tax = subtotal * 0.1;",
          "const discount = subtotal > 100 ? 10 : 0;",
          "return subtotal + tax - discount;"
        ]
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "refactor");
  assert.equal(suggestion.message, "refactor: simplify total calculation");
});

test("ignores performance keywords inside string literals", () => {
  const parsedDiff = {
    files: [
      {
        path: "test/generator.test.js",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ['assert.equal(message, "perf(cache): optimize caching");'],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);

  assert.equal(classification.type, "test");
});

test("ignores internal commit type property names while scanning keywords", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/analyzer/file-analyzer.js",
        status: "modified",
        additions: 2,
        deletions: 0,
        addedLines: [
          "if (containsAny(text, PERF_KEYWORDS)) scores.perf += 8;",
          "assert.equal(analysis.globalScores.perf, 0);"
        ],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);

  assert.equal(analysis.globalScores.perf, 0);
});

test("ignores commit type names inside regex literals", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/analyzer/file-analyzer.js",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ['.replace(/\\bscores\\.(feat|fix|docs|style|refactor|test|chore|perf|ci)\\b/g, " ")'],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);

  assert.equal(analysis.globalScores.perf, 0);
});

test("classifies core commit analysis logic changes as feature", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/generator/message-generator.js",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["return detectDocsTarget(files);"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "feat");
  assert.equal(suggestion.message, "feat(generator): add commit message classification");
});
